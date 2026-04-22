import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('app.jwt.secret') ||
        process.env.JWT_SECRET ||
        'fallback-secret',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    // This object is attached to request.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
