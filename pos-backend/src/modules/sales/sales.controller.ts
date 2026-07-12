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
import { PaginationDto } from '../../common/dto/pagination.dto';

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
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  findAll(
    @CurrentUser('id') userId: number,
    @CurrentUser('role') role: string,
    @Query() pagination?: PaginationDto,
  ) {
    return this.salesService.findAll(userId, role, pagination ?? {});
  }

  // GET /api/v1/sales/:id  [admin + cashier]
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific sale by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }
}
