import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, ParseIntPipe, Query,
} from '@nestjs/common';
import { QuickPicksService } from './quick-picks.service';
import { CreateQuickPickDto, UpdateQuickPickDto } from './dto/quick-pick.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Quick Picks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quick-picks')
export class QuickPicksController {
  constructor(private readonly quickPicksService: QuickPicksService) {}

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create a new quick-pick item' })
  create(@Body() dto: CreateQuickPickDto) {
    return this.quickPicksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active quick-pick items' })
  @ApiQuery({ name: 'includeInactive', required: false, type: String })
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.quickPicksService.findAll(includeInactive === 'true');
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get a quick-pick item by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quickPicksService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a quick-pick item' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuickPickDto) {
    return this.quickPicksService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quick-pick item' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.quickPicksService.remove(id);
  }
}
