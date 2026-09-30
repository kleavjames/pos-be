import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { mapCategoryOptionsForCreate } from '../shared/map-category-options.js';
import { CreateCategoryOptionGroupDto } from './dto/create-category-option-group.dto.js';
import { UpdateCategoryOptionGroupDto } from './dto/update-category-option-group.dto.js';

const optionGroupInclude = {
  options: {
    orderBy: { sortOrder: 'asc' as const },
  },
} satisfies Prisma.CategoryOptionGroupInclude;

@Injectable()
export class CategoryOptionGroupService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${categoryId} not found`);
    }

    return category;
  }

  async create(
    categoryId: string,
    createCategoryOptionGroupDto: CreateCategoryOptionGroupDto,
  ) {
    await this.assertCategoryExists(categoryId);

    const { options, ...groupData } = createCategoryOptionGroupDto;

    return this.prisma.categoryOptionGroup.create({
      data: {
        ...groupData,
        categoryId,
        options: mapCategoryOptionsForCreate(options),
      },
      include: optionGroupInclude,
    });
  }

  async findAll(categoryId: string) {
    await this.assertCategoryExists(categoryId);

    return this.prisma.categoryOptionGroup.findMany({
      where: { categoryId },
      orderBy: [{ sortOrder: 'asc' }],
      include: optionGroupInclude,
    });
  }

  async findOne(categoryId: string, id: string) {
    const optionGroup = await this.prisma.categoryOptionGroup.findFirst({
      where: { id, categoryId },
      include: optionGroupInclude,
    });

    if (!optionGroup) {
      throw new NotFoundException(
        `Option group with id ${id} not found for category ${categoryId}`,
      );
    }

    return optionGroup;
  }

  async update(
    categoryId: string,
    id: string,
    updateCategoryOptionGroupDto: UpdateCategoryOptionGroupDto,
  ) {
    await this.findOne(categoryId, id);

    const { options: _options, ...groupData } = updateCategoryOptionGroupDto;

    return this.prisma.categoryOptionGroup.update({
      where: { id },
      data: groupData,
      include: optionGroupInclude,
    });
  }

  async remove(categoryId: string, id: string) {
    await this.findOne(categoryId, id);

    return this.prisma.categoryOptionGroup.delete({
      where: { id },
      include: optionGroupInclude,
    });
  }
}
