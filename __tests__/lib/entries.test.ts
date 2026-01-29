import { getAllEntries, getEntryByDate, createEntry, deleteEntry } from '@/lib/entries';
import { getStorageAdapter } from '@/lib/storage';
import { ScrapbookEntry } from '@/types';

// Mock the storage module
jest.mock('@/lib/storage');

const mockedGetStorageAdapter = getStorageAdapter as jest.MockedFunction<typeof getStorageAdapter>;

describe('Entries Library', () => {
  let mockAdapter: any;
  const testEntry: ScrapbookEntry = {
    id: 'test-id-123',
    date: '2026-01-29',
    title: 'Test Entry',
    description: 'Test description',
    photos: [],
    createdAt: '2026-01-29T12:00:00Z',
    updatedAt: '2026-01-29T12:00:00Z',
  };

  beforeEach(() => {
    mockAdapter = {
      listEntries: jest.fn(),
      getEntry: jest.fn(),
      createEntry: jest.fn(),
      deleteEntry: jest.fn(),
      uploadPhoto: jest.fn(),
      deletePhoto: jest.fn(),
    };

    mockedGetStorageAdapter.mockReturnValue(mockAdapter);
  });

  describe('getAllEntries', () => {
    it('should return all entries from storage adapter', async () => {
      const entries = [testEntry];
      mockAdapter.listEntries.mockResolvedValue(entries);

      const result = await getAllEntries();

      expect(result).toEqual(entries);
      expect(mockAdapter.listEntries).toHaveBeenCalled();
    });

    it('should handle empty entries', async () => {
      mockAdapter.listEntries.mockResolvedValue([]);

      const result = await getAllEntries();

      expect(result).toEqual([]);
    });
  });

  describe('getEntryByDate', () => {
    it('should return entry for given date', async () => {
      mockAdapter.getEntry.mockResolvedValue(testEntry);

      const result = await getEntryByDate('2026-01-29');

      expect(result).toEqual(testEntry);
      expect(mockAdapter.getEntry).toHaveBeenCalledWith('2026-01-29');
    });

    it('should return null when entry not found', async () => {
      mockAdapter.getEntry.mockResolvedValue(null);

      const result = await getEntryByDate('2026-01-29');

      expect(result).toBeNull();
    });
  });

  describe('createEntry', () => {
    it('should create entry using storage adapter', async () => {
      mockAdapter.createEntry.mockResolvedValue(undefined);

      await createEntry(testEntry);

      expect(mockAdapter.createEntry).toHaveBeenCalledWith(testEntry);
    });

    it('should propagate errors from storage adapter', async () => {
      const error = new Error('Storage error');
      mockAdapter.createEntry.mockRejectedValue(error);

      await expect(createEntry(testEntry)).rejects.toThrow('Storage error');
    });
  });

  describe('deleteEntry', () => {
    it('should delete entry using storage adapter', async () => {
      mockAdapter.deleteEntry.mockResolvedValue(undefined);

      await deleteEntry('2026-01-29');

      expect(mockAdapter.deleteEntry).toHaveBeenCalledWith('2026-01-29');
    });

    it('should propagate errors from storage adapter', async () => {
      const error = new Error('Delete failed');
      mockAdapter.deleteEntry.mockRejectedValue(error);

      await expect(deleteEntry('2026-01-29')).rejects.toThrow('Delete failed');
    });
  });
});
