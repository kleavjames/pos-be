import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { CreateCategoryOptionGroupDto } from './dto/create-category-option.dto.js';

const categoryInclude = {
  optionGroups: {
    include: {
      options: {
        orderBy: { sortOrder: 'asc' as const },
      },
    },
  },
} satisfies Prisma.CategoryInclude;

function mapOptionGroups(optionGroups: CreateCategoryOptionGroupDto[]) {
  return optionGroups.map((group) => ({
    name: group.name,
    type: group.type,
    options: {
      create: group.options.map((option, optionIndex) => ({
        name: option.name,
        defaultPrice: option.defaultPrice ?? 0,
        sortOrder: option.sortOrder ?? optionIndex,
      })),
    },
  }));
}

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  create(businessId: string, createCategoryDto: CreateCategoryDto) {
    const { optionGroups, ...categoryData } = createCategoryDto;

    return this.prisma.category.create({
      data: {
        ...categoryData,
        businessId,
        optionGroups: optionGroups
          ? { create: mapOptionGroups(optionGroups) }
          : undefined,
      },
      include: categoryInclude,
    });
  }

  findAll(businessId?: string) {
    return this.prisma.category.findMany({
      where: businessId ? { businessId } : undefined,
      orderBy: [{ updatedAt: 'desc' }],
      include: categoryInclude,
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: categoryInclude,
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: categoryInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.category.delete({
      where: { id },
      include: categoryInclude,
    });
  }
}
