import { Module } from '@nestjs/common';
import { KhqrService } from './khqr.service';
import { KhqrController } from './khqr.controller';

@Module({
  controllers: [KhqrController],
  providers: [KhqrService],
  exports: [KhqrService],
})
export class KhqrModule {}
