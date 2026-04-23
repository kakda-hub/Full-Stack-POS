import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('dynamicFileupload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
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
    const savedFile = await this.uploadService.uploadFile(file, uploadBy);
    return this.uploadService.formatResponse(savedFile);
  }
}
