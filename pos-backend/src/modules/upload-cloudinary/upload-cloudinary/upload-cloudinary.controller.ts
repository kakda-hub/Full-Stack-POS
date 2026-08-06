import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadCloudinaryService } from './upload-cloudinary.service';
import { SkipIntercept } from '../../../common/decorators/skip-intercept.decorator';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('Cloudinary File Upload')
@Controller('cloudinary')
export class UploadCloudinaryController {
  constructor(private readonly cloudinaryService: UploadCloudinaryService) { }

  @Post('upload')
  @ApiOperation({ summary: 'Upload image to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'ជ្រើសរើសហ្វាយរូបភាព និងបញ្ជាក់ឈ្មោះ Folder',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'pos-products', default: 'pos-general' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string
  ) {
    const result = await this.cloudinaryService.uploadImage(file, folder);
    return {
      success: true,
      statusCode: 201,
      message: 'File uploaded successfully',
      data: result
    };
  }

  @Get()
  @SkipIntercept()
  @ApiOperation({ summary: 'List Cloudinary resources (server-side paginated)' })
  @ApiQuery({ name: 'search', required: false, description: 'Filter resources by public ID or format (case-insensitive). Omit or leave empty to return all records.' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['public_id', 'format', 'bytes', 'created_at'], description: 'Field to sort by (default: created_at)' })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'], description: 'Sort direction (default: desc)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Zero-based offset (default: 0)' })
  @ApiQuery({ name: 'max', required: false, type: Number, description: 'Max records (default: 10, max: 500)' })
  async list(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sort') sort?: string,
    @Query('offset') offset?: string,
    @Query('max') max?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    try {
      const { resources, total_count } = await this.cloudinaryService.listResources({
        search,
        sortBy,
        sort: sort === 'asc' ? 'asc' : 'desc',
        offset: Number(offset) || 0,
        max: Number(max) || 10,
      });
      return {
        success: true,
        statusCode: 200,
        data: resources,
        total: total_count,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const statusCode = error?.status || 500;
      if (res) res.status(statusCode);
      return {
        success: false,
        statusCode,
        data: [],
        total: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(':publicId')
  @ApiOperation({ summary: 'Get a Cloudinary resource by public ID' })
  async get(@Param('publicId') publicId: string) {
    const resource = await this.cloudinaryService.getResource(publicId);
    return {
      success: true,
      statusCode: 200,
      data: resource,
    };
  }

  @Put('rename')
  @ApiOperation({ summary: 'Rename (move) a Cloudinary resource' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        oldPublicId: { type: 'string' },
        newPublicId: { type: 'string' }
      }
    }
  })
  async rename(
    @Body('oldPublicId') oldPublicId: string,
    @Body('newPublicId') newPublicId: string,
  ) {
    const result = await this.cloudinaryService.renameResource(oldPublicId, newPublicId);
    return {
      success: true,
      statusCode: 200,
      message: "Resource renamed successfully",
      data: result,
    };
  }

  @Delete(':publicId')
  @ApiOperation({ summary: 'Delete a Cloudinary resource by public ID' })
  async delete(@Param('publicId') publicId: string) {
    const result = await this.cloudinaryService.deleteResource(publicId);
    return {
      success: true,
      statusCode: 200,
      message: "Resource deleted successfully",
      data: result,
    };
  }
}
