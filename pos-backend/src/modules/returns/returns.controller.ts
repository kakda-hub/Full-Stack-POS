import {
  Controller, Get, Post, Body, Param,
  UseGuards, ParseIntPipe, Query,
} from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/return.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Returns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a return/refund (restocks inventory)' })
  create(@Body() dto: CreateReturnDto, @CurrentUser('id') userId: number) {
    return this.returnsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all returns (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() pagination?: PaginationDto) {
    return this.returnsService.findAll(pagination ?? {});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a return by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.returnsService.findOne(id);
  }
}
