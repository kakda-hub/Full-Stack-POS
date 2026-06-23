import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ManagementService } from './management.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import {
  CreateManagementPageDto,
  UpdateManagementPageDto,
} from './dto/management-page.dto';

@ApiTags('Management Pages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('management-pages')
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  // ─── Pages CRUD ───────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new management page' })
  @ApiCreatedResponse({ description: 'Page created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input (validation failed)' })
  create(@Body() dto: CreateManagementPageDto) {
    return this.managementService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active management pages (sorted)' })
  @ApiOkResponse({ description: 'List of active management pages with nested children' })
  findAll() {
    return this.managementService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a management page by ID' })
  @ApiOkResponse({ description: 'The requested management page' })
  @ApiNotFoundResponse({ description: 'Page not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a management page by ID' })
  @ApiOkResponse({ description: 'Page updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input (validation failed)' })
  @ApiNotFoundResponse({ description: 'Page not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateManagementPageDto,
  ) {
    return this.managementService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a management page by ID' })
  @ApiOkResponse({ description: 'Page deleted successfully' })
  @ApiNotFoundResponse({ description: 'Page not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.remove(id);
  }
}
