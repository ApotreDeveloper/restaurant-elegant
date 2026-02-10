
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { supabase } from '../../services/supabase';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  bucket?: string;
  accept?: string;
  maxSize?: number; // bytes
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  bucket = 'restaurant-assets',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  className
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (file.size > maxSize) {
      setError(`L'image dépasse la taille limite (${maxSize / 1024 / 1024}MB)`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Mock upload for now if no bucket configured, else use Supabase
      // Use a timestamp to avoid name collisions
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onChange(publicUrl);
    } catch (err: any) {
      console.error('Upload failed:', err);
      // Fallback for demo without real Supabase storage
      const reader = new FileReader();
      reader.onload = (e) => onChange(e.target?.result as string);
      reader.readAsDataURL(file);
      setError("Note: Mode démo (stockage local temporaire)");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

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
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    if (onRemove) onRemove();
    else onChange('');
  };

  return (
    <div className={cn("w-full", className)}>
      {value ? (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200 group bg-slate-50">
          <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
             <button 
                type="button"
                onClick={() => inputRef.current?.click()}
                className="p-2 bg-white rounded-full text-slate-700 hover:text-primary transition-colors"
             >
                <Upload size={18} />
             </button>
             <button 
                type="button"
                onClick={handleRemove}
                className="p-2 bg-white rounded-full text-slate-700 hover:text-red-500 transition-colors"
             >
                <X size={18} />
             </button>
          </div>
        </div>
      ) : (
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all cursor-pointer aspect-video bg-slate-50",
            dragActive ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary/50 hover:bg-slate-100"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-primary">
               <Loader2 className="animate-spin mb-2" size={24} />
               <span className="text-xs font-bold">Upload en cours...</span>
            </div>
          ) : (
            <>
               <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                  <ImageIcon size={24} className="text-slate-400" />
               </div>
               <p className="text-xs font-bold text-slate-600 text-center">Cliquez ou glissez une image</p>
               <p className="text-[10px] text-slate-400 mt-1">{accept.replace('image/', '')} max {maxSize / 1024 / 1024}MB</p>
            </>
          )}
        </div>
      )}
      <input 
         ref={inputRef}
         type="file" 
         accept={accept}
         onChange={handleChange}
         className="hidden" 
      />
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default ImageUpload;
