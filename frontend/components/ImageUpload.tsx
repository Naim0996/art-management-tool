'use client';

import { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Image } from 'primereact/image';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

interface ImageUploadProps {
  label: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  type?: 'icon' | 'gallery';
  personaggioId?: number;
}

export default function ImageUpload({
  label,
  images,
  onImagesChange,
  maxImages = 10,
  type = 'gallery',
  personaggioId,
}: ImageUploadProps) {
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Gestione upload file locale
  const handleUpload = async (event: FileUploadHandlerEvent) => {
    if (!personaggioId) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Save the personaggio first before uploading images',
        life: 3000,
      });
      return;
    }

    setUploading(true);
    const file = event.files[0];

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${API_BASE_URL}/api/admin/personaggi/${personaggioId}/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Aggiungi la nuova immagine all'array
      if (type === 'icon') {
        onImagesChange([data.url]);
      } else {
        onImagesChange([...images, data.url]);
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Image uploaded successfully',
        life: 3000,
      });

      // Reset file upload
      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to upload image',
        life: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  // Aggiungi URL
  const handleAddUrl = () => {
    if (!urlInput.trim()) {
      return;
    }

    if (type === 'icon') {
      onImagesChange([urlInput.trim()]);
    } else {
      if (images.length >= maxImages) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Limit Reached',
          detail: `Maximum ${maxImages} images allowed`,
          life: 3000,
        });
        return;
      }
      onImagesChange([...images, urlInput.trim()]);
    }

    setUrlInput('');
  };

  // Rimuovi immagine
  const handleRemove = (index: number) => {
    confirmDialog({
      message: 'Are you sure you want to remove this image?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
      },
    });
  };

  // Sposta immagine su
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    onImagesChange(newImages);
  };

  // Sposta immagine giù
  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    onImagesChange(newImages);
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url;
    }
    return `${API_BASE_URL}${url}`;
  };

  return (
    <div className="space-y-4">
      <Toast ref={toast} />
      <ConfirmDialog />

      <label className="block text-sm font-medium mb-2">{label}</label>

      {/* Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Upload */}
        <div>
          <label className="block text-xs text-gray-600 mb-2">Upload from Device</label>
          <FileUpload
            ref={fileUploadRef}
            mode="basic"
            name="file"
            accept="image/*"
            maxFileSize={10000000}
            customUpload
            uploadHandler={handleUpload}
            disabled={uploading || (type === 'icon' && images.length > 0) || images.length >= maxImages}
            chooseLabel={uploading ? 'Uploading...' : 'Choose File'}
            className="w-full"
          />
          <small className="text-gray-500">Max 10MB, JPG/PNG/GIF</small>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-xs text-gray-600 mb-2">Or Add Image URL</label>
          <div className="flex gap-2">
            <InputText
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1"
              disabled={type === 'icon' && images.length > 0}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
            />
            <Button
              icon="pi pi-plus"
              onClick={handleAddUrl}
              disabled={!urlInput.trim() || (type === 'icon' && images.length > 0) || images.length >= maxImages}
              tooltip="Add URL"
            />
          </div>
        </div>
      </div>

      {/* Images Preview */}
      {images.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-3">
            {type === 'icon' ? 'Icon Preview' : `Images (${images.length}/${maxImages})`}
          </h4>
          <div className={`grid gap-4 ${type === 'icon' ? 'grid-cols-1 max-w-xs' : 'grid-cols-2 md:grid-cols-4'}`}>
            {images.map((img, index) => (
              <div
                key={index}
                className="relative group border border-gray-200 rounded-lg p-2 hover:border-blue-500 transition-colors"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2">
                  <Image
                    src={getImageUrl(img)}
                    alt={`${label} ${index + 1}`}
                    className="w-full h-full object-cover"
                    preview
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-1">
                  {type === 'gallery' && (
                    <div className="flex gap-1">
                      <Button
                        icon="pi pi-arrow-up"
                        size="small"
                        text
                        rounded
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        tooltip="Move up"
                      />
                      <Button
                        icon="pi pi-arrow-down"
                        size="small"
                        text
                        rounded
                        onClick={() => moveDown(index)}
                        disabled={index === images.length - 1}
                        tooltip="Move down"
                      />
                    </div>
                  )}
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    text
                    rounded
                    onClick={() => handleRemove(index)}
                    tooltip="Remove"
                    className="ml-auto"
                  />
                </div>

                {/* URL Display */}
                <div className="mt-2 text-xs text-gray-500 truncate" title={img}>
                  {img}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
          <i className="pi pi-image text-4xl mb-2 block"></i>
          <p>No images yet. Upload a file or add an image URL.</p>
        </div>
      )}
    </div>
  );
}
