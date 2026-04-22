import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // POST /api/v1/sales  [admin + cashier]
  @Post()
  create(
    @Body() dto: CreateSaleDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.salesService.create(dto, userId);
  }

  // GET /api/v1/sales  [admin sees all; cashier sees own]
  @Get()
  findAll(
    @CurrentUser('id') userId: number,
    @CurrentUser('role') role: string,
  ) {
    return this.salesService.findAll(userId, role);
  }

  // GET /api/v1/sales/:id  [admin + cashier]
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }
}
