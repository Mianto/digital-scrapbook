'use client';

import { ScrapbookEntry } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminEntriesTableProps {
  entries: ScrapbookEntry[];
}

export default function AdminEntriesTable({ entries: initialEntries }: AdminEntriesTableProps) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (entry: ScrapbookEntry) => {
    const confirmMessage = `Are you sure you want to delete "${entry.title}" from ${format(new Date(entry.date), 'MMM d, yyyy')}?\n\nThis action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setDeletingId(entry.id);

    try {
      const response = await fetch(`/api/entries/delete?date=${entry.date}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      // Remove from local state
      setEntries(entries.filter(e => e.id !== entry.id));

      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white/80 rounded-lg shadow-md overflow-hidden border-2 border-vintage-sepia">
        <div className="px-6 py-8 text-center text-vintage-brown">
          No entries yet. Create your first memory!
        </div>
      </div>
    );
  }

  return (
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
            {entries.map((entry) => (
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
                  <div className="flex gap-3">
                    <Link
                      href={`/entries/${entry.date}`}
                      className="text-vintage-brown hover:text-vintage-dark underline"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(entry)}
                      disabled={deletingId === entry.id}
                      className="text-red-600 hover:text-red-800 underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === entry.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
