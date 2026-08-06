import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

/**
 * Documents the standard list query parameters (search, sortBy, sort, offset, max)
 * for GET list endpoints. Resource-specific filters should be documented with
 * additional @ApiQuery decorators next to this one.
 */
export function ApiListQuery(): MethodDecorator {
  return applyDecorators(
    ApiQuery({ name: 'search', required: false, type: String, description: 'Search keyword' }),
    ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by (allowlist enforced server-side)' }),
    ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'], description: 'Sort direction (default: desc)' }),
    ApiQuery({ name: 'offset', required: false, type: Number, description: 'Zero-based offset (default: 0)' }),
    ApiQuery({ name: 'max', required: false, type: Number, description: 'Max records (default: 20, maximum: 100)' }),
  );
}
