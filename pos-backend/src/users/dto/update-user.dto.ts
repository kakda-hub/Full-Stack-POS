import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
