import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { KhqrService } from './khqr.service';
import { GenerateKhqrDto } from './dto/khqr.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('KHQR')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('khqr')
export class KhqrController {
  constructor(private readonly khqrService: KhqrService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a KHQR payment QR code for ABA/Bakong' })
  async generate(@Body() dto: GenerateKhqrDto) {
    return this.khqrService.generateQR(dto.amount, dto.billNumber);
  }
}
