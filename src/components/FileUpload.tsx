import React, { useCallback, useState } from 'react';
import { Upload, File, Image, FileText, Music, Video, Archive } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-16 h-16 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="w-16 h-16 text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="w-16 h-16 text-green-500" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-16 h-16 text-red-500" />;
    if (type.includes('zip') || type.includes('archive')) return <Archive className="w-16 h-16 text-yellow-500" />;
    return <File className="w-16 h-16 text-gray-500" />;
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50 scale-105' 
          : 'border-gray-300 hover:border-gray-400'
        }
        ${isProcessing ? 'pointer-events-none opacity-50' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Upload className="w-16 h-16 text-gray-400" />
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-700">
            {isProcessing ? 'Processing...' : 'Drop your file here'}
          </h3>
          <p className="text-gray-500">
            or click to browse and select a file
          </p>
          <p className="text-sm text-gray-400">
            Supports all file types
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;