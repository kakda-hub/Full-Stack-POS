import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuickPicksService } from './quick-picks.service';
import { QuickPicksController } from './quick-picks.controller';
import { QuickPick } from './entities/quick-pick.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuickPick])],
  controllers: [QuickPicksController],
  providers: [QuickPicksService],
  exports: [QuickPicksService],
})
export class QuickPicksModule {}
