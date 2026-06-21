import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Find user by email (with password field)
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check account active
    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Build JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // 5. Sign and return token
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async getProfile(userId: number) {
    return this.usersService.findOne(userId);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // We return success even if user not found to prevent email enumeration
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    // Generate token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 1 hour
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1);

    await this.usersService.saveResetToken(user.id, hashedToken, tokenExpiry);

    // Mock sending email
    const resetLink = `http://localhost:4200/reset-password?token=${resetToken}`;
    console.log(`\n\n[MOCK EMAIL] Password Reset Link for ${email}: \n${resetLink}\n\n`);

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.usersService.findByResetToken(hashedToken);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }

    if (new Date() > user.resetTokenExpiry) {
      throw new UnauthorizedException('Password reset token has expired');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.clearResetTokenAndSetPassword(user.id, hashedNewPassword);

    return { message: 'Password has been successfully reset' };
  }
}
