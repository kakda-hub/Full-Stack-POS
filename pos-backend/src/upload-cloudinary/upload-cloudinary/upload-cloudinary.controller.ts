import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadCloudinaryService } from './upload-cloudinary.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('Cloudinary File Upload') // ប្តូរឈ្មោះឱ្យស្អាតក្នុង Swagger
@Controller('cloudinary') // ដាក់ Version ឱ្យចំស្តង់ដារ POS
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

  @Put('rename') // ប្តូរមកប្រើ Body វិញដើម្បីងាយស្រួលក្នុង Swagger
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
}