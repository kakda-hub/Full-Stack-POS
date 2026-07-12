import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./entities/category.entity";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";
import { PaginationDto, PaginatedResult } from "../../common/dto/pagination.dto";
import { paginate } from "../../common/helpers/pagination.helper";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Category "${dto.name}" already exists`);
    }
    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  findAll(pagination?: PaginationDto): Promise<PaginatedResult<Category>> {
    return paginate(this.categoryRepository, pagination ?? {}, {
      order: { name: "ASC" },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    return { message: `Category #${id} deleted successfully` };
  }
}
