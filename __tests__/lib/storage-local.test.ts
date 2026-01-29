import { LocalStorageAdapter } from '@/lib/storage/local';
import { ScrapbookEntry } from '@/types';
import fs from 'fs/promises';
import path from 'path';

// Mock fs/promises
jest.mock('fs/promises');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;
  const testEntry: ScrapbookEntry = {
    id: 'test-id-123',
    date: '2026-01-29',
    title: 'Test Entry',
    description: 'Test description',
    photos: [
      {
        id: 'photo-1',
        url: '/uploads/test-photo.jpg',
        width: 800,
        height: 600,
      },
    ],
    createdAt: '2026-01-29T12:00:00Z',
    updatedAt: '2026-01-29T12:00:00Z',
  };

  beforeEach(() => {
    adapter = new LocalStorageAdapter();
    jest.clearAllMocks();
  });

  describe('listEntries', () => {
    it('should return empty array when no entries exist', async () => {
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.readdir.mockResolvedValue([]);

      const entries = await adapter.listEntries();

      expect(entries).toEqual([]);
      expect(mockedFs.mkdir).toHaveBeenCalled();
      expect(mockedFs.readdir).toHaveBeenCalled();
    });

    it('should return entries sorted by date (newest first)', async () => {
      const entry1 = { ...testEntry, date: '2026-01-28' };
      const entry2 = { ...testEntry, date: '2026-01-29' };

      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.readdir.mockResolvedValue(['2026-01-28.json', '2026-01-29.json'] as any);
      mockedFs.readFile
        .mockResolvedValueOnce(JSON.stringify(entry1))
        .mockResolvedValueOnce(JSON.stringify(entry2));

      const entries = await adapter.listEntries();

      expect(entries).toHaveLength(2);
      expect(entries[0].date).toBe('2026-01-29'); // Newest first
      expect(entries[1].date).toBe('2026-01-28');
    });

    it('should filter out non-JSON files', async () => {
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.readdir.mockResolvedValue(['entry.json', 'readme.txt', 'data.csv'] as any);
      mockedFs.readFile.mockResolvedValue(JSON.stringify(testEntry));

      const entries = await adapter.listEntries();

      expect(entries).toHaveLength(1);
      expect(mockedFs.readFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEntry', () => {
    it('should return entry by date', async () => {
      mockedFs.readFile.mockResolvedValue(JSON.stringify(testEntry));

      const entry = await adapter.getEntry('2026-01-29');

      expect(entry).toEqual(testEntry);
      expect(mockedFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('2026-01-29.json'),
        'utf-8'
      );
    });

    it('should return null when entry does not exist', async () => {
      mockedFs.readFile.mockRejectedValue(new Error('ENOENT: no such file'));

      const entry = await adapter.getEntry('2026-01-29');

      expect(entry).toBeNull();
    });
  });

  describe('createEntry', () => {
    it('should create entry successfully', async () => {
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);

      await adapter.createEntry(testEntry);

      expect(mockedFs.mkdir).toHaveBeenCalled();
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('2026-01-29.json'),
        expect.stringContaining('"id": "test-id-123"'),
        'utf-8'
      );
    });

    it('should throw error on write failure', async () => {
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockRejectedValue(new Error('Write failed'));

      await expect(adapter.createEntry(testEntry)).rejects.toThrow('Write failed');
    });
  });

  describe('deleteEntry', () => {
    it('should delete entry and associated photos', async () => {
      mockedFs.readFile.mockResolvedValue(JSON.stringify(testEntry));
      mockedFs.unlink.mockResolvedValue(undefined);

      await adapter.deleteEntry('2026-01-29');

      // Should delete photo
      expect(mockedFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('test-photo.jpg')
      );
      // Should delete entry
      expect(mockedFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('2026-01-29.json')
      );
    });

    it('should continue deletion even if photo deletion fails', async () => {
      const entryWithMultiplePhotos = {
        ...testEntry,
        photos: [
          { id: '1', url: '/uploads/photo1.jpg', width: 800, height: 600 },
          { id: '2', url: '/uploads/photo2.jpg', width: 800, height: 600 },
        ],
      };

      mockedFs.readFile.mockResolvedValue(JSON.stringify(entryWithMultiplePhotos));
      mockedFs.unlink
        .mockRejectedValueOnce(new Error('Photo 1 delete failed'))
        .mockResolvedValue(undefined);

      await adapter.deleteEntry('2026-01-29');

      // Should still delete entry even if photo fails
      expect(mockedFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('2026-01-29.json')
      );
    });
  });

  describe('uploadPhoto', () => {
    it('should upload photo and return URL', async () => {
      const buffer = Buffer.from('test image data');
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);

      const url = await adapter.uploadPhoto(buffer, 'test.jpg', 'image/jpeg');

      expect(url).toBe('/uploads/test.jpg');
      expect(mockedFs.mkdir).toHaveBeenCalled();
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('test.jpg'),
        buffer
      );
    });

    it('should throw error on upload failure', async () => {
      const buffer = Buffer.from('test image data');
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockRejectedValue(new Error('Disk full'));

      await expect(
        adapter.uploadPhoto(buffer, 'test.jpg', 'image/jpeg')
      ).rejects.toThrow('Disk full');
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo by URL', async () => {
      mockedFs.unlink.mockResolvedValue(undefined);

      await adapter.deletePhoto('/uploads/test-photo.jpg');

      expect(mockedFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('test-photo.jpg')
      );
    });

    it('should handle deletion error gracefully', async () => {
      mockedFs.unlink.mockRejectedValue(new Error('Photo not found'));

      await expect(
        adapter.deletePhoto('/uploads/test-photo.jpg')
      ).rejects.toThrow('Photo not found');
    });
  });
});
