import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_INTERCEPT_KEY } from '../decorators/skip-intercept.decorator';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  total?: number;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, any>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    // Skip wrapping if route has @SkipIntercept() decorator
    const skipIntercept = this.reflector.get<boolean>(
      SKIP_INTERCEPT_KEY,
      context.getHandler(),
    );
    if (skipIntercept) {
      return next.handle();
    }
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data: any) => {
        // Check if data is a paginated result ({ data, total, page, limit } as
        // produced by the pagination helper). `page`/`limit` are kept in the
        // payload only for detection — they are NOT emitted to the client.
        const isPaginated =
          data &&
          typeof data === 'object' &&
          !Array.isArray(data) &&
          'data' in data &&
          'total' in data &&
          'page' in data &&
          'limit' in data;

        if (isPaginated) {
          return {
            success: true,
            statusCode,
            data: data.data,
            total: data.total,
            timestamp: new Date().toISOString(),
          };
        }

        // Plain array: add total count
        if (Array.isArray(data)) {
          return {
            success: true,
            statusCode,
            data,
            total: data.length,
            timestamp: new Date().toISOString(),
          };
        }

        // Single object: no total
        return {
          success: true,
          statusCode,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
