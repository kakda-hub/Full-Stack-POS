import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ManagementPage } from './entities/management-page.entity';
import {
  CreateManagementPageDto,
  UpdateManagementPageDto,
} from './dto/management-page.dto';

@Injectable()
export class ManagementService {
  constructor(
    @InjectRepository(ManagementPage)
    private readonly pageRepository: Repository<ManagementPage>,
  ) {}

  // ─── Management Pages CRUD ────────────────────────────────────────────

  async create(dto: CreateManagementPageDto): Promise<ManagementPage> {
    // Scope max sort_order to the same level (top-level or specific parent)
    const query = this.pageRepository
      .createQueryBuilder('p')
      .select('COALESCE(MAX(p.sortOrder), -1)', 'max');

    if (dto.parentId) {
      query.where('p.parentId = :parentId', { parentId: dto.parentId });
    } else {
      query.where('p.parentId IS NULL');
    }

    const maxSortOrder = await query.getRawOne();

    const nextSortOrder = Number(maxSortOrder?.max ?? -1) + 1;

    const page = this.pageRepository.create({
      ...dto,
      sortOrder: nextSortOrder,
    });
    return this.pageRepository.save(page);
  }

  async findAll(): Promise<ManagementPage[]> {
    const pages = await this.pageRepository.find({
      where: { isActive: true, parentId: IsNull() },
      order: { sortOrder: 'ASC' },
      relations: ['children'],
    });

    // Sort children by sortOrder (TypeORM doesn't order relations in find())
    return pages.map((page) => ({
      ...page,
      children: (page.children || [])
        .filter((child) => child.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  }

  async findOne(id: number): Promise<ManagementPage> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException(`ManagementPage #${id} not found`);
    }
    return page;
  }

  async update(id: number, dto: UpdateManagementPageDto): Promise<ManagementPage> {
    const page = await this.findOne(id);
    Object.assign(page, dto);
    return this.pageRepository.save(page);
  }

  async remove(id: number): Promise<{ message: string }> {
    const page = await this.findOne(id);
    await this.pageRepository.remove(page);
    return { message: `ManagementPage #${id} deleted successfully` };
  }
}
