'use client';

import { Photo } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface EntryPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  date: string;
  description: string;
  photos: Photo[];
}

interface PhotoEffect {
  rotation: number;
  hasTopTape: boolean;
  hasStain: boolean;
  stainType: number;
  sepiaType: string;
  hasCorners: boolean;
}

export default function EntryPreview({
  isOpen,
  onClose,
  title,
  date,
  description,
  photos,
}: EntryPreviewProps) {
  const [photoEffects, setPhotoEffects] = useState<PhotoEffect[]>([]);

  useEffect(() => {
    if (isOpen && photos.length > 0) {
      // Generate random effects for preview
      const effects = photos.map(() => ({
        rotation: Math.random() * 6 - 3,
        hasTopTape: Math.random() > 0.4,
        hasStain: Math.random() > 0.5,
        stainType: Math.random() > 0.5 ? 1 : 2,
        sepiaType: (() => {
          const rand = Math.random();
          if (rand > 0.6) return 'sepia-heavy';
          if (rand > 0.3) return 'sepia-filter';
          return 'sepia-light';
        })(),
        hasCorners: Math.random() > 0.7,
      }));
      setPhotoEffects(effects);
    }
  }, [isOpen, photos.length]);

  if (!isOpen) return null;

  const displayDate = date ? format(new Date(date), 'MMMM d, yyyy') : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-vintage-cream rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto paper-texture">
        {/* Header */}
        <div className="sticky top-0 bg-vintage-sepia/90 backdrop-blur border-b-4 border-vintage-brown py-4 px-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-handwritten text-vintage-dark">Preview</h2>
            <p className="text-sm text-vintage-brown">How your entry will look</p>
          </div>
          <button
            onClick={onClose}
            className="bg-vintage-brown text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-vintage-dark transition-colors shadow-lg"
            title="Close preview"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Entry Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-handwritten text-vintage-dark mb-2">
              {title || 'Untitled Entry'}
            </h1>
            {displayDate && (
              <p className="text-vintage-brown">{displayDate}</p>
            )}
          </div>

          {/* Photos */}
          {photos.length > 0 && photoEffects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
              {photos.map((photo, index) => {
                const effect = photoEffects[index];
                const isOddAndFirst = index === 0 && photos.length % 2 === 1;

                return (
                  <div
                    key={photo.id}
                    className={`polaroid ${effect.hasTopTape ? 'vintage-tape' : ''} ${
                      effect.hasStain ? `vintage-stain-${effect.stainType}` : ''
                    } ${effect.hasCorners ? 'scrapbook-corner' : ''} ${
                      isOddAndFirst ? 'md:col-span-2 md:max-w-2xl md:mx-auto' : ''
                    }`}
                    style={{ transform: `rotate(${effect.rotation}deg)` }}
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-gray-100 vintage-vignette">
                      <Image
                        src={photo.url}
                        alt={photo.caption || title || 'Preview photo'}
                        fill
                        className={`object-cover ${effect.sepiaType}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                      />
                    </div>
                    {photo.caption && (
                      <p className="mt-4 text-center font-handwritten text-lg text-vintage-dark relative z-10">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {photos.length === 0 && (
            <div className="text-center py-12 text-vintage-brown">
              <p>No photos uploaded yet</p>
              <p className="text-sm mt-2">Upload photos to see them in the preview</p>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="aged-paper p-8 rounded-lg shadow-md vintage-border relative overflow-hidden">
              <div className="absolute top-2 right-2 w-12 h-12 opacity-10">
                <svg viewBox="0 0 24 24" fill="currentColor" className="text-vintage-brown">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <p className="text-lg leading-relaxed text-vintage-dark whitespace-pre-wrap relative z-10">
                {description}
              </p>
            </div>
          )}

          {!description && (
            <div className="text-center py-8 text-vintage-brown/70">
              <p className="text-sm">No description added</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-vintage-sepia/90 backdrop-blur border-t-2 border-vintage-brown py-4 px-6 flex justify-center">
          <button
            onClick={onClose}
            className="bg-vintage-brown text-white px-8 py-3 rounded-lg font-medium hover:bg-vintage-dark transition-colors shadow-lg"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
