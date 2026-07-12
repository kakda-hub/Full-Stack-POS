import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SkipIntercept } from '../../common/decorators/skip-intercept.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/v1/auth/login
  @SkipIntercept()
  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // GET /api/v1/auth/profile  (protected)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('id') userId: number) {
    return this.authService.getProfile(userId);
  }

  // POST /api/v1/auth/forgot-password
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset link' })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  // POST /api/v1/auth/reset-password
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }
}
