import { VercelBlobAdapter } from '@/lib/storage/vercel-blob';
import { ScrapbookEntry } from '@/types';
import { list, put, del, head } from '@vercel/blob';

// Mock @vercel/blob
jest.mock('@vercel/blob');

const mockedList = list as jest.MockedFunction<typeof list>;
const mockedPut = put as jest.MockedFunction<typeof put>;
const mockedDel = del as jest.MockedFunction<typeof del>;
const mockedHead = head as jest.MockedFunction<typeof head>;

describe('VercelBlobAdapter', () => {
  let adapter: VercelBlobAdapter;
  const testEntry: ScrapbookEntry = {
    id: 'test-id-123',
    date: '2026-01-29',
    title: 'Test Entry',
    description: 'Test description',
    photos: [
      {
        id: 'photo-1',
        url: 'https://blob.vercel-storage.com/photo-123.jpg',
        width: 800,
        height: 600,
      },
    ],
    createdAt: '2026-01-29T12:00:00Z',
    updatedAt: '2026-01-29T12:00:00Z',
  };

  beforeEach(() => {
    adapter = new VercelBlobAdapter();
    jest.clearAllMocks();

    // Mock global fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('listEntries', () => {
    it('should return empty array when no entries exist', async () => {
      mockedList.mockResolvedValue({ blobs: [] } as any);

      const entries = await adapter.listEntries();

      expect(entries).toEqual([]);
      expect(mockedList).toHaveBeenCalledWith({ prefix: 'entries/' });
    });

    it('should fetch and parse entries from blobs', async () => {
      const blob1 = { url: 'https://blob.com/entries/2026-01-28.json' };
      const blob2 = { url: 'https://blob.com/entries/2026-01-29.json' };
      const entry1 = { ...testEntry, date: '2026-01-28' };
      const entry2 = { ...testEntry, date: '2026-01-29' };

      mockedList.mockResolvedValue({ blobs: [blob1, blob2] } as any);

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => entry1,
        })
        .mockResolvedValueOnce({
          json: async () => entry2,
        });

      const entries = await adapter.listEntries();

      expect(entries).toHaveLength(2);
      expect(entries[0].date).toBe('2026-01-29'); // Newest first
      expect(entries[1].date).toBe('2026-01-28');
    });

    it('should return empty array on error', async () => {
      mockedList.mockRejectedValue(new Error('Network error'));

      const entries = await adapter.listEntries();

      expect(entries).toEqual([]);
    });
  });

  describe('getEntry', () => {
    it('should return entry by date', async () => {
      const blobMetadata = { url: 'https://blob.com/entries/2026-01-29.json' };

      mockedHead.mockResolvedValue(blobMetadata as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => testEntry,
      });

      const entry = await adapter.getEntry('2026-01-29');

      expect(entry).toEqual(testEntry);
      expect(mockedHead).toHaveBeenCalledWith('entries/2026-01-29.json');
    });

    it('should return null when entry does not exist', async () => {
      mockedHead.mockResolvedValue(null as any);

      const entry = await adapter.getEntry('2026-01-29');

      expect(entry).toBeNull();
    });

    it('should return null on fetch error', async () => {
      mockedHead.mockRejectedValue(new Error('Blob not found'));

      const entry = await adapter.getEntry('2026-01-29');

      expect(entry).toBeNull();
    });
  });

  describe('createEntry', () => {
    it('should create entry successfully', async () => {
      mockedPut.mockResolvedValue({ url: 'https://blob.com/entries/2026-01-29.json' } as any);

      await adapter.createEntry(testEntry);

      expect(mockedPut).toHaveBeenCalledWith(
        'entries/2026-01-29.json',
        expect.stringContaining('"id": "test-id-123"'),
        {
          access: 'public',
          contentType: 'application/json',
        }
      );
    });

    it('should throw error on creation failure', async () => {
      mockedPut.mockRejectedValue(new Error('Upload failed'));

      await expect(adapter.createEntry(testEntry)).rejects.toThrow('Upload failed');
    });
  });

  describe('deleteEntry', () => {
    it('should delete entry and associated photos', async () => {
      const blobMetadata = { url: 'https://blob.com/entries/2026-01-29.json' };

      mockedHead.mockResolvedValue(blobMetadata as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => testEntry,
      });
      mockedDel.mockResolvedValue(undefined as any);

      await adapter.deleteEntry('2026-01-29');

      // Should delete photo
      expect(mockedDel).toHaveBeenCalledWith(
        'https://blob.vercel-storage.com/photo-123.jpg'
      );
      // Should delete entry
      expect(mockedDel).toHaveBeenCalledWith('entries/2026-01-29.json');
    });

    it('should continue deletion even if photo deletion fails', async () => {
      const entryWithMultiplePhotos = {
        ...testEntry,
        photos: [
          { id: '1', url: 'https://blob.com/photo1.jpg', width: 800, height: 600 },
          { id: '2', url: 'https://blob.com/photo2.jpg', width: 800, height: 600 },
        ],
      };

      const blobMetadata = { url: 'https://blob.com/entries/2026-01-29.json' };

      mockedHead.mockResolvedValue(blobMetadata as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => entryWithMultiplePhotos,
      });
      mockedDel
        .mockRejectedValueOnce(new Error('Photo 1 delete failed'))
        .mockResolvedValue(undefined as any);

      await adapter.deleteEntry('2026-01-29');

      // Should still attempt to delete entry
      expect(mockedDel).toHaveBeenCalledWith('entries/2026-01-29.json');
    });
  });

  describe('uploadPhoto', () => {
    it('should upload photo and return URL', async () => {
      const buffer = Buffer.from('test image data');
      const blobUrl = 'https://blob.vercel-storage.com/test-abc123.jpg';

      mockedPut.mockResolvedValue({ url: blobUrl } as any);

      const url = await adapter.uploadPhoto(buffer, 'test.jpg', 'image/jpeg');

      expect(url).toBe(blobUrl);
      expect(mockedPut).toHaveBeenCalledWith('test.jpg', buffer, {
        access: 'public',
        contentType: 'image/jpeg',
      });
    });

    it('should throw error on upload failure', async () => {
      const buffer = Buffer.from('test image data');
      mockedPut.mockRejectedValue(new Error('Upload failed'));

      await expect(
        adapter.uploadPhoto(buffer, 'test.jpg', 'image/jpeg')
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo by URL', async () => {
      mockedDel.mockResolvedValue(undefined as any);

      await adapter.deletePhoto('https://blob.vercel-storage.com/photo-123.jpg');

      expect(mockedDel).toHaveBeenCalledWith(
        'https://blob.vercel-storage.com/photo-123.jpg'
      );
    });

    it('should handle deletion error gracefully', async () => {
      mockedDel.mockRejectedValue(new Error('Photo not found'));

      await expect(
        adapter.deletePhoto('https://blob.vercel-storage.com/photo-123.jpg')
      ).rejects.toThrow('Photo not found');
    });
  });
});
