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
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { LowStockQueryDto } from './dto/low-stock-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ApiListQuery } from '../../common/decorators/api-list-query.decorator';

@ApiTags('Products')
@ApiBearerAuth()

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  // POST /api/v1/products  [admin only]
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  // GET /api/v1/products  [all roles]
  @Get()
  @ApiOperation({ summary: 'Get all products (paginated)' })
  @ApiListQuery()
  @ApiQuery({ name: 'includeInactive', required: false, type: String, description: 'Include inactive products' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, description: 'Filter by category id' })
  findAll(@Query() query: ProductListQueryDto) {
    return this.productsService.findAll(query);
  }

  // GET /api/v1/products/low-stock  [all roles]
  @Get('low-stock')
  @ApiOperation({ summary: 'Get all low-stock products (stock ≤ threshold)' })
  @ApiListQuery()
  getLowStock(@Query() query: LowStockQueryDto) {
    return this.productsService.getLowStock(query);
  }

  // GET /api/v1/products/barcode/:barcode  [all roles]
  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Get a product by barcode' })
  findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  // GET /api/v1/products/:id  [all roles]
  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // PATCH /api/v1/products/:id  [admin only]
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product by ID' })
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
  @ApiOperation({ summary: 'Adjust product stock' })
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
  @ApiOperation({ summary: 'Delete a product by ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
