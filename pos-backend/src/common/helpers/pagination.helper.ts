import { Repository, FindManyOptions, SelectQueryBuilder } from 'typeorm';
import { ListQueryDto } from '../dto/list-query.dto';
import { PaginationDto, PaginatedResult } from '../dto/pagination.dto';

/**
 * Normalizes a list query into database skip/take values plus the derived
 * page/limit view (used by the response interceptor's paginated envelope).
 *
 * Standard params: offset (zero-based) + max (default 20, max 100).
 * Legacy params: page + limit are still honoured when offset/max are absent.
 */
export function resolvePagination(
  query?: ListQueryDto | PaginationDto,
): { skip: number; take: number; page: number; limit: number } {
  const q = (query ?? {}) as ListQueryDto & PaginationDto;
  const hasLegacy = q.page !== undefined || q.limit !== undefined;
  const hasOffsetMax = q.offset !== undefined || q.max !== undefined;

  if (hasLegacy && !hasOffsetMax) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 10;
    return { skip: (page - 1) * limit, take: limit, page, limit };
  }

  const offset = q.offset ?? 0;
  const max = q.max ?? 20;
  return { skip: offset, take: max, page: Math.floor(offset / max) + 1, limit: max };
}

/**
 * Resolves the sort field + direction safely.
 *
 * - sortBy must be in the resource allowlist; otherwise the resource default
 *   field+direction is used (never trust user input as a raw DB column).
 * - When a valid sortBy is given, sort defaults to 'desc'.
 */
export function resolveSort(
  query: ListQueryDto | undefined,
  allowedSortFields: string[],
  defaultSortBy: string,
  defaultSortDirection: 'ASC' | 'DESC' = 'DESC',
): { sortBy: string; sortDirection: 'ASC' | 'DESC' } {
  const requested = query?.sortBy;
  const valid = requested && allowedSortFields.includes(requested);

  if (!valid) {
    return { sortBy: defaultSortBy, sortDirection: defaultSortDirection };
  }

  return {
    sortBy: requested as string,
    sortDirection: query?.sort === 'asc' ? 'ASC' : 'DESC',
  };
}

export async function paginate<T>(
  repository: Repository<T>,
  query?: ListQueryDto | PaginationDto,
  options?: Omit<FindManyOptions<T>, 'skip' | 'take'>,
): Promise<PaginatedResult<T>> {
  const { skip, take, page, limit } = resolvePagination(query);
  const [data, total] = await repository.findAndCount({
    ...options,
    skip,
    take,
  });
  return { data, total, page, limit };
}

export async function paginateQuery<T>(
  queryBuilder: SelectQueryBuilder<T>,
  query?: ListQueryDto | PaginationDto,
): Promise<PaginatedResult<T>> {
  const { skip, take, page, limit } = resolvePagination(query);
  const [data, total] = await queryBuilder.skip(skip).take(take).getManyAndCount();
  return { data, total, page, limit };
}
