import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDynamicService } from './upload-dynamic.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Dynamic File Upload (S3)')
@Controller('dynamicFileuploadS3')
export class UploadDynamicController {
  constructor(private readonly uploadDynamicService: UploadDynamicService) { }

  @Post()
  @ApiOperation({ summary: 'Upload a file to S3/MinIO storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        path: { type: 'string', example: 'products/images' },
        uploadBy: { type: 'string', example: 'admin' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('path') customPath?: string,
    @Body('uploadBy') uploadBy?: string,
  ) {
    if (!file) {
      return {
        PID: null,
        data: [],
        error: 'No file uploaded',
        message: 'Please provide a file in the "file" field.',
        statusCode: '0',
        total: 0,
      };
    }

    try {
      const result = await this.uploadDynamicService.uploadFile(file, customPath, uploadBy);
      return {
        PID: null,
        data: [result],
        error: null,
        message: 'File uploaded successfully to S3.',
        statusCode: '1',
        total: 1,
      };
    } catch (error) {
      return {
        PID: null,
        data: [],
        error: error.message,
        message: 'Failed to upload file to S3.',
        statusCode: '0',
        total: 0,
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all uploaded files' })
  async findAll() {
    const files = await this.uploadDynamicService.findAll();
    return {
      PID: null,
      data: files,
      error: null,
      message: 'Files retrieved successfully.',
      statusCode: '1',
      total: files.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific uploaded file by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const file = await this.uploadDynamicService.findOne(id);
    return {
      PID: null,
      data: [file],
      error: null,
      message: 'File retrieved successfully.',
      statusCode: '1',
      total: 1,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an uploaded file by ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.uploadDynamicService.remove(id);
    return {
      PID: null,
      data: [],
      error: null,
      message: 'File deleted successfully.',
      statusCode: '1',
      total: 0,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update/replace an uploaded file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file?: Express.Multer.File,
    @Body() updateData?: any,
  ) {
    try {
      const result = await this.uploadDynamicService.update(id, file, updateData);
      return {
        PID: null,
        data: [result],
        error: null,
        message: 'File updated successfully.',
        statusCode: '1',
        total: 1,
      };
    } catch (error) {
      return {
        PID: null,
        data: [],
        error: error.message,
        message: 'Failed to update file.',
        statusCode: '0',
        total: 0,
      };
    }
  }
}
