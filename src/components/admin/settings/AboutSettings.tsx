import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  AboutPageData, 
  updateAboutPageData,
  uploadRestaurantImage,
  TeamMember
} from '../../../services/api/restaurants';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { 
  Save, 
  Users, 
  FileText, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon,
  GripVertical
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '../../../contexts/ToastContext';

const teamMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Nom requis"),
  role: z.string().min(2, "Rôle requis"),
  bio: z.string().optional(),
  photo_url: z.string().optional(),
  social: z.object({
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
  }).optional()
});

const schema = z.object({
  title: z.string().min(2, "Titre requis"),
  subtitle: z.string().optional(),
  story_title: z.string().optional(),
  story_content: z.string().min(10, "Contenu requis"),
  story_image: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  chef_quote: z.string().optional(),
  chef_quote_author: z.string().optional(),
  team_members: z.array(teamMemberSchema)
});

type FormData = z.infer<typeof schema>;

interface AboutSettingsProps {
  initialData: AboutPageData | null;
  onRefresh: () => void;
}

// Sortable Team Member Component
const SortableTeamMember = ({ 
  index, 
  field, 
  register, 
  remove, 
  setValue, 
  watch 
}: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', position: 'relative' as 'relative' };
  
  const photoUrl = watch(`team_members.${index}.photo_url`);
  const { showSuccess, showError } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const url = await uploadRestaurantImage(e.target.files[0]);
        setValue(`team_members.${index}.photo_url`, url, { shouldDirty: true });
        showSuccess("Photo ajoutée !");
      } catch (error) {
        showError("Erreur lors de l'upload de la photo");
      }
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("bg-white p-4 rounded-lg border border-slate-200 mb-4 shadow-sm", isDragging && "shadow-xl border-primary")}>
      <div className="flex gap-4">
        <button {...attributes} {...listeners} className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing self-start mt-2">
           <GripVertical size={20} />
        </button>
        
        <div className="flex-grow grid md:grid-cols-4 gap-6">
           {/* Image Upload */}
           <div className="md:col-span-1">
              <div className="relative aspect-square bg-slate-50 rounded-lg overflow-hidden border border-slate-200 group">
                 {photoUrl ? (
                    <img src={photoUrl} alt="Team" className="w-full h-full object-cover" />
                 ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                       <ImageIcon size={32} />
                    </div>
                 )}
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer text-white flex flex-col items-center">
                       <Upload size={20} />
                       <span className="text-[10px] uppercase font-bold mt-1">Changer</span>
                       <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                 </div>
              </div>
           </div>

           {/* Fields */}
           <div className="md:col-span-3 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <Input label="Nom" {...register(`team_members.${index}.name` as const)} placeholder="Nom du membre" />
                 <Input label="Poste" {...register(`team_members.${index}.role` as const)} placeholder="Chef, Directeur..." />
              </div>
              <Input textarea label="Bio courte" {...register(`team_members.${index}.bio` as const)} className="min-h-[80px]" />
              <div className="grid grid-cols-2 gap-4">
                 <Input label="Instagram (Optionnel)" {...register(`team_members.${index}.social.instagram` as const)} placeholder="@..." />
                 <Input label="LinkedIn (Optionnel)" {...register(`team_members.${index}.social.linkedin` as const)} placeholder="URL profile" />
              </div>
           </div>
        </div>

        <button type="button" onClick={() => remove(index)} className="text-slate-300 hover:text-red-500 self-start mt-2 p-1">
           <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

