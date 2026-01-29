import React from 'react';
import { render, screen } from '@testing-library/react';
import EntryCard from '@/components/EntryCard';
import { ScrapbookEntry } from '@/types';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('EntryCard', () => {
  const mockEntry: ScrapbookEntry = {
    id: 'test-id-123',
    date: '2026-01-29',
    title: 'Test Memory',
    description: 'A wonderful day',
    photos: [
      {
        id: 'photo-1',
        url: '/uploads/test-photo.jpg',
        caption: 'Test caption',
        width: 800,
        height: 600,
      },
    ],
    createdAt: '2026-01-29T12:00:00Z',
    updatedAt: '2026-01-29T12:00:00Z',
  };

  it('should render entry card with title', () => {
    render(<EntryCard entry={mockEntry} />);

    expect(screen.getByText('Test Memory')).toBeInTheDocument();
  });

  it('should render formatted date', () => {
    render(<EntryCard entry={mockEntry} />);

    // date-fns formats '2026-01-29' as 'January 29, 2026'
    expect(screen.getByText(/January 29, 2026/)).toBeInTheDocument();
  });

  it('should render photo when available', () => {
    render(<EntryCard entry={mockEntry} />);

    const img = screen.getByAltText('Test Memory');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/uploads/test-photo.jpg');
  });

  it('should render photo count when multiple photos', () => {
    const entryWithMultiplePhotos = {
      ...mockEntry,
      photos: [
        { id: '1', url: '/uploads/1.jpg', width: 800, height: 600 },
        { id: '2', url: '/uploads/2.jpg', width: 800, height: 600 },
        { id: '3', url: '/uploads/3.jpg', width: 800, height: 600 },
      ],
    };

    render(<EntryCard entry={entryWithMultiplePhotos} />);

    expect(screen.getByText(/3 photos/i)).toBeInTheDocument();
  });

  it('should link to entry detail page', () => {
    render(<EntryCard entry={mockEntry} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/entries/2026-01-29');
  });

  it('should handle entry with no photos', () => {
    const entryWithoutPhotos = {
      ...mockEntry,
      photos: [],
    };

    render(<EntryCard entry={entryWithoutPhotos} />);

    expect(screen.getByText('Test Memory')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should truncate long descriptions', () => {
    const entryWithLongDescription = {
      ...mockEntry,
      description: 'A'.repeat(200),
    };

    render(<EntryCard entry={entryWithLongDescription} />);

    const description = screen.getByText(/A+/);
    expect(description.textContent?.length).toBeLessThan(200);
  });
});
