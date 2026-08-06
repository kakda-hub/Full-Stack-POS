import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, ParseIntPipe, Query,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto, ReceivePurchaseOrderDto } from './dto/purchase-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PurchaseOrderListQueryDto } from './dto/purchase-order-list-query.dto';
import { ApiListQuery } from '../../common/decorators/api-list-query.decorator';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly poService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order' })
  create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser('id') userId: number) {
    return this.poService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders (paginated)' })
  @ApiListQuery()
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'ordered', 'partially_received', 'received', 'cancelled'], description: 'Filter by status' })
  findAll(@Query() query: PurchaseOrderListQueryDto) {
    return this.poService.findAll(query);
  }

  @Get('pending-count')
  @ApiOperation({ summary: 'Get the count of pending (non-received, non-cancelled) purchase orders' })
  async getPendingCount() {
    const count = await this.poService.getPendingCount();
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase order by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.poService.findOne(id);
  }

  @Patch(':id/receive')
  @ApiOperation({ summary: 'Receive a purchase order (updates stock)' })
  receive(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReceivePurchaseOrderDto,
  ) {
    return this.poService.receive(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a purchase order' })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.poService.cancel(id);
  }
}
