import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UploadListQueryDto } from './dto/upload-list-query.dto';
import { ApiListQuery } from '../../common/decorators/api-list-query.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('File Upload')
@Controller('dynamicFileupload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List uploaded files (server-side paginated)' })
  @ApiListQuery()
  async findAll(@Query() query: UploadListQueryDto) {
    return this.uploadService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Upload a file to local storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        uploadBy: { type: 'string', example: 'admin' },
      },
    },
  })
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
