'use client';

import { ScrapbookEntry } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface EntryCardProps {
  entry: ScrapbookEntry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const [rotation, setRotation] = useState(0);
  const [vintageEffects, setVintageEffects] = useState({
    hasTopTape: false,
    hasStain: false,
    stainType: 1,
    sepiaType: 'sepia-filter',
  });

  // Generate random rotation and vintage effects on mount
  useEffect(() => {
    // More dramatic rotation for authentic polaroid look
    setRotation(Math.random() * 8 - 4); // Random rotation between -4 and 4 degrees

    // Randomly apply vintage effects
    const effects = {
      hasTopTape: Math.random() > 0.5, // 50% chance of tape
      hasStain: Math.random() > 0.6, // 40% chance of stain
      stainType: Math.random() > 0.5 ? 1 : 2,
      sepiaType: (() => {
        const rand = Math.random();
        if (rand > 0.7) return 'sepia-heavy';
        if (rand > 0.4) return 'sepia-filter';
        return 'sepia-light';
      })(),
    };
    setVintageEffects(effects);
  }, []);

  const displayDate = format(new Date(entry.date), 'MMMM d, yyyy');
  const mainPhoto = entry.photos[0];

  return (
    <Link href={`/entries/${entry.date}`}>
      <div
        className={`polaroid cursor-pointer relative ${vintageEffects.hasTopTape ? 'vintage-tape' : ''} ${
          vintageEffects.hasStain ? `vintage-stain-${vintageEffects.stainType}` : ''
        }`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100 vintage-vignette">
          {mainPhoto && (
            <Image
              src={mainPhoto.url}
              alt={entry.title}
              fill
              className={`object-cover ${vintageEffects.sepiaType}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
        <div className="mt-4 text-center relative z-10">
          <h3 className="font-handwritten text-2xl text-vintage-dark">
            {entry.title}
          </h3>
          <p className="mt-1 text-sm text-vintage-brown">{displayDate}</p>
          {entry.photos.length > 1 && (
            <p className="mt-1 text-xs text-vintage-sepia">
              +{entry.photos.length - 1} more photo{entry.photos.length > 2 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
