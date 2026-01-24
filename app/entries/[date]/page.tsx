import { getEntryByDate } from '@/lib/entries';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface EntryPageProps {
  params: {
    date: string;
  };
}

export default async function EntryPage({ params }: EntryPageProps) {
  const entry = await getEntryByDate(params.date);

  if (!entry) {
    notFound();
  }

  const displayDate = format(new Date(entry.date), 'MMMM d, yyyy');

  return (
    <main className="min-h-screen">
      <header className="bg-vintage-sepia/30 border-b-4 border-vintage-brown py-6">
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="text-vintage-brown hover:text-vintage-dark mb-4 inline-block"
          >
            ← Back to Timeline
          </Link>
          <h1 className="text-4xl md:text-5xl font-handwritten text-vintage-dark">
            {entry.title}
          </h1>
          <p className="text-vintage-brown mt-2">{displayDate}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Photos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {entry.photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`polaroid ${index === 0 && entry.photos.length % 2 === 1 ? 'md:col-span-2' : ''}`}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                <Image
                  src={photo.url}
                  alt={photo.caption || entry.title}
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

        {/* Description */}
        {entry.description && (
          <div className="bg-white/50 p-8 rounded-lg shadow-md border-2 border-vintage-sepia">
            <p className="text-lg leading-relaxed text-vintage-dark whitespace-pre-wrap">
              {entry.description}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
