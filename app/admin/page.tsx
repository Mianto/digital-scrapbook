import { getAllEntries } from '@/lib/entries';
import Link from 'next/link';
import AdminEntriesTable from '@/components/AdminEntriesTable';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const entries = await getAllEntries();

  return (
    <main className="min-h-screen">
      <header className="bg-vintage-sepia/30 border-b-4 border-vintage-brown py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-handwritten text-vintage-dark">
            Admin Dashboard
          </h1>
          <p className="text-vintage-brown mt-2">
            Manage your scrapbook entries
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/admin/new-entry"
            className="inline-block bg-vintage-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-vintage-dark transition-colors"
          >
            + Create New Entry
          </Link>
        </div>

        <AdminEntriesTable entries={entries} />

        <div className="mt-8">
          <Link
            href="/"
            className="text-vintage-brown hover:text-vintage-dark underline"
          >
            ← Back to Timeline
          </Link>
        </div>
      </div>
    </main>
  );
}
