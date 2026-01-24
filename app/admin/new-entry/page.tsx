'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import PhotoUpload from '@/components/PhotoUpload';
import { Photo } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export default function NewEntryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (photos.length === 0) {
      setError('Please upload at least one photo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const entry = {
        id: uuidv4(),
        date,
        title,
        description,
        photos,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch('/api/entries/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error('Failed to create entry');
      }

      router.push(`/entries/${date}`);
      router.refresh();
    } catch (err) {
      setError('Failed to create entry. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <header className="bg-vintage-sepia/30 border-b-4 border-vintage-brown py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-handwritten text-vintage-dark">
            Create New Entry
          </h1>
          <p className="text-vintage-brown mt-2">
            Add a new memory to your scrapbook
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-vintage-dark mb-2"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-vintage-sepia rounded-lg focus:outline-none focus:border-vintage-brown transition-colors bg-white"
              required
            />
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-vintage-dark mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sunday Morning Breakfast"
              className="w-full px-4 py-2 border-2 border-vintage-sepia rounded-lg focus:outline-none focus:border-vintage-brown transition-colors bg-white"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-vintage-dark mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write about this memory..."
              rows={6}
              className="w-full px-4 py-2 border-2 border-vintage-sepia rounded-lg focus:outline-none focus:border-vintage-brown transition-colors bg-white resize-none"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-vintage-dark mb-2">
              Photos *
            </label>
            <PhotoUpload onPhotosChange={setPhotos} />
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || photos.length === 0}
              className="flex-1 bg-vintage-brown text-white py-3 rounded-lg font-medium hover:bg-vintage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Entry'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-vintage-sepia text-vintage-dark rounded-lg font-medium hover:bg-vintage-sepia/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
