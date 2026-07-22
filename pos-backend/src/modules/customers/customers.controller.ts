import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, ParseIntPipe, Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  AddPointsDto,
  RedeemPointsDto,
} from './dto/customer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active customers' })
  findAll() {
    return this.customersService.findAll();
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: 'Find a customer by phone number' })
  findByPhone(@Param('phone') phone: string) {
    return this.customersService.findByPhone(phone);
  }

  @Post('phone/:phone/find-or-create')
  @ApiOperation({ summary: 'Find by phone or auto-create a new customer' })
  findOrCreate(
    @Param('phone') phone: string,
    @Body('name') name?: string,
  ) {
    return this.customersService.findOrCreateByPhone(phone, name);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a customer' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.remove(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post(':id/points/add')
  @ApiOperation({ summary: 'Add loyalty points to a customer' })
  addPoints(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddPointsDto,
  ) {
    return this.customersService.addPoints(id, dto);
  }

  @Post(':id/points/redeem')
  @ApiOperation({ summary: 'Redeem loyalty points for discount' })
  redeemPoints(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RedeemPointsDto,
  ) {
    return this.customersService.redeemPoints(id, dto);
  }
}
