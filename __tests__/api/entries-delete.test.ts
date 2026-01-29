import { DELETE } from '@/app/api/entries/delete/route';
import { deleteEntry } from '@/lib/entries';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('@/lib/entries');
jest.mock('next-auth');

const mockedDeleteEntry = deleteEntry as jest.MockedFunction<typeof deleteEntry>;
const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('Delete Entry API Route', () => {
  beforeEach(() => {
    // Mock authenticated session
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'user-1', name: 'Test User' },
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete entry successfully when authenticated', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ date: '2026-01-29' }),
    } as unknown as NextRequest;

    mockedDeleteEntry.mockResolvedValue(undefined);

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(mockedDeleteEntry).toHaveBeenCalledWith('2026-01-29');
  });

  it('should return 401 when not authenticated', async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ date: '2026-01-29' }),
    } as unknown as NextRequest;

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(mockedDeleteEntry).not.toHaveBeenCalled();
  });

  it('should return 400 when date is missing', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({}),
    } as unknown as NextRequest;

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Date is required' });
    expect(mockedDeleteEntry).not.toHaveBeenCalled();
  });

  it('should return 500 on deletion failure', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ date: '2026-01-29' }),
    } as unknown as NextRequest;

    mockedDeleteEntry.mockRejectedValue(new Error('Delete failed'));

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to delete entry' });
  });
});
