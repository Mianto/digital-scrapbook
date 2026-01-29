import { getStorageAdapter } from '@/lib/storage';
import { LocalStorageAdapter } from '@/lib/storage/local';
import { VercelBlobAdapter } from '@/lib/storage/vercel-blob';

describe('Storage Factory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getStorageAdapter', () => {
    it('should return LocalStorageAdapter when no BLOB_READ_WRITE_TOKEN', () => {
      delete process.env.BLOB_READ_WRITE_TOKEN;
      delete process.env.STORAGE_ADAPTER;

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(LocalStorageAdapter);
    });

    it('should return VercelBlobAdapter when BLOB_READ_WRITE_TOKEN exists', () => {
      process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
      delete process.env.STORAGE_ADAPTER;

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(VercelBlobAdapter);
    });

    it('should force LocalStorageAdapter when STORAGE_ADAPTER=local', () => {
      process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
      process.env.STORAGE_ADAPTER = 'local';

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(LocalStorageAdapter);
    });

    it('should force VercelBlobAdapter when STORAGE_ADAPTER=vercel', () => {
      delete process.env.BLOB_READ_WRITE_TOKEN;
      process.env.STORAGE_ADAPTER = 'vercel';

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(VercelBlobAdapter);
    });
  });
});
