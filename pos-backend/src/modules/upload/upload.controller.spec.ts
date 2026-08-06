import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

describe('UploadController (integration)', () => {
  let app: INestApplication;
  let uploadService: jest.Mocked<UploadService>;

  const mockSavedFile = {
    id: 1,
    originalFileName: 'test.jpg',
    fileName: 'abc123.jpg',
    filePath: 'pos-general',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/pos-general/abc123.jpg',
    fileExtension: 'jpg',
    fileSize: 12345,
    uploadBy: 'admin',
    uploadType: 'file-upload-type-general',
    destinationStorage: 'CLOUDINARY',
    width: 800,
    height: 600,
    description: null,
    isDeleted: false,
    groupID: null,
    publicId: 'pos-general/abc123',
    uploadDate: new Date(),
  };

  const mockFormatResponse = {
    PID: null,
    data: [{
      id: 1,
      originalFileName: 'test.jpg',
      fileName: 'abc123.jpg',
      filePath: 'pos-general',
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/pos-general/abc123.jpg',
      fileExtension: 'jpg',
      fileSize: 12345,
      uploadBy: 'admin',
      destinationStorage: 'CLOUDINARY',
      uploadType: 'file-upload-type-general',
      width: 800,
      height: 600,
      isDeleted: false,
      description: null,
      groupID: null,
      imageSize: {},
      uploadDate: new Date(),
    }],
    error: null,
    message: 'File have been upload successfully.',
    statusCode: '1' as const,
    total: null,
  };

  beforeAll(async () => {
    uploadService = {
      uploadFile: jest.fn(),
      formatResponse: jest.fn(),
      findAll: jest.fn(),
    } as any;

    const mockJwtGuard = {
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: 1, email: 'admin@pos.com', role: 'admin' };
        return true;
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        { provide: UploadService, useValue: uploadService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue(mockJwtGuard)
      .compile();

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

  // ─── POST /api/v1/dynamicFileupload ────────────────────────────────────
  describe('POST /api/v1/dynamicFileupload', () => {
    it('should upload a file successfully', async () => {
      uploadService.uploadFile.mockResolvedValue(mockSavedFile as any);
      uploadService.formatResponse.mockReturnValue(mockFormatResponse as any);

      const response = await request(app.getHttpServer())
        .post('/api/v1/dynamicFileupload')
        .attach('file', Buffer.from('fake-image-content'), 'test.jpg')
        .field('uploadBy', 'admin')
        .expect(201);

      expect(uploadService.uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          originalname: 'test.jpg',
          buffer: expect.any(Buffer),
          size: 18, // 'fake-image-content'.length
        }),
        'admin',
      );
      expect(uploadService.formatResponse).toHaveBeenCalledWith(mockSavedFile);
      // Response is wrapped by ResponseInterceptor
      expect(response.body.success).toBe(true);
      expect(response.body.data.data[0].originalFileName).toBe('test.jpg');
      expect(response.body.data.message).toContain('upload successfully');
    });

    it('should use default uploadBy when not provided', async () => {
      uploadService.uploadFile.mockResolvedValue(mockSavedFile as any);
      uploadService.formatResponse.mockReturnValue(mockFormatResponse as any);

      await request(app.getHttpServer())
        .post('/api/v1/dynamicFileupload')
        .attach('file', Buffer.from('test'), 'photo.png')
        .expect(201);

      expect(uploadService.uploadFile).toHaveBeenCalledWith(
        expect.any(Object),
        undefined, // uploadBy is not provided, so undefined
      );
    });

    it('should return error JSON when no file is attached', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/dynamicFileupload')
        .field('uploadBy', 'admin')
        .expect(201); // Controller returns 201 even on error (custom JSON)

      // Without a file, the controller returns inline JSON (not via formatResponse)
      expect(uploadService.uploadFile).not.toHaveBeenCalled();
      expect(uploadService.formatResponse).not.toHaveBeenCalled();
      // The inline JSON is wrapped by ResponseInterceptor
      expect(response.body.success).toBe(true);
      expect(response.body.data.error).toBe('No file uploaded');
      expect(response.body.data.message).toBe('Please provide a file in the "file" field.');
      expect(response.body.data.statusCode).toBe('0');
    });
  });

  // ─── GET /api/v1/dynamicFileupload ──────────────────────────────────────
  describe('GET /api/v1/dynamicFileupload', () => {
    const mockPaginatedResult = {
      data: [mockSavedFile],
      total: 1,
      page: 1,
      limit: 10,
    };

    it('should return the standard list envelope', async () => {
      uploadService.findAll.mockResolvedValue(mockPaginatedResult as any);

      const response = await request(app.getHttpServer())
        .get('/api/v1/dynamicFileupload')
        .expect(200);

      expect(uploadService.findAll).toHaveBeenCalledWith({});
      // Standard envelope: data is the flat array, total at the top level
      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].originalFileName).toBe('test.jpg');
      expect(response.body.total).toBe(1);
      expect(response.body.timestamp).toBeDefined();
    });

    it('should pass search and pagination params to the service', async () => {
      uploadService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 } as any);

      await request(app.getHttpServer())
        .get('/api/v1/dynamicFileupload?search=logo&sortBy=uploadDate&sort=desc&offset=20&max=25&destinationStorage=CLOUDINARY')
        .expect(200);

      expect(uploadService.findAll).toHaveBeenCalledWith({
        search: 'logo',
        sortBy: 'uploadDate',
        sort: 'desc',
        offset: 20,
        max: 25,
        destinationStorage: 'CLOUDINARY',
      });
    });

    it('should reject invalid pagination params', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/dynamicFileupload?max=1000')
        .expect(400);

      await request(app.getHttpServer())
        .get('/api/v1/dynamicFileupload?offset=-5')
        .expect(400);
    });
  });
});
