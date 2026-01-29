import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhotoUpload from '@/components/PhotoUpload';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('PhotoUpload', () => {
  const mockOnPhotosChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        url: '/uploads/test-photo.jpg',
        width: 800,
        height: 600,
      }),
    });
  });

  it('should render upload dropzone', () => {
    render(<PhotoUpload onPhotosChange={mockOnPhotosChange} />);

    expect(screen.getByText(/Drag & drop photos here/i)).toBeInTheDocument();
  });

  it('should display supported formats', () => {
    render(<PhotoUpload onPhotosChange={mockOnPhotosChange} />);

    expect(screen.getByText(/JPG, PNG, HEIC/i)).toBeInTheDocument();
  });

  it('should show photo count after upload', async () => {
    render(<PhotoUpload onPhotosChange={mockOnPhotosChange} />);

    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('presentation').querySelector('input[type="file"]');

    if (input) {
      await userEvent.upload(input, file);
    }

    await waitFor(() => {
      expect(screen.getByText(/1 photo uploaded/i)).toBeInTheDocument();
    });
  });

  it('should call onPhotosChange after successful upload', async () => {
    render(<PhotoUpload onPhotosChange={mockOnPhotosChange} />);

    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const dropzone = screen.getByText(/Drag & drop photos here/i).closest('div');

    if (dropzone) {
      const input = dropzone.querySelector('input[type="file"]');
      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
        });
        fireEvent.change(input);
      }
    }

    await waitFor(() => {
      expect(mockOnPhotosChange).toHaveBeenCalled();
    });
  });

  it('should allow caption editing', async () => {
    const { rerender } = render(<PhotoUpload onPhotosChange={mockOnPhotosChange} />);

    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const dropzone = screen.getByText(/Drag & drop photos here/i).closest('div');

    if (dropzone) {
      const input = dropzone.querySelector('input[type="file"]');
      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
        });
        fireEvent.change(input);
      }
    }

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Add a caption/i)).toBeInTheDocument();
    });

    const captionInput = screen.getByPlaceholderText(/Add a caption/i);
    await userEvent.type(captionInput, 'My test caption');

    await waitFor(() => {
      expect(mockOnPhotosChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            caption: 'My test caption',
          }),
        ])
      );
    });
  });

  it('should show uploading state', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ url: '/uploads/test.jpg', width: 800, height: 600 }),
      }), 100))
    );

    render(<PhotoUpload onPhotosChange={mockOnPhotosChange} />);

    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const dropzone = screen.getByText(/Drag & drop photos here/i).closest('div');

    if (dropzone) {
      const input = dropzone.querySelector('input[type="file"]');
      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
        });
        fireEvent.change(input);
      }
    }

    expect(await screen.findByText(/Uploading.../i)).toBeInTheDocument();
  });

  it('should handle upload error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Upload failed'));
    global.alert = jest.fn();

    render(<PhotoUpload onPhotosChange={mockOnPhotosChange} />);

    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const dropzone = screen.getByText(/Drag & drop photos here/i).closest('div');

    if (dropzone) {
      const input = dropzone.querySelector('input[type="file"]');
      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
        });
        fireEvent.change(input);
      }
    }

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Failed to upload')
      );
    });
  });

  it('should allow photo removal', async () => {
    render(<PhotoUpload onPhotosChange={mockOnPhotosChange} />);

    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const dropzone = screen.getByText(/Drag & drop photos here/i).closest('div');

    if (dropzone) {
      const input = dropzone.querySelector('input[type="file"]');
      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
        });
        fireEvent.change(input);
      }
    }

    await waitFor(() => {
      expect(screen.getByTitle('Remove photo')).toBeInTheDocument();
    });

    const removeButton = screen.getByTitle('Remove photo');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockOnPhotosChange).toHaveBeenCalledWith([]);
    });
  });

  it('should show reorder controls on hover', async () => {
    render(<PhotoUpload onPhotosChange={mockOnPhotosChange} />);

    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const dropzone = screen.getByText(/Drag & drop photos here/i).closest('div');

    if (dropzone) {
      const input = dropzone.querySelector('input[type="file"]');
      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
        });
        fireEvent.change(input);
      }
    }

    await waitFor(() => {
      expect(screen.getByTitle('Move left')).toBeInTheDocument();
      expect(screen.getByTitle('Move right')).toBeInTheDocument();
    });
  });
});
