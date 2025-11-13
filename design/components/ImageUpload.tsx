import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ onImageSelect, disabled = false }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズは10MB以下にしてください');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('JPEG、PNG、WEBP形式の画像のみ対応しています');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelect(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div
      className={`retro-panel pixel-corners aspect-square cursor-pointer transition-all flex items-center justify-center ${
        isDragging ? 'scale-105 border-retro-highlight' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInput}
        disabled={disabled}
      />
      
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center gap-4 cursor-pointer p-8 w-full h-full justify-center"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {isDragging ? (
            <ImageIcon className="w-16 h-16 text-retro-highlight" />
          ) : (
            <Upload className="w-16 h-16 text-retro-muted" />
          )}
        </motion.div>

        <div className="text-center">
          <p className="mb-2">画像をドロップ</p>
          <p className="text-xs text-retro-muted">または</p>
          <p className="text-xs text-retro-muted">クリックして選択</p>
        </div>

        <div className="text-xs text-retro-muted text-center">
          <p>JPEG, PNG, WEBP</p>
          <p>最大10MB</p>
        </div>
      </label>
    </div>
  );
}
