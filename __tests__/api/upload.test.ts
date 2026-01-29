import { POST } from '@/app/api/upload/route';
import { getStorageAdapter } from '@/lib/storage';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/storage');
jest.mock('heic-convert');

const mockedGetStorageAdapter = getStorageAdapter as jest.MockedFunction<typeof getStorageAdapter>;

describe('Upload API Route', () => {
  let mockAdapter: any;

  beforeEach(() => {
    mockAdapter = {
      uploadPhoto: jest.fn(),
    };
    mockedGetStorageAdapter.mockReturnValue(mockAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should upload a JPEG photo successfully', async () => {
    const mockFile = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', mockFile);

    const mockRequest = {
      formData: jest.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;

    mockAdapter.uploadPhoto.mockResolvedValue('https://example.com/photo.jpg');

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      url: 'https://example.com/photo.jpg',
      width: 800,
      height: 600,
    });
    expect(mockAdapter.uploadPhoto).toHaveBeenCalled();
  });

  it('should return 400 when no file provided', async () => {
    const formData = new FormData();

    const mockRequest = {
      formData: jest.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'No file provided' });
  });

  it('should upload a PNG photo successfully', async () => {
    const mockFile = new File(['image data'], 'test.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', mockFile);

    const mockRequest = {
      formData: jest.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;

    mockAdapter.uploadPhoto.mockResolvedValue('https://example.com/photo.png');

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toBe('https://example.com/photo.png');
  });

  it('should handle upload errors', async () => {
    const mockFile = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', mockFile);

    const mockRequest = {
      formData: jest.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;

    mockAdapter.uploadPhoto.mockRejectedValue(new Error('Upload failed'));

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Upload failed' });
  });
});
