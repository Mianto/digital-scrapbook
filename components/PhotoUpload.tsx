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
          <p className="text-sm text-vintage-brown font-medium">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded. Add captions below (optional):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {photos.map((photo, index) => (
              <div key={photo.id} className="space-y-2">
                <div className="relative group">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={photo.url}
                      alt={photo.caption || `Photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                    title="Remove photo"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-2 left-2 bg-vintage-brown/80 text-white px-2 py-1 rounded text-xs font-medium">
                    Photo {index + 1}
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
