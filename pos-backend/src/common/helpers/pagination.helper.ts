import { Repository, FindManyOptions, SelectQueryBuilder } from 'typeorm';
import { PaginationDto, PaginatedResult } from '../dto/pagination.dto';

export async function paginate<T>(
  repository: Repository<T>,
  pagination: PaginationDto,
  options?: Omit<FindManyOptions<T>, 'skip' | 'take'>,
): Promise<PaginatedResult<T>> {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 10;
  const skip = (page - 1) * limit;

  const [data, total] = await repository.findAndCount({
    ...options,
    skip,
    take: limit,
  });

  return { data, total, page, limit };
}

export async function paginateQuery<T>(
  queryBuilder: SelectQueryBuilder<T>,
  pagination: PaginationDto,
): Promise<PaginatedResult<T>> {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 10;
  const skip = (page - 1) * limit;

  const [data, total] = await queryBuilder
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { data, total, page, limit };
}
