import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SaleListQueryDto } from './dto/sale-list-query.dto';
import { ApiListQuery } from '../../common/decorators/api-list-query.decorator';

@ApiTags('Sales')
@ApiBearerAuth()

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // POST /api/v1/sales  [admin + cashier]
  @Post()
  @ApiOperation({ summary: 'Create a new sale' })
  create(
    @Body() dto: CreateSaleDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.salesService.create(dto, userId);
  }

  // GET /api/v1/sales  [admin sees all; cashier sees own]
  @Get()
  @ApiOperation({ summary: 'Get all sales (paginated)' })
  @ApiListQuery()
  @ApiQuery({ name: 'paymentMethod', required: false, enum: ['cash', 'aba', 'card'], description: 'Filter by payment method' })
  findAll(
    @CurrentUser('id') userId: number,
    @CurrentUser('role') role: string,
    @Query() query: SaleListQueryDto,
  ) {
    return this.salesService.findAll(userId, role, query);
  }

  // GET /api/v1/sales/:id  [admin + cashier]
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific sale by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }
}
