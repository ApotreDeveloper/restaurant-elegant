
import React, { useState, useEffect } from 'react';
import { 
  getGalleryImages, 
  GalleryImage, 
  uploadGalleryImages, 
  updateGalleryImage, 
  deleteGalleryImage,
  deleteMultipleImages,
  reorderGalleryImages
} from '../../services/api/gallery';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  Filter, 
  Trash2, 
  Star, 
  Move,
  Edit2,
  CheckSquare,
  Square,
  Search,
  Check
} from 'lucide-react';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import GalleryUploadModal from '../../components/admin/GalleryUploadModal';
import ImageEditorModal from '../../components/admin/ImageEditorModal';
import { cn } from '../../utils/cn';

// --- Sortable Item Component ---
const SortableImageCard = ({ 
  image, 
  selected, 
  onSelect, 
  onEdit, 
  onToggleFeatured 
}: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: image.id, data: { image } });

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
        "group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border transition-all hover:shadow-lg",
        selected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-slate-200",
        isDragging && "opacity-50"
      )}
    >
      <img src={image.url} alt={image.title} className="w-full h-full object-cover" />
      
      {/* Badges */}
      <div className="absolute top-2 left-2 flex gap-1">
         {image.is_featured && (
            <span className="bg-primary text-secondary p-1 rounded-full shadow-sm" title="À la une">
               <Star size={12} fill="currentColor" />
            </span>
         )}
      </div>

      {/* Select Checkbox (Always visible if selected, or on hover) */}
      <button 
         onClick={(e) => { e.stopPropagation(); onSelect(image.id); }}
         className={cn(
            "absolute top-2 right-2 p-1 rounded bg-white/90 shadow-sm transition-opacity",
            selected ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600"
         )}
      >
         {selected ? <CheckSquare size={18} /> : <Square size={18} />}
      </button>

      {/* Overlay Actions (Hover) */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
            <button {...attributes} {...listeners} className="p-2 bg-white rounded-full text-slate-600 hover:text-primary cursor-grab active:cursor-grabbing shadow-lg" title="Déplacer">
               <Move size={16} />
            </button>
            <button onClick={() => onEdit(image)} className="p-2 bg-white rounded-full text-slate-600 hover:text-primary shadow-lg" title="Éditer">
               <Edit2 size={16} />
            </button>
         </div>
         
         <div className="text-white text-xs font-bold truncate">{image.title}</div>
         <div className="text-white/70 text-[10px]">{image.category}</div>
      </div>
    </div>
  );
};

// --- Main Page ---
const GalleryManagement: React.FC = () => {
  // State
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
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
      const data = await getGalleryImages();
      setImages(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Logic
  const filteredImages = images.filter(img => {
    const matchesCategory = filterCategory === 'all' || img.category === filterCategory;
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handlers
  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Supprimer ${selectedIds.size} images ?`)) {
      setLoading(true);
      await deleteMultipleImages(Array.from(selectedIds));
      setSelectedIds(new Set());
      await fetchData();
    }
  };

  const handleBulkFeature = async (feature: boolean) => {
    // Optimistic Update
    setImages(prev => prev.map(img => selectedIds.has(img.id) ? { ...img, is_featured: feature } : img));
    // In real app, batch update API call
    for (const id of selectedIds) {
       await updateGalleryImage(id, { is_featured: feature });
    }
    setSelectedIds(new Set());
  };

  const handleUpload = async (files: File[], metadata: any) => {
    setModalLoading(true);
    try {
      await uploadGalleryImages(files, metadata);
      await fetchData();
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveImage = async (id: string, data: any) => {
    setModalLoading(true);
    try {
      await updateGalleryImage(id, data);
      setIsEditorOpen(false);
      fetchData();
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    setModalLoading(true);
    try {
      await deleteGalleryImage(id);
      setIsEditorOpen(false);
      fetchData();
    } finally {
      setModalLoading(false);
    }
  };

  // DnD Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((item) => item.id === active.id);
      const newIndex = images.findIndex((item) => item.id === over?.id);
      
      const newOrder = arrayMove(images, oldIndex, newIndex);
      setImages(newOrder); // Optimistic
      await reorderGalleryImages(newOrder.map(img => img.id));
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Galerie</h2>
           <p className="text-slate-500 text-sm">Gérez les images de votre établissement.</p>
        </div>
        <Button leftIcon={<Plus size={18}/>} onClick={() => setIsUploadOpen(true)}>
           Ajouter des images
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col lg:flex-row justify-between items-center gap-4 sticky top-20 z-20">
         {/* Filters */}
         <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto no-scrollbar">
            <div className="relative min-w-[200px]">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:border-primary"
               />
            </div>
            <select 
               value={filterCategory}
               onChange={(e) => setFilterCategory(e.target.value)}
               className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
               <option value="all">Toutes les catégories</option>
               <option value="Restaurant">Restaurant</option>
               <option value="Plats">Plats</option>
               <option value="Événements">Événements</option>
               <option value="Équipe">Équipe</option>
            </select>
         </div>

         {/* Bulk Actions */}
         {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
               <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{selectedIds.size} sélectionné(s)</span>
               <div className="h-6 w-px bg-slate-200"></div>
               <button 
                  onClick={() => handleBulkFeature(true)} 
                  className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                  title="Mettre à la une"
               >
                  <Star size={18} />
               </button>
               <button 
                  onClick={handleBulkDelete}
                  className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Supprimer"
               >
                  <Trash2 size={18} />
               </button>
               <button 
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs text-slate-400 hover:text-slate-600 underline ml-2"
               >
                  Annuler
               </button>
            </div>
         )}
      </div>

      {/* Grid */}
      <DndContext 
         sensors={sensors} 
         collisionDetection={closestCenter} 
         onDragStart={handleDragStart} 
         onDragEnd={handleDragEnd}
      >
         <SortableContext items={filteredImages.map(img => img.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
               {filteredImages.map(image => (
                  <SortableImageCard 
                     key={image.id} 
                     image={image}
                     selected={selectedIds.has(image.id)}
                     onSelect={handleSelect}
                     onEdit={(img: GalleryImage) => { setEditingImage(img); setIsEditorOpen(true); }}
                  />
               ))}
            </div>
         </SortableContext>

         <DragOverlay>
            {activeDragId ? (
               <div className="w-full h-full bg-slate-200 opacity-50 rounded-lg border-2 border-primary"></div>
            ) : null}
         </DragOverlay>
      </DndContext>

      {/* Modals */}
      <GalleryUploadModal 
         isOpen={isUploadOpen}
         onClose={() => setIsUploadOpen(false)}
         onUpload={handleUpload}
         isLoading={modalLoading}
      />

      <ImageEditorModal 
         isOpen={isEditorOpen}
         onClose={() => setIsEditorOpen(false)}
         image={editingImage}
         onSave={handleSaveImage}
         onDelete={handleDeleteImage}
         isLoading={modalLoading}
      />

    </div>
  );
};

export default GalleryManagement;
