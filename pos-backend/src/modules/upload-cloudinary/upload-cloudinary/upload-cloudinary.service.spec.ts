import { HttpException, HttpStatus } from '@nestjs/common';
import { UploadCloudinaryService } from './upload-cloudinary.service';

// Mock the cloudinary SDK
jest.mock('cloudinary', () => ({
  v2: {
    api: {
      resources: jest.fn(),
    },
    uploader: {
      upload_stream: jest.fn(),
      rename: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

import { v2 as cloudinary } from 'cloudinary';

describe('UploadCloudinaryService', () => {
  let service: UploadCloudinaryService;

  const mockResource = {
    public_id: 'pos-products/abc123',
    format: 'jpg',
    version: 1234567890,
    resource_type: 'image',
    type: 'upload',
    created_at: '2025-01-15T10:00:00Z',
    bytes: 12345,
    width: 800,
    height: 600,
    url: 'https://res.cloudinary.com/demo/image/upload/v1/pos-products/abc123.jpg',
    secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/pos-products/abc123.jpg',
  };

  const mockResources = { resources: [mockResource], total_count: 1 };

  beforeEach(() => {
    service = new UploadCloudinaryService();
    jest.clearAllMocks();
    (cloudinary.api.resources as jest.Mock).mockResolvedValue(mockResources);
  });

  describe('listResources', () => {
    it('should return all resources when no query is given', async () => {
      const result = await service.listResources();

      expect(cloudinary.api.resources).toHaveBeenCalledWith({ max_results: 500 });
      expect(result.resources).toHaveLength(1);
      expect(result.total_count).toBe(1);
    });

    it('should return all resources when search is empty', async () => {
      const result = await service.listResources({ search: '' });

      expect(cloudinary.api.resources).toHaveBeenCalledWith({ max_results: 500 });
      expect(result.resources).toHaveLength(1);
    });

    it('should return all resources when search is whitespace only', async () => {
      const result = await service.listResources({ search: '   ' });

      expect(result.resources).toHaveLength(1);
    });

    it('should filter resources by public_id (case-insensitive)', async () => {
      (cloudinary.api.resources as jest.Mock).mockResolvedValue({
        resources: [
          { ...mockResource, public_id: 'pos-products/abc123', format: 'jpg' },
          { ...mockResource, public_id: 'pos-general/logo', format: 'png' },
        ],
      });

      const result = await service.listResources({ search: 'ABC123' });

      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].public_id).toBe('pos-products/abc123');
    });

    it('should filter resources by format (case-insensitive)', async () => {
      (cloudinary.api.resources as jest.Mock).mockResolvedValue({
        resources: [
          { ...mockResource, public_id: 'a/one', format: 'jpg' },
          { ...mockResource, public_id: 'a/two', format: 'png' },
        ],
      });

      const result = await service.listResources({ search: 'PNG' });

      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].public_id).toBe('a/two');
    });

    it('should return no resources when nothing matches', async () => {
      const result = await service.listResources({ search: 'nonexistent-token' });

      expect(result.resources).toHaveLength(0);
    });

    it('should apply offset/max slicing with a correct total', async () => {
      (cloudinary.api.resources as jest.Mock).mockResolvedValue({
        resources: [
          { ...mockResource, public_id: 'a/1', format: 'jpg', created_at: '2025-01-01T00:00:00Z' },
          { ...mockResource, public_id: 'a/2', format: 'png', created_at: '2025-01-02T00:00:00Z' },
          { ...mockResource, public_id: 'a/3', format: 'webp', created_at: '2025-01-03T00:00:00Z' },
        ],
      });

      const result = await service.listResources({ offset: 1, max: 1, sortBy: 'created_at', sort: 'desc' });

      // total is the full filtered count, data is the requested slice
      expect(result.total_count).toBe(3);
      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].public_id).toBe('a/2');
    });

    it('should ignore invalid sort fields and fall back to created_at desc', async () => {
      (cloudinary.api.resources as jest.Mock).mockResolvedValue({
        resources: [
          { ...mockResource, public_id: 'a/1', created_at: '2025-01-01T00:00:00Z' },
          { ...mockResource, public_id: 'a/2', created_at: '2025-01-02T00:00:00Z' },
        ],
      });

      const result = await service.listResources({ sortBy: 'hacked', sort: 'desc' });

      expect(result.resources[0].public_id).toBe('a/2'); // newest first
    });

    it('should clamp offset to 0 and max to the 500 ceiling', async () => {
      (cloudinary.api.resources as jest.Mock).mockResolvedValue({
        resources: [mockResource],
      });

      const result = await service.listResources({ offset: -5, max: 9999 });

      expect(result.resources).toHaveLength(1);
    });

    it('should rethrow Cloudinary errors as HttpException', async () => {
      (cloudinary.api.resources as jest.Mock).mockRejectedValue({
        error: { message: 'cloudinary down', http_code: 503 },
      });

      await expect(service.listResources()).rejects.toThrow(HttpException);
      await expect(service.listResources()).rejects.toMatchObject({
        status: HttpStatus.SERVICE_UNAVAILABLE,
      });
    });
  });
});
