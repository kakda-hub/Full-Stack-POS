import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { SkipIntercept } from '../../common/decorators/skip-intercept.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @SkipIntercept()
  @ApiOperation({ summary: 'Check API and database health status' })
  async check() {
    return this.healthService.check();
  }
}
