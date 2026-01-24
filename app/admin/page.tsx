import { getAllEntries } from '@/lib/entries';
import { format } from 'date-fns';
import Link from 'next/link';

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

        <div className="bg-white/80 rounded-lg shadow-md overflow-hidden border-2 border-vintage-sepia">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-vintage-sepia/30 border-b-2 border-vintage-brown">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-vintage-dark">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-vintage-dark">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-vintage-dark">
                    Photos
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-vintage-dark">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vintage-sepia">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-vintage-brown">
                      No entries yet. Create your first memory!
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-vintage-cream transition-colors">
                      <td className="px-6 py-4 text-sm text-vintage-dark">
                        {format(new Date(entry.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-vintage-dark font-medium">
                        {entry.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-vintage-brown">
                        {entry.photos.length} photo{entry.photos.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/entries/${entry.date}`}
                          className="text-vintage-brown hover:text-vintage-dark underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

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
