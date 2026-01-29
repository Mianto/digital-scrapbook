import { POST } from '@/app/api/entries/create/route';
import { createEntry } from '@/lib/entries';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('@/lib/entries');
jest.mock('next-auth');

const mockedCreateEntry = createEntry as jest.MockedFunction<typeof createEntry>;
const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('Create Entry API Route', () => {
  const validEntry = {
    id: 'test-id',
    date: '2026-01-29',
    title: 'Test Entry',
    description: 'Test description',
    photos: [],
    createdAt: '2026-01-29T12:00:00Z',
    updatedAt: '2026-01-29T12:00:00Z',
  };

  beforeEach(() => {
    // Mock authenticated session
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'user-1', name: 'Test User' },
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create entry successfully when authenticated', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue(validEntry),
    } as unknown as NextRequest;

    mockedCreateEntry.mockResolvedValue(undefined);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(mockedCreateEntry).toHaveBeenCalledWith(validEntry);
  });

  it('should return 401 when not authenticated', async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const mockRequest = {
      json: jest.fn().mockResolvedValue(validEntry),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(mockedCreateEntry).not.toHaveBeenCalled();
  });

  it('should return 500 on creation failure', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue(validEntry),
    } as unknown as NextRequest;

    mockedCreateEntry.mockRejectedValue(new Error('Database error'));

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to create entry' });
  });

  it('should return 400 for invalid entry data', async () => {
    const invalidEntry = { title: 'Missing required fields' };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(invalidEntry),
    } as unknown as NextRequest;

    mockedCreateEntry.mockRejectedValue(new Error('Validation error'));

    const response = await POST(mockRequest);

    expect(response.status).toBe(500);
  });
});
