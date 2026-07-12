import {
  Controller, Get, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementQueryDto } from './dto/stock-movement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Stock Movements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly movementsService: StockMovementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stock movements (paginated, filterable)' })
  findAll(@Query() query: StockMovementQueryDto) {
    return this.movementsService.findAll(query);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get stock movements for a specific product' })
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.movementsService.findByProduct(productId);
  }
}
