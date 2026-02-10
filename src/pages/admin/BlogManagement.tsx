
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Globe, 
  MoreHorizontal
} from 'lucide-react';
import { 
  getBlogPosts, 
  createBlogPost, 
  deleteBlogPost, 
  duplicateBlogPost, 
  publishBlogPost,
  unpublishBlogPost,
  BlogPost, 
  BlogFilters 
} from '../../services/api/blog';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import BlogEditor from '../../components/admin/BlogEditor';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/helpers';

const BlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BlogFilters>({ status: 'all', search: '' });
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getBlogPosts(filters);
      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Actions
  const handleCreate = async () => {
    try {
      const newPost = await createBlogPost({});
      setEditingPost(newPost);
      setIsEditorOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      await deleteBlogPost(id);
      fetchData();
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateBlogPost(id);
    fetchData();
  };

  const handleTogglePublish = async (post: BlogPost) => {
    if (post.status === 'published') {
      await unpublishBlogPost(post.id);
    } else {
      await publishBlogPost(post.id);
    }
    fetchData();
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setEditingPost(null);
    fetchData(); // Refresh list
  };

  const handleEditorSave = (updatedPost: BlogPost) => {
    // Optimistic update if needed, but we usually refresh on close
    setEditingPost(updatedPost);
  };

  if (isEditorOpen && editingPost) {
    return (
      <BlogEditor 
        post={editingPost} 
        onClose={handleEditorClose} 
        onSave={handleEditorSave}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Gestion du Blog</h2>
           <p className="text-slate-500 text-sm">Gérez vos articles et actualités.</p>
        </div>
        <Button leftIcon={<Plus size={18}/>} onClick={handleCreate}>
           Nouvel Article
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="flex bg-slate-100 p-1 rounded-lg">
            {['all', 'published', 'draft'].map(status => (
               <button
                  key={status}
                  onClick={() => setFilters(prev => ({ ...prev, status: status as any }))}
                  className={cn(
                     "px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
                     filters.status === status 
                        ? "bg-white text-primary shadow-sm" 
                        : "text-slate-500 hover:text-slate-700"
                  )}
               >
                  {status === 'all' ? 'Tous' : status === 'published' ? 'Publiés' : 'Brouillons'}
               </button>
            ))}
         </div>
         
         <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
               type="text"
               placeholder="Rechercher..."
               value={filters.search}
               onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
               className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:border-primary"
            />
         </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         {loading ? (
            <div className="p-12 text-center"><LoadingSpinner /></div>
         ) : posts.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
               <FileText size={48} className="mx-auto mb-4 opacity-20" />
               <p>Aucun article trouvé.</p>
            </div>
         ) : (
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                     <th className="px-6 py-4 w-20">Image</th>
                     <th className="px-6 py-4">Titre</th>
                     <th className="px-6 py-4">Auteur</th>
                     <th className="px-6 py-4">Statut</th>
                     <th className="px-6 py-4">Date</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {posts.map(post => (
                     <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-3">
                           <div className="w-12 h-12 rounded bg-slate-200 overflow-hidden">
                              {post.image ? (
                                 <img src={post.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <FileText size={20} />
                                 </div>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-3">
                           <button onClick={() => handleEdit(post)} className="font-bold text-slate-800 hover:text-primary text-left line-clamp-1">
                              {post.title}
                           </button>
                           <span className="text-xs text-slate-400">{post.category}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600">
                           {post.author?.name || 'Admin'}
                        </td>
                        <td className="px-6 py-3">
                           <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              post.status === 'published' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                           )}>
                              {post.status === 'published' ? 'Publié' : 'Brouillon'}
                           </span>
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-500">
                           {post.status === 'published' ? (
                              <span title="Date de publication">{formatDate(post.published_at || '')}</span>
                           ) : (
                              <span title="Dernière modification">Modifié {formatDate(post.updated_at)}</span>
                           )}
                        </td>
                        <td className="px-6 py-3 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleTogglePublish(post)} className="p-1.5 text-slate-400 hover:text-primary rounded" title={post.status === 'published' ? 'Dépublier' : 'Publier'}>
                                 <Globe size={16} />
                              </button>
                              <button onClick={() => handleDuplicate(post.id)} className="p-1.5 text-slate-400 hover:text-primary rounded" title="Dupliquer">
                                 <Copy size={16} />
                              </button>
                              <button onClick={() => handleEdit(post)} className="p-1.5 text-slate-400 hover:text-primary rounded" title="Modifier">
                                 <Edit size={16} />
                              </button>
                              <button onClick={() => handleDelete(post.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded" title="Supprimer">
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         )}
      </div>

    </div>
  );
};

export default BlogManagement;