const AboutSettings: React.FC<AboutSettingsProps> = ({ initialData, onRefresh }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'team'>('content');
  const editorRef = useRef<any>(null);
  const { showSuccess, showError } = useToast();

  const { register, control, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      team_members: []
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "team_members"
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        subtitle: initialData.subtitle,
        story_title: initialData.story_title,
        story_content: initialData.story_content,
        story_image: initialData.story_image,
        mission: initialData.mission,
        vision: initialData.vision,
        chef_quote: initialData.chef_quote,
        chef_quote_author: initialData.chef_quote_author,
        team_members: initialData.team_members || []
      });
    }
  }, [initialData, reset]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex(item => item.id === active.id);
      const newIndex = fields.findIndex(item => item.id === over?.id);
      move(oldIndex, newIndex);
    }
  };

  const handleStoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const url = await uploadRestaurantImage(e.target.files[0]);
        setValue('story_image', url, { shouldDirty: true });
        showSuccess("Image d'illustration ajoutée !");
      } catch (error) {
        showError("Erreur lors de l'upload de l'image");
      }
    }
  };

  // TinyMCE Image Upload Handler
  const handleImageUpload = (blobInfo: any, progress: any) => new Promise<string>(async (resolve, reject) => {
    try {
      const file = blobInfo.blob();
      const url = await uploadRestaurantImage(file);
      resolve(url);
    } catch (error) {
      reject('Erreur lors de l\'upload de l\'image');
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const payload: Partial<AboutPageData> = {
        ...data,
        subtitle: data.subtitle || "",
        story_title: data.story_title || "",
        story_image: data.story_image || "",
        mission: data.mission || "",
        vision: data.vision || "",
        chef_quote: data.chef_quote || "",
        chef_quote_author: data.chef_quote_author || "",
        team_members: data.team_members.map((member) => ({
          ...member,
          bio: member.bio || "",
          photo_url: member.photo_url || "",
          social: member.social
        }))
      };

      await updateAboutPageData(payload);
      showSuccess("Page 'À Propos' mise à jour avec succès !");
      onRefresh();
    } catch (error) {
      console.error(error);
      showError("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  if (!initialData) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Sub-tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
         <button 
            type="button"
            onClick={() => setActiveTab('content')}
            className={cn(
               "pb-3 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2",
               activeTab === 'content' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"
            )}
         >
            <FileText size={16} /> Contenu de la page
         </button>
         <button 
            type="button"
            onClick={() => setActiveTab('team')}
            className={cn(
               "pb-3 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2",
               activeTab === 'team' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"
            )}
         >
            <Users size={16} /> Équipe
         </button>
      </div>

      {activeTab === 'content' && (
         <div className="space-y-8 animate-in fade-in">
            {/* Header Info */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
               <h3 className="font-bold text-slate-800 mb-4">En-tête de page</h3>
               <Input label="Titre Principal" {...register('title')} />
               <Input label="Sous-titre / Slogan" {...register('subtitle')} />
            </div>

            {/* Main Story */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
               <h3 className="font-bold text-slate-800 mb-4">Notre Histoire</h3>
               
               <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                     <Input label="Titre de section" {...register('story_title')} />
                     <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-secondary/70 font-bold">Contenu (Riche)</label>
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                           <Controller
                              name="story_content"
                              control={control}
                              render={({ field }) => (
                                 <Editor
                                    apiKey="no-api-key"
                                    onInit={(evt, editor) => editorRef.current = editor}
                                    value={field.value}
                                    onEditorChange={field.onChange}
                                    init={{
                                      height: 300,
                                      menubar: false,
                                      plugins: [
                                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                        'anchor', 'searchreplace', 'visualblocks', 'code',
                                        'insertdatetime', 'media', 'table', 'help', 'wordcount'
                                      ],
                                      toolbar: 'undo redo | blocks | ' +
                                        'bold italic forecolor | alignleft aligncenter ' +
                                        'alignright alignjustify | bullist numlist outdent indent | ' +
                                        'removeformat | image link | help',
                                      content_style: 'body { font-family: Georgia, serif; font-size: 16px; line-height: 1.6; padding: 20px; }',
                                      images_upload_handler: handleImageUpload,
                                      automatic_uploads: true,
                                      file_picker_types: 'image',
                                      image_advtab: true,
                                      image_caption: true,
                                      placeholder: 'Racontez votre histoire...',
                                      skin: 'oxide',
                                      content_css: 'default',
                                      branding: false,
                                      promotion: false
                                    }}
                                 />
                              )}
                           />
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-1 space-y-4">
                     <label className="block text-xs uppercase tracking-wider text-secondary/70 font-bold">Image d'illustration</label>
                     <div className="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 relative group">
                        {watch('story_image') ? (
                           <img src={watch('story_image')} alt="Story" className="w-full h-full object-cover" />
                        ) : (
                           <div className="flex flex-col items-center justify-center h-full text-slate-400">
                              <ImageIcon size={32} className="mb-2" />
                              <span className="text-xs">Ajouter une photo</span>
                           </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleStoryImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                           <Upload className="text-white" size={24} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Mission & Vision */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid md:grid-cols-2 gap-6">
               <Input textarea label="Notre Mission" {...register('mission')} className="min-h-[120px]" />
               <Input textarea label="Notre Vision" {...register('vision')} className="min-h-[120px]" />
            </div>

            {/* Quote */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
               <h3 className="font-bold text-slate-800">Citation du Chef</h3>
               <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                     <Input textarea label="Citation" {...register('chef_quote')} placeholder="La cuisine est un art..." />
                  </div>
                  <div>
                     <Input label="Auteur" {...register('chef_quote_author')} placeholder="Chef Auguste Gusteau" />
                  </div>
               </div>
            </div>
         </div>
      )}

      {activeTab === 'team' && (
         <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-800 text-lg">Membres de l'équipe ({fields.length})</h3>
               <Button type="button" size="sm" onClick={() => append({ id: `new-${Date.now()}`, name: '', role: '' })} leftIcon={<Plus size={16} />}>
                  Ajouter un membre
               </Button>
            </div>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
               <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  {fields.map((field, index) => (
                     <SortableTeamMember 
                        key={field.id}
                        index={index}
                        field={field}
                        register={register}
                        remove={remove}
                        setValue={setValue}
                        watch={watch}
                     />
                  ))}
               </SortableContext>
            </DndContext>

            {fields.length === 0 && (
               <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                  <Users size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Aucun membre d'équipe ajouté.</p>
               </div>
            )}
         </div>
      )}

      {/* Save Button */}
      <div className="sticky bottom-4 z-10 flex justify-end mt-8">
         <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 flex gap-4 items-center">
            <span className="text-sm text-slate-500 hidden md:inline">Modifications non enregistrées</span>
            <Button type="submit" isLoading={isSaving} leftIcon={<Save size={18}/>} className="shadow-lg shadow-primary/20">
               Sauvegarder la page
            </Button>
         </div>
      </div>

    </form>
  );
};

export default AboutSettings;