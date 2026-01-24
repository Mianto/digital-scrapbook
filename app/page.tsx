import { getAllEntries } from '@/lib/entries';
import Timeline from '@/components/Timeline';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const entries = await getAllEntries();

  return (
    <main className="min-h-screen">
      <header className="bg-vintage-sepia/30 border-b-4 border-vintage-brown py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-handwritten text-center text-vintage-dark">
            Our Digital Scrapbook
          </h1>
          <p className="text-center text-vintage-brown mt-2 font-serif">
            A collection of our memories together
          </p>
          <div className="text-center mt-4">
            <Link
              href="/admin"
              className="text-sm text-vintage-brown hover:text-vintage-dark underline"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </header>

      <Timeline entries={entries} />
    </main>
  );
}
