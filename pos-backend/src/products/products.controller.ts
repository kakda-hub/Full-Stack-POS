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
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, AdjustStockDto } from './dto/product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // POST /api/v1/products  [admin only]
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  // GET /api/v1/products  [all roles]
  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.productsService.findAll(includeInactive === 'true');
  }

  // GET /api/v1/products/barcode/:barcode  [all roles]
  @Get('barcode/:barcode')
  findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  // GET /api/v1/products/:id  [all roles]
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // PATCH /api/v1/products/:id  [admin only]
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  // PATCH /api/v1/products/:id/stock  [admin only]
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id/stock')
  adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdjustStockDto,
  ) {
    return this.productsService.adjustStock(id, dto);
  }

  // DELETE /api/v1/products/:id  [admin only]
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
