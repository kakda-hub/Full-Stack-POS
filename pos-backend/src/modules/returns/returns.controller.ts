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
import { ReturnListQueryDto } from './dto/return-list-query.dto';
import { ApiListQuery } from '../../common/decorators/api-list-query.decorator';

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
  @ApiListQuery()
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected'], description: 'Filter by status' })
  findAll(@Query() query: ReturnListQueryDto) {
    return this.returnsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a return by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.returnsService.findOne(id);
  }
}
