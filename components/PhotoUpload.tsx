'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Photo } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

interface PhotoUploadProps {
  onPhotosChange: (photos: Photo[]) => void;
}

export default function PhotoUpload({ onPhotosChange }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);

      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const data = await response.json();

          return {
            id: uuidv4(),
            url: data.url,
            width: data.width,
            height: data.height,
          } as Photo;
        });

        const uploadedPhotos = await Promise.all(uploadPromises);
        const newPhotos = [...photos, ...uploadedPhotos];
        setPhotos(newPhotos);
        onPhotosChange(newPhotos);
      } catch (error) {
        console.error('Error uploading photos:', error);
        alert('Failed to upload some photos. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [photos, onPhotosChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.heic', '.heif', '.webp'],
    },
    multiple: true,
  });

  const removePhoto = (id: string) => {
    const newPhotos = photos.filter((p) => p.id !== id);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  };

  const updateCaption = (id: string, caption: string) => {
    const newPhotos = photos.map((p) =>
      p.id === id ? { ...p, caption } : p
    );
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= photos.length) return;
    const newPhotos = [...photos];
    const [movedPhoto] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, movedPhoto);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    movePhoto(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-vintage-brown bg-vintage-sepia/20'
            : 'border-vintage-sepia hover:border-vintage-brown'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-vintage-brown">Uploading...</p>
        ) : isDragActive ? (
          <p className="text-vintage-brown">Drop the photos here...</p>
        ) : (
          <div>
            <p className="text-vintage-brown mb-2">
              Drag & drop photos here, or click to select
            </p>
            <p className="text-sm text-vintage-sepia">
              Supports: JPG, PNG, HEIC/HEIF (Apple Photos), WebP
            </p>
            <p className="text-xs text-vintage-sepia mt-1">
              HEIC files will be automatically converted to JPEG
            </p>
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-vintage-brown font-medium">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
            </p>
            <p className="text-xs text-vintage-sepia">
              Drag photos to reorder • Add captions below (optional)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`space-y-2 transition-opacity ${
                  draggedIndex === index ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <div className="relative group cursor-move">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent group-hover:border-vintage-brown/30 transition-colors">
                    <Image
                      src={photo.url}
                      alt={photo.caption || `Photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Control buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => movePhoto(index, index - 1)}
                      disabled={index === 0}
                      className="bg-vintage-brown/90 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-vintage-brown disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                      title="Move left"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(index, index + 1)}
                      disabled={index === photos.length - 1}
                      className="bg-vintage-brown/90 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-vintage-brown disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                      title="Move right"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 shadow-lg"
                      title="Remove photo"
                    >
                      ×
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-2 bg-vintage-brown/80 text-white px-2 py-1 rounded text-xs font-medium">
                    Photo {index + 1}
                  </div>

                  {/* Drag handle indicator */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-60 transition-opacity">
                    <svg
                      className="w-6 h-6 text-white drop-shadow"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-16h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    value={photo.caption || ''}
                    onChange={(e) => updateCaption(photo.id, e.target.value)}
                    placeholder="Add a caption (optional)"
                    className="w-full px-3 py-2 text-sm border-2 border-vintage-sepia rounded-lg focus:outline-none focus:border-vintage-brown transition-colors bg-white placeholder:text-vintage-sepia/60"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
