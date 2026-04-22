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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // POST /api/v1/categories  [admin only]
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  // GET /api/v1/categories  [all roles]
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  // GET /api/v1/categories/:id  [all roles]
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  // PATCH /api/v1/categories/:id  [admin only]
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  // DELETE /api/v1/categories/:id  [admin only]
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
