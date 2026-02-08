
import React, { useRef, useState } from 'react';
import { Upload, FileAudio, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, selectedFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSelect(files[0]);
    }
  };

  const validateAndSelect = (file: File) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4', 'audio/aac'];
    if (validTypes.includes(file.type) || file.name.endsWith('.m4a')) {
      onFileSelect(file);
    } else {
      alert('Please upload a valid audio file (MP3, WAV, M4A).');
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Upload size={18} className="text-indigo-600" />
        Audio Source
      </h3>

      {selectedFile ? (
        <div className="relative p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-4 group">
          <div className="bg-indigo-600 p-3 rounded-lg text-white">
            <FileAudio size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-indigo-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-indigo-700/70">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <button 
            onClick={() => {
                if (inputRef.current) inputRef.current.value = '';
                // Since selectedFile is handled by parent, we just let parent know it's gone
            }}
            className="p-2 text-indigo-300 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer text-center group ${
            isDragging
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={inputRef}
            onChange={(e) => e.target.files && validateAndSelect(e.target.files[0])}
            accept="audio/*"
            className="hidden"
          />
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
            isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'
          }`}>
            <Upload size={24} />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-slate-400 mt-1">
            MP3, WAV, or M4A (Max 25MB)
          </p>
        </div>
      )}
    </div>
  );
};
