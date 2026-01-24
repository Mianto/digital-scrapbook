import { getEntryByDate } from '@/lib/entries';
import { format } from 'date-fns';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import VintagePhotoGrid from '@/components/VintagePhotoGrid';

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
        <VintagePhotoGrid photos={entry.photos} entryTitle={entry.title} />

        {/* Description */}
        {entry.description && (
          <div className="aged-paper p-8 rounded-lg shadow-md vintage-border relative overflow-hidden">
            <div className="absolute top-2 right-2 w-12 h-12 opacity-10">
              <svg viewBox="0 0 24 24" fill="currentColor" className="text-vintage-brown">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <p className="text-lg leading-relaxed text-vintage-dark whitespace-pre-wrap relative z-10">
              {entry.description}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
