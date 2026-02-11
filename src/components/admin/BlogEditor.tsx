import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Calendar, 
  Image as ImageIcon, 
  Check, 
  AlertCircle,
  MoreVertical,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { 
  BlogPost, 
  updateBlogPost, 
  generateSlug, 
  checkSlugUniqueness,
  uploadBlogImage,
  deleteBlogPost
} from '../../services/api/blog';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Modal from '../shared/Modal';
import LoadingSpinner from '../shared/LoadingSpinner';
import { cn } from '../../utils/cn';
import { useToast } from '../../contexts/ToastContext';

// --- Types & Schema ---
const schema = z.object({
  title: z.string().min(5, "Le titre est trop court"),
  slug: z.string().min(3, "Le slug est requis").regex(/^[a-z0-9-]+$/, "Format invalide (minuscules et tirets uniquement)"),
  excerpt: z.string().max(300, "Maximum 300 caractères"),
  category: z.string().min(1, "Catégorie requise"),
  status: z.enum(['draft', 'published']),
  published_at: z.string().nullable().optional(),
  image: z.string().url("URL d'image invalide").optional().or(z.literal('')),
});

interface BlogEditorProps {
  post: BlogPost;
  onClose: () => void;
  onSave: (updatedPost: BlogPost) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES = ['Menu', 'Vins', 'Événements', 'Cuisine', 'Coulisses', 'Actualités'];

const BlogEditor: React.FC<BlogEditorProps> = ({ post, onClose, onSave, onDelete }) => {
  const [content, setContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();
  
  const editorRef = useRef<any>(null);

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      status: post.status,
      published_at: post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : null,
      image: post.image
    }
  });

  const title = watch('title');
  const slug = watch('slug');
  const status = watch('status');
  const featuredImage = watch('image');

  // Auto-generate slug from title
  useEffect(() => {
    if (title && (!slug || slug === post.slug)) {
      const generated = generateSlug(title);
      setValue('slug', generated, { shouldValidate: true });
    }
  }, [title]);

  // Check slug uniqueness on change
  useEffect(() => {
    const checkSlug = async () => {
      if (slug && slug !== post.slug) {
        const isUnique = await checkSlugUniqueness(slug, post.id);
        setSlugError(isUnique ? null : "Ce slug est déjà utilisé");
      } else {
        setSlugError(null);
      }
    };
    const timer = setTimeout(checkSlug, 500);
    return () => clearTimeout(timer);
  }, [slug, post.id, post.slug]);

  // TinyMCE Image Upload Handler
  const handleImageUpload = (blobInfo: any, progress: any) => new Promise<string>(async (resolve, reject) => {
    try {
      const file = blobInfo.blob();
      const url = await uploadBlogImage(file);
      resolve(url);
    } catch (error) {
      reject('Erreur lors de l\'upload de l\'image');
    }
  });

  const onFormSubmit = async (data: any) => {
    if (slugError) {
      showError("Impossible de sauvegarder : le slug est déjà utilisé");
      return;
    }
    
    setIsSaving(true);
    try {
      const updated = await updateBlogPost(post.id, {
        ...data,
        content,
        published_at: data.status === 'published' && !data.published_at ? new Date().toISOString() : data.published_at
      });
      setLastSaved(new Date());
      showSuccess("Article sauvegardé avec succès !");
      onSave(updated);
    } catch (error) {
      console.error(error);
      showError("Erreur lors de la sauvegarde de l'article");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const url = await uploadBlogImage(e.target.files[0]);
        setValue('image', url, { shouldDirty: true });
        showSuccess("Image mise en avant ajoutée !");
      } catch (error) {
        showError("Erreur lors de l'upload de l'image");
      }
    }
  };

  const handleEditorChange = (content: string, editor: any) => {
    setContent(content);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col animate-in fade-in duration-300">
      
      {/* Top Bar */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose} className="text-slate-500 hover:text-slate-800 p-2" title="Retour">
            <ArrowLeft size={20} />
          </Button>
          <div>
             <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded", status === 'published' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
                {status === 'published' ? 'Publié' : 'Brouillon'}
             </span>
             {lastSaved && (
                <span className="ml-4 text-xs text-slate-400 flex items-center gap-1">
                   <Check size={12} /> Sauvegardé {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
             )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)} leftIcon={<Eye size={16}/>}>
             Aperçu
          </Button>
          
          <Button 
            onClick={handleSubmit(onFormSubmit)} 
            leftIcon={isSaving ? <LoadingSpinner /> : <Save size={16}/>}
            disabled={isSaving}
          >
             {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
          </Button>
          
          <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-2">
             <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* Editor Area (Left) */}
        <div className="flex-grow overflow-y-auto p-8 lg:p-12">
           <div className="max-w-4xl mx-auto space-y-6">
              
              <input
                {...register('title')}
                placeholder="Titre de l'article"
                className="w-full text-4xl font-serif font-bold text-slate-800 placeholder:text-slate-300 border-none focus:ring-0 bg-transparent p-0"
              />
              
              <div className="flex items-center gap-2 text-sm text-slate-500">
                 <span>slug:</span>
                 <input
                    {...register('slug')}
                    className={cn(
                       "bg-slate-100 border-none rounded px-2 py-0.5 text-sm font-mono focus:ring-1 focus:ring-primary w-full max-w-md",
                       (errors.slug || slugError) && "bg-red-50 text-red-600 ring-1 ring-red-200"
                    )}
                 />
                 {(errors.slug || slugError) && (
                    <span className="text-red-500 text-xs flex items-center gap-1">
                       <AlertCircle size={12} /> {errors.slug?.message || slugError}
                    </span>
                 )}
              </div>

              <div className="min-h-[500px] bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                 <Editor
                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY || "no-api-key"}
                    onInit={(evt, editor) => editorRef.current = editor}
                    value={content}
                    onEditorChange={handleEditorChange}
                    init={{
                      height: 500,
                      menubar: false,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | image link | code | help',
                      content_style: 'body { font-family: Georgia, serif; font-size: 16px; line-height: 1.6; padding: 20px; }',
                      images_upload_handler: handleImageUpload,
                      automatic_uploads: true,
                      file_picker_types: 'image',
                      image_advtab: true,
                      image_caption: true,
                      placeholder: 'Rédigez votre histoire...',
                      skin: 'oxide',
                      content_css: 'default',
                      branding: false,
                      promotion: false
                    }}
                 />
              </div>
           </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto p-6 space-y-8 shadow-xl z-10">
           
           {/* Publish Settings */}
           <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Publication</h3>
              
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Statut</label>
                 <select 
                    {...register('status')}
                    className="w-full bg-slate-50 border-slate-200 rounded text-sm focus:ring-primary"
                 >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                 </select>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Date de publication</label>
                 <input 
                    type="datetime-local"
                    {...register('published_at')}
                    className="w-full bg-slate-50 border-slate-200 rounded text-sm focus:ring-primary"
                 />
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Catégorie</label>
                 <select 
                    {...register('category')}
                    className="w-full bg-slate-50 border-slate-200 rounded text-sm focus:ring-primary"
                 >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                 </select>
              </div>
           </div>

           <div className="h-px bg-slate-100"></div>

           {/* Featured Image */}
           <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Image mise en avant</h3>
              
              <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 relative group hover:border-primary transition-colors">
                 {featuredImage ? (
                    <>
                       <img src={featuredImage} alt="Featured" className="w-full h-full object-cover" />
                       <button 
                          type="button"
                          onClick={() => setValue('image', '')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                          <Trash2 size={14} />
                       </button>
                    </>
                 ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                       <ImageIcon size={32} className="mb-2" />
                       <span className="text-xs">Ajouter une image</span>
                    </div>
                 )}
                 <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                 />
              </div>
              <p className="text-xs text-slate-400">Format recommandé : 1200x630px</p>
           </div>

           <div className="h-px bg-slate-100"></div>

           {/* Excerpt */}
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Extrait</h3>
                 <span className="text-xs text-slate-400">{watch('excerpt')?.length || 0}/300</span>
              </div>
              <textarea 
                 {...register('excerpt')}
                 rows={4}
                 className="w-full bg-slate-50 border-slate-200 rounded text-sm focus:ring-primary resize-none p-3"
                 placeholder="Un court résumé pour les cartes d'aperçu..."
              />
              <button 
                 type="button"
                 onClick={() => {
                    const text = editorRef.current?.getContent({ format: 'text' }) || "";
                    setValue('excerpt', text.slice(0, 200).trim() + '...', { shouldDirty: true });
                 }}
                 className="text-xs text-primary font-bold hover:underline"
              >
                 Générer depuis le contenu
              </button>
           </div>

        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
         <div className="fixed inset-0 z-[60] bg-secondary/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full">
               <h3 className="text-xl font-bold text-slate-800 mb-4">Supprimer l'article ?</h3>
               <p className="text-slate-600 mb-6 text-sm">Cette action est irréversible. L'article sera retiré du blog et de l'administration.</p>
               <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Annuler</Button>
                  <Button 
                     className="bg-red-600 hover:bg-red-700 text-white" 
                     onClick={() => { onDelete(post.id); onClose(); }}
                  >
                     Supprimer
                  </Button>
               </div>
            </div>
         </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && (
         <div className="fixed inset-0 z-[60] bg-white flex flex-col">
            <div className="h-14 border-b flex items-center justify-between px-6 bg-slate-50">
               <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">Mode Aperçu</span>
               <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-slate-200 rounded-full">
                  <ArrowLeft size={20} />
               </button>
            </div>
            <div className="flex-grow overflow-y-auto bg-white">
               <div className="max-w-3xl mx-auto py-12 px-4">
                  {featuredImage && (
                     <div className="mb-8 rounded-xl overflow-hidden shadow-lg h-64 md:h-96">
                        <img src={featuredImage} className="w-full h-full object-cover" alt="" />
                     </div>
                  )}
                  <h1 className="font-serif text-4xl md:text-5xl font-bold text-secondary mb-6">{title}</h1>
                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }}></div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default BlogEditor;