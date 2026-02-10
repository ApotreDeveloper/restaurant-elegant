
import React, { useState, useEffect } from 'react';
import { 
  getNavigationMenu, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  reorderMenuItems,
  NavigationItem 
} from '../../../services/api/navigation';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2, Plus, CheckCircle, XCircle, Globe } from 'lucide-react';
import Button from '../../shared/Button';
import Modal from '../../shared/Modal';
import Input from '../../shared/Input';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { cn } from '../../../utils/cn';

interface SortableNavItemProps {
  item: NavigationItem;
  onEdit: (i: NavigationItem) => void;
  onDelete: (id: string) => void;
}

// Sortable Item Component
const SortableNavItem: React.FC<SortableNavItemProps> = ({ item, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as 'relative'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "flex items-center gap-4 p-4 bg-white border rounded-lg mb-2 group transition-all",
        isDragging ? "shadow-xl border-primary ring-1 ring-primary opacity-90" : "border-slate-200 hover:border-primary/30"
      )}
    >
      <button {...attributes} {...listeners} className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1">
        <GripVertical size={20}/>
      </button>
      
      <div className="flex-grow">
         <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800">{item.label}</span>
            {!item.is_active && (
              <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                Inactif
              </span>
            )}
         </div>
         <span className="text-xs text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded mt-1 inline-block">
            {item.url}
         </span>
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded transition-colors" title="Modifier">
            <Edit2 size={16}/>
         </button>
         <button onClick={() => onDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded transition-colors" title="Supprimer">
            <Trash2 size={16}/>
         </button>
      </div>
    </div>
  );
};

const NavigationSettings: React.FC = () => {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ label: '', url: '', is_active: true });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchData = async () => {
    try {
      const data = await getNavigationMenu();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDragStart = (event: any) => setActiveDragId(event.active.id);
  
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveDragId(null);
    
    if (active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      
      setItems(newOrder); // Optimistic UI update
      await reorderMenuItems(newOrder.map(i => i.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
      } else {
        await createMenuItem({ ...formData, display_order: items.length + 1 });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const openModal = (item?: NavigationItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ label: item.label, url: item.url, is_active: item.is_active });
    } else {
      setEditingItem(null);
      setFormData({ label: '', url: '/', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if(window.confirm("Supprimer ce lien du menu ?")) {
      await deleteMenuItem(id);
      fetchData();
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Globe size={20} className="text-primary" /> Menu de Navigation
            </h3>
            <p className="text-slate-500 text-sm mt-1">Gérez les liens de la barre de navigation principale.</p>
         </div>
         <Button onClick={() => openModal()} leftIcon={<Plus size={18}/>}>
            Ajouter un lien
         </Button>
      </div>

      {/* List */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {items.map(item => (
              <SortableNavItem 
                key={item.id} 
                item={item} 
                onEdit={(i) => openModal(i)} 
                onDelete={handleDelete} 
              />
            ))}
          </SortableContext>
          <DragOverlay>
             {activeDragId ? <div className="bg-white p-4 border rounded-lg shadow-xl opacity-80">Déplacement...</div> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Modifier le lien" : "Nouveau lien"}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Libellé" 
            value={formData.label}
            onChange={(e) => setFormData({...formData, label: e.target.value})}
            placeholder="Ex: Accueil"
            required
          />
          <Input 
            label="URL" 
            value={formData.url}
            onChange={(e) => setFormData({...formData, url: e.target.value})}
            placeholder="Ex: /menu"
            required
          />
          
          <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <input 
              type="checkbox" 
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-bold text-slate-700">Afficher dans le menu</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" isLoading={isSaving}>Enregistrer</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default NavigationSettings;
