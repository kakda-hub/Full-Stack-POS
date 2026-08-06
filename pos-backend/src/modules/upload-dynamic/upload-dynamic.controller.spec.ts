import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { UploadDynamicController } from './upload-dynamic.controller';
import { UploadDynamicService } from './upload-dynamic.service';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

describe('UploadDynamicController (integration)', () => {
  let app: INestApplication;
  let uploadService: jest.Mocked<UploadDynamicService>;

  const mockFile = {
    id: 1,
    originalFileName: 'test.jpg',
    fileName: 'uuid-file.jpg',
    filePath: 'uploads/2025/01/15',
    fileUrl: 'https://s3.example.com/bucket/uploads/2025/01/15/uuid-file.jpg',
    fileExtension: 'jpg',
    fileSize: 12345,
    uploadBy: 'admin',
    destinationStorage: 'S3',
    uploadType: 'file-upload-type-general',
    width: null,
    height: null,
    description: null,
    isDeleted: false,
    groupID: null,
    publicId: null,
    uploadDate: new Date(),
  };

  beforeAll(async () => {
    uploadService = {
      uploadFile: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UploadDynamicController],
      providers: [
        { provide: UploadDynamicService, useValue: uploadService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
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

  // ─── POST /api/v1/dynamicFileuploadS3 ──────────────────────────────────
  describe('POST /api/v1/dynamicFileuploadS3', () => {
    it('should upload a file to S3', async () => {
      uploadService.uploadFile.mockResolvedValue(mockFile);

      const response = await request(app.getHttpServer())
        .post('/api/v1/dynamicFileuploadS3')
        .attach('file', Buffer.from('fake-image'), 'test.jpg')
        .field('uploadBy', 'admin')
        .expect(201);

      expect(uploadService.uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({ originalname: 'test.jpg' }),
        undefined, // customPath not provided
        'admin',
      );
      // Response wrapped by ResponseInterceptor
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('uploaded successfully');
      expect(response.body.data.data[0].originalFileName).toBe('test.jpg');
    });

    it('should upload with custom path', async () => {
      uploadService.uploadFile.mockResolvedValue(mockFile);

      await request(app.getHttpServer())
        .post('/api/v1/dynamicFileuploadS3')
        .attach('file', Buffer.from('fake-image'), 'doc.pdf')
        .field('path', 'documents')
        .field('uploadBy', 'cashier')
        .expect(201);

      expect(uploadService.uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({ originalname: 'doc.pdf' }),
        'documents',
        'cashier',
      );
    });

    it('should return error JSON when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/dynamicFileuploadS3')
        .field('uploadBy', 'admin')
        .expect(201);

      expect(uploadService.uploadFile).not.toHaveBeenCalled();
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Please provide a file in the "file" field.');
      expect(response.body.data.error).toBe('No file uploaded');
      expect(response.body.data.statusCode).toBe('0');
    });

    it('should handle service errors gracefully', async () => {
      uploadService.uploadFile.mockRejectedValue(new Error('S3 connection failed'));

      const response = await request(app.getHttpServer())
        .post('/api/v1/dynamicFileuploadS3')
        .attach('file', Buffer.from('test'), 'error.txt')
        .expect(201);

      // Controller catches errors and returns custom error JSON
      expect(response.body.success).toBe(true);
      expect(response.body.data.error).toBe('S3 connection failed');
      expect(response.body.data.message).toBe('Failed to upload file to S3.');
      expect(response.body.data.statusCode).toBe('0');
    });
  });

  // ─── GET /api/v1/dynamicFileuploadS3 ────────────────────────────────────
  describe('GET /api/v1/dynamicFileuploadS3', () => {
    const mockPaginatedResult = {
      data: [mockFile],
      total: 1,
      page: 1,
      limit: 10,
    };

    it('should return the standard list envelope with defaults', async () => {
      uploadService.findAll.mockResolvedValue(mockPaginatedResult as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/dynamicFileuploadS3')
        .expect(200);

      expect(uploadService.findAll).toHaveBeenCalledWith({});
      // Standard envelope: data is the flat array, total at the top level
      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(1);
      expect(response.body.total).toBe(1);
      expect(response.body.timestamp).toBeDefined();
    });

    it('should pass search, sort and pagination params to the service', async () => {
      uploadService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/dynamicFileuploadS3?search=invoice&sortBy=uploadDate&sort=desc&offset=0&max=10&destinationStorage=S3')
        .expect(200);

      expect(uploadService.findAll).toHaveBeenCalledWith({
        search: 'invoice',
        sortBy: 'uploadDate',
        sort: 'desc',
        offset: 0,
        max: 10,
        destinationStorage: 'S3',
      });
    });

    it('should reject invalid sort direction', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/dynamicFileuploadS3?sort=invalid')
        .expect(400);
    });

    it('should reject negative offset', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/dynamicFileuploadS3?offset=-1')
        .expect(400);
    });

    it('should reject max above 100', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/dynamicFileuploadS3?max=1000')
        .expect(400);
    });
  });

  // ─── GET /api/v1/dynamicFileuploadS3/:id ────────────────────────────────
  describe('GET /api/v1/dynamicFileuploadS3/:id', () => {
    it('should return a file by id', async () => {
      uploadService.findOne.mockResolvedValue(mockFile);

      const response = await request(app.getHttpServer())
        .get('/api/v1/dynamicFileuploadS3/1')
        .expect(200);

      expect(uploadService.findOne).toHaveBeenCalledWith(1);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data[0].id).toBe(1);
    });

    it('should return 400 when id is not a number', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/dynamicFileuploadS3/abc')
        .expect(400);
    });

    it('should handle service not-found error', async () => {
      uploadService.findOne.mockRejectedValue(new NotFoundException('File with ID 999 not found'));

      const response = await request(app.getHttpServer())
        .get('/api/v1/dynamicFileuploadS3/999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // ─── DELETE /api/v1/dynamicFileuploadS3/:id ─────────────────────────────
  describe('DELETE /api/v1/dynamicFileuploadS3/:id', () => {
    it('should soft-delete a file', async () => {
      uploadService.remove.mockResolvedValue({ ...mockFile, isDeleted: true });

      const response = await request(app.getHttpServer())
        .delete('/api/v1/dynamicFileuploadS3/1')
        .expect(200);

      expect(uploadService.remove).toHaveBeenCalledWith(1);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('File deleted successfully.');
      expect(response.body.data.total).toBe(0);
    });
  });

  // ─── PUT /api/v1/dynamicFileuploadS3/:id ────────────────────────────────
  describe('PUT /api/v1/dynamicFileuploadS3/:id', () => {
    it('should update a file with new data', async () => {
      uploadService.update.mockResolvedValue({
        ...mockFile,
        description: 'Updated description',
      });

      const response = await request(app.getHttpServer())
        .put('/api/v1/dynamicFileuploadS3/1')
        .field('description', 'Updated description')
        .expect(200);

      expect(uploadService.update).toHaveBeenCalledWith(
        1,
        undefined, // no file uploaded
        { description: 'Updated description' },
      );
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('File updated successfully.');
    });

    it('should update with new file replacement', async () => {
      uploadService.update.mockResolvedValue({
        ...mockFile,
        fileName: 'new-uuid-file.jpg',
      });

      await request(app.getHttpServer())
        .put('/api/v1/dynamicFileuploadS3/1')
        .attach('file', Buffer.from('new-image-content'), 'new-photo.png')
        .field('description', 'Replaced file')
        .expect(200);

      expect(uploadService.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ originalname: 'new-photo.png' }),
        { description: 'Replaced file' },
      );
    });

    it('should handle service errors on update', async () => {
      uploadService.update.mockRejectedValue(new Error('Update failed'));

      // PUT returns 200 by default in NestJS (unlike POST which returns 201)
      const response = await request(app.getHttpServer())
        .put('/api/v1/dynamicFileuploadS3/1')
        .field('description', 'Fail')
        .expect(200);

      // Controller catches errors and returns custom JSON
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Failed to update file.');
      expect(response.body.data.error).toBe('Update failed');
      expect(response.body.data.statusCode).toBe('0');
    });
  });
});
