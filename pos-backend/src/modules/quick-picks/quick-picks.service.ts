import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuickPick } from './entities/quick-pick.entity';
import { CreateQuickPickDto, UpdateQuickPickDto } from './dto/quick-pick.dto';
import { QuickPickListQueryDto } from './dto/quick-pick-list-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate, resolveSort } from '../../common/helpers/pagination.helper';
import { Like, FindOptionsWhere } from 'typeorm';

@Injectable()
export class QuickPicksService {
  constructor(
    @InjectRepository(QuickPick)
    private readonly quickPickRepository: Repository<QuickPick>,
  ) {}

  async create(dto: CreateQuickPickDto): Promise<QuickPick> {
    // Auto-assign sort order if not provided
    if (dto.sortOrder === undefined) {
      const max = await this.quickPickRepository
        .createQueryBuilder('q')
        .select('COALESCE(MAX(q.sortOrder), -1)', 'max')
        .getRawOne();
      dto.sortOrder = Number(max?.max ?? -1) + 1;
    }
    const item = this.quickPickRepository.create(dto);
    return this.quickPickRepository.save(item);
  }

  async findAll(query: QuickPickListQueryDto = {}): Promise<PaginatedResult<QuickPick>> {
    const baseWhere: FindOptionsWhere<QuickPick> =
      query.includeInactive === 'true' ? {} : { isActive: true };

    const search = query.search?.trim();
    let where: FindOptionsWhere<QuickPick> | FindOptionsWhere<QuickPick>[] = baseWhere;
    if (search) {
      const like = Like(`%${search}%`);
      where = [
        { ...baseWhere, label: like },
        { ...baseWhere, labelKh: like },
      ];
    }

    const { sortBy, sortDirection } = resolveSort(
      query,
      ['label', 'labelKh', 'price', 'sortOrder', 'createdAt'],
      'sortOrder',
      'ASC',
    );

    return paginate(this.quickPickRepository, query, {
      where,
      order: { [sortBy]: sortDirection },
    });
  }

  async findOne(id: number): Promise<QuickPick> {
    const item = await this.quickPickRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`QuickPick #${id} not found`);
    }
    return item;
  }

  async update(id: number, dto: UpdateQuickPickDto): Promise<QuickPick> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.quickPickRepository.save(item);
  }

  async remove(id: number): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.quickPickRepository.remove(item);
    return { message: `QuickPick #${id} deleted successfully` };
  }
}
