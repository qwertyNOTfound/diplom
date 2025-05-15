import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadCloud, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onChange: (urls: string[]) => void;
  value?: string[];
  maxFiles?: number;
}

const ImageUpload = ({ onChange, value = [], maxFiles = 10 }: ImageUploadProps) => {
  const [images, setImages] = useState<string[]>(value);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [...images];
    
    for (let i = 0; i < files.length; i++) {
      if (newImages.length >= maxFiles) break;
      
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
          setImages([...newImages]);
          onChange([...newImages]);
        }
      };
      reader.readAsDataURL(file);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    onChange(newImages);
    
    // Update main image index if needed
    if (index === mainImageIndex) {
      setMainImageIndex(0);
    } else if (index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const setAsMainImage = (index: number) => {
    setMainImageIndex(index);
    
    // Reorder images to put the main one first
    const newImages = [...images];
    const mainImage = newImages[index];
    newImages.splice(index, 1);
    newImages.unshift(mainImage);
    
    setImages(newImages);
    onChange(newImages);
    setMainImageIndex(0);
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50",
          "transition-colors hover:border-primary/50 hover:bg-gray-100/50 cursor-pointer"
        )}
        onClick={openFileSelector}
      >
        <div className="mb-4 flex justify-center">
          <UploadCloud className="h-12 w-12 text-gray-400" />
        </div>
        <h4 className="font-bold mb-2">Перетягніть фотографії сюди</h4>
        <p className="text-gray-600 text-sm mb-4">або</p>
        <Button type="button" variant="outline">
          Вибрати файли
        </Button>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
          ref={fileInputRef}
        />
        <p className="text-gray-500 text-xs mt-4">
          Підтримуються формати: JPG, PNG, WEBP. Максимальний розмір файлу: 10MB.
        </p>
      </div>

      {images.length > 0 && (
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Завантажені фотографії
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <Card className="overflow-hidden">
                  <img
                    src={img}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="w-8 h-8 rounded-full bg-white text-gray-700 hover:text-gray-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAsMainImage(index);
                      }}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="w-8 h-8 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs py-1 px-2 rounded">
                      Головне фото
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
