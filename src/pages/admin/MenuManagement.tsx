
import React, { useState, useEffect } from 'react';
import { 
  getMenuCategories, 
  getMenuItems, 
  MenuCategory, 
  MenuItem, 
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems
} from '../../services/api/menu';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragEndEvent,
  DragStartEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  GripVertical, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  Eye, 
  EyeOff, 
  Search,
  Image as ImageIcon
} from 'lucide-react';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import CategoryModal from '../../components/admin/CategoryModal';
import MenuItemModal from '../../components/admin/MenuItemModal';
import { formatPrice } from '../../utils/helpers';
import { cn } from '../../utils/cn';

// --- Sortable Components ---

const SortableCategoryItem = ({ 
  category, 
  isActive, 
  onSelect, 
  onEdit, 
  onDelete, 
  itemCount 
}: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id, data: { type: 'category', category } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "group flex items-center justify-between p-3 mb-2 rounded-lg border transition-all cursor-pointer",
        isActive 
           ? "bg-primary/10 border-primary shadow-sm" 
           : "bg-white border-slate-200 hover:border-primary/30 hover:bg-slate-50",
        isDragging && "opacity-50 ring-2 ring-primary"
      )}
      onClick={() => onSelect(category.id)}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <button {...attributes} {...listeners} className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
           <GripVertical size={18} />
        </button>
        <div className="truncate">
           <div className="flex items-center gap-2">
             <h4 className={cn("font-bold text-sm truncate", isActive ? "text-primary" : "text-slate-700")}>{category.name}</h4>
             {!category.is_active && <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded uppercase">Inactif</span>}
           </div>
           <p className="text-[10px] text-slate-400">{itemCount} plats</p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
         <button onClick={(e) => { e.stopPropagation(); onEdit(category); }} className="p-1.5 hover:bg-white rounded text-slate-400 hover:text-primary">
            <Edit2 size={14} />
         </button>
         {itemCount === 0 && (
           <button onClick={(e) => { e.stopPropagation(); onDelete(category.id); }} className="p-1.5 hover:bg-white rounded text-slate-400 hover:text-red-500">
              <Trash2 size={14} />
           </button>
         )}
      </div>
    </div>
  );
};

const SortableMenuItemCard = ({ item, onEdit, onDelete, onToggleAvailability }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id, data: { type: 'item', item } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
         "bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full",
         isDragging && "opacity-50 ring-2 ring-primary"
      )}
    >
       <div className="relative h-32 bg-slate-100 rounded-t-lg overflow-hidden group">
          {item.image ? (
             <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ImageIcon size={32} />
             </div>
          )}
          <div className="absolute top-2 left-2">
             <button {...attributes} {...listeners} className="p-1.5 bg-black/30 text-white rounded cursor-grab active:cursor-grabbing hover:bg-black/50 backdrop-blur-sm">
                <GripVertical size={16} />
             </button>
          </div>
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={() => onEdit(item)} className="p-1.5 bg-white text-slate-600 rounded shadow-sm hover:text-primary">
                <Edit2 size={14} />
             </button>
             <button onClick={() => onDelete(item.id)} className="p-1.5 bg-white text-slate-600 rounded shadow-sm hover:text-red-500">
                <Trash2 size={14} />
             </button>
          </div>
          {!item.is_available && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 border border-slate-300 px-2 py-1 rounded">Indisponible</span>
             </div>
          )}
       </div>
       
       <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-1">
             <h4 className="font-bold text-slate-800 text-sm line-clamp-1" title={item.name}>{item.name}</h4>
             <span className="font-bold text-primary text-xs">{formatPrice(item.price)}</span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-grow">{item.description}</p>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
             <div className="flex gap-1">
                {item.is_daily_special && (
                   <span className="w-2 h-2 rounded-full bg-primary" title="Plat du jour"></span>
                )}
                {item.allergens.length > 0 && (
                   <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded">{item.allergens.length} allergènes</span>
                )}
             </div>
             <button 
                onClick={() => onToggleAvailability(item)}
                className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors", item.is_available ? "text-green-600" : "text-slate-400")}
             >
                {item.is_available ? <Eye size={14}/> : <EyeOff size={14}/>}
             </button>
          </div>
       </div>
    </div>
  );
};


// --- Main Component ---

