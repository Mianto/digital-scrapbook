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

  // Generate random rotation on mount
  useEffect(() => {
    setRotation(Math.random() * 4 - 2); // Random rotation between -2 and 2 degrees
  }, []);

  const displayDate = format(new Date(entry.date), 'MMMM d, yyyy');
  const mainPhoto = entry.photos[0];

  return (
    <Link href={`/entries/${entry.date}`}>
      <div
        className="polaroid cursor-pointer relative"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          {mainPhoto && (
            <Image
              src={mainPhoto.url}
              alt={entry.title}
              fill
              className="object-cover sepia-filter"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
        <div className="mt-4 text-center">
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
