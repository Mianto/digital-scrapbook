'use client';

import { Photo } from '@/types';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface VintagePhotoGridProps {
  photos: Photo[];
  entryTitle: string;
}

interface PhotoEffect {
  rotation: number;
  hasTopTape: boolean;
  hasStain: boolean;
  stainType: number;
  sepiaType: string;
  hasCorners: boolean;
}

export default function VintagePhotoGrid({ photos, entryTitle }: VintagePhotoGridProps) {
  const [photoEffects, setPhotoEffects] = useState<PhotoEffect[]>([]);

  useEffect(() => {
    // Generate random effects for each photo
    const effects = photos.map(() => ({
      rotation: Math.random() * 6 - 3, // -3 to 3 degrees
      hasTopTape: Math.random() > 0.4, // 60% chance of tape
      hasStain: Math.random() > 0.5, // 50% chance of stain
      stainType: Math.random() > 0.5 ? 1 : 2,
      sepiaType: (() => {
        const rand = Math.random();
        if (rand > 0.6) return 'sepia-heavy';
        if (rand > 0.3) return 'sepia-filter';
        return 'sepia-light';
      })(),
      hasCorners: Math.random() > 0.7, // 30% chance of corner decoration
    }));
    setPhotoEffects(effects);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.length]);

  if (photoEffects.length === 0) {
    // Return basic grid while effects are loading
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {photos.map((photo) => (
          <div key={photo.id} className="polaroid">
            <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
              <Image
                src={photo.url}
                alt={photo.caption || entryTitle}
                fill
                className="object-cover sepia-filter"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              />
            </div>
            {photo.caption && (
              <p className="mt-4 text-center font-handwritten text-lg text-vintage-dark">
                {photo.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
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
                alt={photo.caption || entryTitle}
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
  );
}
