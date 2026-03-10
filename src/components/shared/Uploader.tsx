import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface UploaderProps {
  onImageUpload: (imageUrl: string) => void;
}

const Uploader: React.FC<UploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      onImageUpload(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div 
      className={`w-full h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
        isDragging 
          ? 'border-gray-400 bg-gray-50 scale-[1.02]' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
    >
      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" />
      <label 
        htmlFor="file-upload" 
        className="cursor-pointer flex flex-col items-center gap-4 group"
      >
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Upload className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
        </div>
        <div className="text-center">
          <p className="text-gray-800 font-sans font-bold text-lg mb-1">开始捕捉灵感</p>
          <p className="text-gray-400 text-sm font-sans">拖拽图片或点击上传</p>
        </div>
      </label>
    </div>
  );
};

export default Uploader;
