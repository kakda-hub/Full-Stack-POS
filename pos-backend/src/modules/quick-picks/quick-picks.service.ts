import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuickPick } from './entities/quick-pick.entity';
import { CreateQuickPickDto, UpdateQuickPickDto } from './dto/quick-pick.dto';

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

  async findAll(includeInactive = false): Promise<QuickPick[]> {
    const where = includeInactive ? {} : { isActive: true };
    return this.quickPickRepository.find({
      where,
      order: { sortOrder: 'ASC' },
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
