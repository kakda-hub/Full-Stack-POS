import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { DateRangeDto, TopProductsDto } from './dto/reports.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // GET /api/v1/reports/summary?from=2025-01-01&to=2025-12-31
  @Get('summary')
  getSummary(@Query() query: DateRangeDto) {
    return this.reportsService.getSummary(query);
  }

  // GET /api/v1/reports/daily-revenue?from=2025-01-01&to=2025-01-31
  @Get('daily-revenue')
  getDailyRevenue(@Query() query: DateRangeDto) {
    return this.reportsService.getDailyRevenue(query);
  }

  // GET /api/v1/reports/top-products?limit=5&from=2025-01-01&to=2025-01-31
  @Get('top-products')
  getTopProducts(@Query() query: TopProductsDto & DateRangeDto) {
    return this.reportsService.getTopProducts(query);
  }

  // GET /api/v1/reports/payment-summary?from=2025-01-01&to=2025-01-31
  @Get('payment-summary')
  getPaymentSummary(@Query() query: DateRangeDto) {
    return this.reportsService.getPaymentSummary(query);
  }

  // GET /api/v1/reports/sales-by-cashier?from=2025-01-01&to=2025-01-31
  @Get('sales-by-cashier')
  getSalesByCashier(@Query() query: DateRangeDto) {
    return this.reportsService.getSalesByCashier(query);
  }
}
