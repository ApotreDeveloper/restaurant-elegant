
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Input from '../shared/Input';
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react';
import { cn } from '../../utils/cn';
import { GalleryCategory } from '../../services/api/gallery';

interface GalleryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], metadata: any) => Promise<void>;
  isLoading?: boolean;
}

const GalleryUploadModal: React.FC<GalleryUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isLoading
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      category: 'Restaurant',
      is_featured: false
    }
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    if (selectedFiles.length === 0) return;
    await onUpload(selectedFiles, data);
    setSelectedFiles([]);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter des images"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Drop Zone */}
        <div 
          className={cn(
            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer",
            dragActive ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary/50 hover:bg-slate-50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input 
            ref={inputRef}
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleChange}
            className="hidden" 
          />
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <Upload size={32} className="text-slate-400" />
          </div>
          <p className="font-bold text-slate-700">Cliquez ou glissez des images ici</p>
          <p className="text-xs text-slate-400 mt-2">JPG, PNG, WebP jusqu'à 5MB</p>
        </div>

        {/* File List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="w-10 h-10 rounded overflow-hidden bg-white shrink-0">
                   <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                   <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                   <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFile(idx)}
                  className="p-1 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded"
                >
                   <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bulk Metadata */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
           <div>
              <label className="block text-xs uppercase tracking-wider text-secondary/70 font-bold mb-1">Catégorie par défaut</label>
              <select 
                 {...register('category')}
                 className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                 <option value="Restaurant">Restaurant</option>
                 <option value="Plats">Plats</option>
                 <option value="Événements">Événements</option>
                 <option value="Équipe">Équipe</option>
              </select>
           </div>
           <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" {...register('is_featured')} className="rounded border-slate-300 text-primary focus:ring-primary" />
                 <span className="text-sm font-medium text-slate-700">Mettre en "Une"</span>
              </label>
           </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
           <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Annuler
           </Button>
           <Button type="submit" isLoading={isLoading} disabled={selectedFiles.length === 0}>
              {selectedFiles.length > 0 ? `Uploader ${selectedFiles.length} image(s)` : 'Uploader'}
           </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GalleryUploadModal;
