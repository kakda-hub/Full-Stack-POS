import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadCloudinaryService } from './upload-cloudinary.service';
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
  @ApiOperation({ summary: 'List recent Cloudinary resources' })
  async list() {
    const resources = await this.cloudinaryService.listResources();
    return {
      success: true,
      statusCode: 200,
      data: resources,
    };
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