const MenuManagement: React.FC = () => {
  // State
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Fetch Data
  const fetchData = async () => {
    try {
      const [cats, menuItems] = await Promise.all([
        getMenuCategories(false), // Fetch ALL categories (including inactive) for admin
        getMenuItems()
      ]);
      setCategories(cats);
      setItems(menuItems);
      if (!selectedCategory && cats.length > 0) {
        setSelectedCategory(cats[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Items
  const filteredItems = items.filter(i => i.category_id === selectedCategory);

  // --- Handlers ---

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    if (active.id !== over.id) {
       const type = active.data.current?.type;

       if (type === 'category') {
          // Reorder Categories
          const oldIndex = categories.findIndex(c => c.id === active.id);
          const newIndex = categories.findIndex(c => c.id === over.id);
          const newOrder = arrayMove(categories, oldIndex, newIndex);
          setCategories(newOrder); // Optimistic UI
          await reorderCategories(newOrder.map(c => c.id));
       } else if (type === 'item') {
          // Reorder Items
          const oldIndex = filteredItems.findIndex(i => i.id === active.id);
          const newIndex = filteredItems.findIndex(i => i.id === over.id);
          const reorderedSubset = arrayMove(filteredItems, oldIndex, newIndex);
          
          // Update global state correctly
          const newItems = items.map(item => {
             const found = reorderedSubset.find(x => x.id === item.id);
             return found || item;
          });
          // Fix sort order for local display
          // In real implementation we send the reordered IDs to backend
          setItems(newItems); // Simplified Optimistic UI
          
          await reorderMenuItems(reorderedSubset.map(i => i.id));
       }
    }
  };

  // CRUD Category
  const handleSaveCategory = async (data: any) => {
    setModalLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        await createCategory(data);
      }
      await fetchData();
      setIsCatModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Supprimer cette catégorie ?")) {
      await deleteCategory(id);
      fetchData();
      if (selectedCategory === id) setSelectedCategory(categories[0]?.id || null);
    }
  };

  // CRUD Item
  const handleSaveItem = async (data: any) => {
    setModalLoading(true);
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, data);
      } else {
        await createMenuItem({ ...data, category_id: selectedCategory || data.category_id });
      }
      await fetchData();
      setIsItemModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm("Supprimer ce plat ?")) {
      await deleteMenuItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleToggleItemAvailability = async (item: MenuItem) => {
    const newVal = !item.is_available;
    // Optimistic
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: newVal } : i));
    await updateMenuItem(item.id, { is_available: newVal });
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen pb-12">
       
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
             <h2 className="text-2xl font-bold text-slate-800">Gestion du Menu</h2>
             <p className="text-slate-500 text-sm">Organisez votre carte et gérez vos plats.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" leftIcon={<Plus size={16}/>} onClick={() => { setEditingCategory(null); setIsCatModalOpen(true); }}>
                Catégorie
             </Button>
             <Button leftIcon={<Plus size={16}/>} onClick={() => { setEditingItem(null); setIsItemModalOpen(true); }}>
                Nouveau Plat
             </Button>
          </div>
       </div>

       <DndContext 
         sensors={sensors} 
         collisionDetection={closestCenter} 
         onDragStart={handleDragStart}
         onDragEnd={handleDragEnd}
       >
         <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Panel: Categories */}
            <div className="w-full lg:w-1/4 min-w-[280px]">
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-24">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 px-2">Catégories</h3>
                  
                  <div className="space-y-1">
                     <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        {categories.map(category => (
                           <SortableCategoryItem 
                              key={category.id}
                              category={category}
                              isActive={selectedCategory === category.id}
                              onSelect={setSelectedCategory}
                              onEdit={(c: MenuCategory) => { setEditingCategory(c); setIsCatModalOpen(true); }}
                              onDelete={handleDeleteCategory}
                              itemCount={items.filter(i => i.category_id === category.id).length}
                           />
                        ))}
                     </SortableContext>
                  </div>
                  
                  {categories.length === 0 && (
                     <div className="text-center py-8 text-slate-400 text-sm">
                        Aucune catégorie
                     </div>
                  )}

                  <button 
                     onClick={() => { setEditingCategory(null); setIsCatModalOpen(true); }}
                     className="w-full mt-4 py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-primary hover:text-primary transition-colors text-sm font-bold flex items-center justify-center gap-2"
                  >
                     <Plus size={16} /> Ajouter une catégorie
                  </button>
               </div>
            </div>

            {/* Right Panel: Items */}
            <div className="w-full lg:w-3/4">
               {selectedCategory ? (
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="font-serif text-2xl font-bold text-secondary">
                           {categories.find(c => c.id === selectedCategory)?.name}
                        </h3>
                        <span className="text-sm text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">
                           {filteredItems.length} plats
                        </span>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <SortableContext items={filteredItems.map(i => i.id)} strategy={rectSortingStrategy}>
                           {filteredItems.map(item => (
                              <SortableMenuItemCard 
                                 key={item.id}
                                 item={item}
                                 onEdit={(i: MenuItem) => { setEditingItem(i); setIsItemModalOpen(true); }}
                                 onDelete={handleDeleteItem}
                                 onToggleAvailability={handleToggleItemAvailability}
                              />
                           ))}
                        </SortableContext>
                        
                        {/* Add Item Card */}
                        <button 
                           onClick={() => { setEditingItem(null); setIsItemModalOpen(true); }}
                           className="min-h-[200px] rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary hover:bg-white transition-all group"
                        >
                           <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center mb-3 transition-colors">
                              <Plus size={24} />
                           </div>
                           <span className="font-bold text-sm">Ajouter un plat</span>
                        </button>
                     </div>
                  </div>
               ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                     Sélectionnez une catégorie pour voir les plats
                  </div>
               )}
            </div>
         </div>

         {/* Drag Overlay (Preview) */}
         <DragOverlay>
            {activeDragId ? (
               <div className="bg-white p-4 rounded-lg shadow-2xl border border-primary/20 opacity-90 cursor-grabbing">
                  Glissement en cours...
               </div>
            ) : null}
         </DragOverlay>
       </DndContext>

       {/* Modals */}
       <CategoryModal 
          isOpen={isCatModalOpen} 
          onClose={() => setIsCatModalOpen(false)}
          onSubmit={handleSaveCategory}
          initialData={editingCategory}
          isLoading={modalLoading}
       />
       <MenuItemModal 
          isOpen={isItemModalOpen} 
          onClose={() => setIsItemModalOpen(false)}
          onSubmit={handleSaveItem}
          initialData={editingItem}
          categories={categories}
          isLoading={modalLoading}
       />

    </div>
  );
};

export default MenuManagement;
