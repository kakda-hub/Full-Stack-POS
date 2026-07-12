import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { UploadCloudinaryController } from './upload-cloudinary.controller';
import { UploadCloudinaryService } from './upload-cloudinary.service';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../../common/filters/http-exception.filter';

describe('UploadCloudinaryController (integration)', () => {
  let app: INestApplication;
  let cloudinaryService: jest.Mocked<UploadCloudinaryService>;

  const mockUploadResult = {
    originalFileName: 'test.jpg',
    fileName: 'pos-products/abc123.jpg',
    filePath: 'pos-products',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/pos-products/abc123.jpg',
    fileExtension: 'jpg',
    fileSize: 12345,
    uploadBy: 'admin',
    destinationStorage: 'CLOUDINARY',
    width: 800,
    height: 600,
    id: 'asset_abc123',
    uploadType: 'file-upload-type-general',
    isDeleted: false,
    uploadDate: new Date().toISOString(),
  };

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
    folder: 'pos-products',
  };

  const mockResources = { resources: [mockResource], total_count: 1 };

  beforeAll(async () => {
    cloudinaryService = {
      uploadImage: jest.fn(),
      listResources: jest.fn(),
      getResource: jest.fn(),
      renameResource: jest.fn(),
      deleteResource: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UploadCloudinaryController],
      providers: [
        { provide: UploadCloudinaryService, useValue: cloudinaryService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── POST /cloudinary/upload ────────────────────────────────────────────
  describe('POST /cloudinary/upload', () => {
    it('should upload an image with default folder', async () => {
      cloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);

      const response = await request(app.getHttpServer())
        .post('/cloudinary/upload')
        .attach('file', Buffer.from('fake-image'), 'photo.jpg')
        .expect(201);

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        expect.objectContaining({ originalname: 'photo.jpg' }),
        undefined, // no folder provided, so undefined
      );
      // Response wrapped by interceptor: response.body.data has the controller's response
      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.message).toBe('File uploaded successfully');
      expect(response.body.data.data.originalFileName).toBe('test.jpg');
    });

    it('should upload with custom folder', async () => {
      cloudinaryService.uploadImage.mockResolvedValue(mockUploadResult);

      await request(app.getHttpServer())
        .post('/cloudinary/upload')
        .attach('file', Buffer.from('fake-image'), 'photo.jpg')
        .field('folder', 'pos-products')
        .expect(201);

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        expect.any(Object),
        'pos-products',
      );
    });

    it('should handle missing file (undefined passed to service)', async () => {
      // The controller does NOT have a null check for file (unlike other upload controllers).
      // When no file is attached, @UploadedFile() returns undefined, and the
      // service receives undefined.
      cloudinaryService.uploadImage.mockResolvedValue(undefined as any);

      const response = await request(app.getHttpServer())
        .post('/cloudinary/upload')
        .expect(201);

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(undefined, undefined);
      expect(response.body.data.data).toBeUndefined();
    });
  });

  // ─── GET /cloudinary ────────────────────────────────────────────────────
  describe('GET /cloudinary', () => {
    it('should list Cloudinary resources', async () => {
      cloudinaryService.listResources.mockResolvedValue(mockResources);

      const response = await request(app.getHttpServer())
        .get('/cloudinary')
        .expect(200);

      expect(cloudinaryService.listResources).toHaveBeenCalled();
      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.data.resources).toHaveLength(1);
    });
  });

  // ─── GET /cloudinary/:publicId ──────────────────────────────────────────
  describe('GET /cloudinary/:publicId', () => {
    it('should get a resource by public ID', async () => {
      cloudinaryService.getResource.mockResolvedValue(mockResource);

      const response = await request(app.getHttpServer())
        .get('/cloudinary/pos-products%2Fabc123') // URL-encoded publicId
        .expect(200);

      expect(cloudinaryService.getResource).toHaveBeenCalledWith('pos-products/abc123');
      expect(response.body.success).toBe(true);
      expect(response.body.data.data.public_id).toBe('pos-products/abc123');
    });
  });

  // ─── PUT /cloudinary/rename ─────────────────────────────────────────────
  describe('PUT /cloudinary/rename', () => {
    it('should rename a Cloudinary resource', async () => {
      const renameResult = {
        public_id: 'pos-products/new-name',
        overwritten: false,
      };
      cloudinaryService.renameResource.mockResolvedValue(renameResult);

      const response = await request(app.getHttpServer())
        .put('/cloudinary/rename')
        .send({
          oldPublicId: 'pos-products/abc123',
          newPublicId: 'pos-products/new-name',
        })
        .expect(200);

      expect(cloudinaryService.renameResource).toHaveBeenCalledWith(
        'pos-products/abc123',
        'pos-products/new-name',
      );
      expect(response.body.data.message).toBe('Resource renamed successfully');
      expect(response.body.data.data.public_id).toBe('pos-products/new-name');
    });

    it('should handle missing body fields (passed as undefined to service)', async () => {
      cloudinaryService.renameResource.mockResolvedValue({} as any);

      await request(app.getHttpServer())
        .put('/cloudinary/rename')
        .send({})
        .expect(200);

      // @Body('oldPublicId') returns undefined when not provided; same for newPublicId
      expect(cloudinaryService.renameResource).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  // ─── DELETE /cloudinary/:publicId ───────────────────────────────────────
  describe('DELETE /cloudinary/:publicId', () => {
    it('should delete a Cloudinary resource', async () => {
      const deleteResult = { result: 'ok' };
      cloudinaryService.deleteResource.mockResolvedValue(deleteResult);

      const response = await request(app.getHttpServer())
        .delete('/cloudinary/pos-products%2Fabc123')
        .expect(200);

      expect(cloudinaryService.deleteResource).toHaveBeenCalledWith('pos-products/abc123');
      expect(response.body.data.message).toBe('Resource deleted successfully');
      expect(response.body.data.data.result).toBe('ok');
    });
  });
});
