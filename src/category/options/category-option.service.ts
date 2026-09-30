import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCategoryOptionDto } from './dto/create-category-option.dto.js';
import { UpdateCategoryOptionDto } from './dto/update-category-option.dto.js';

@Injectable()
export class CategoryOptionService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOptionGroupExists(
    categoryId: string,
    optionGroupId: string,
  ) {
    const optionGroup = await this.prisma.categoryOptionGroup.findFirst({
      where: { id: optionGroupId, categoryId },
    });

    if (!optionGroup) {
      throw new NotFoundException(
        `Option group with id ${optionGroupId} not found for category ${categoryId}`,
      );
    }

    return optionGroup;
  }

  async create(
    categoryId: string,
    optionGroupId: string,
    createCategoryOptionDto: CreateCategoryOptionDto,
  ) {
    await this.assertOptionGroupExists(categoryId, optionGroupId);

    const { defaultPrice, sortOrder, isActive, ...optionData } =
      createCategoryOptionDto;

    return this.prisma.categoryOption.create({
      data: {
        ...optionData,
        groupId: optionGroupId,
        defaultPrice: defaultPrice ?? 0,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });
  }

  async findAll(categoryId: string, optionGroupId: string) {
    await this.assertOptionGroupExists(categoryId, optionGroupId);

    return this.prisma.categoryOption.findMany({
      where: { groupId: optionGroupId },
      orderBy: [{ sortOrder: 'asc' }],
    });
  }

  async findOne(categoryId: string, optionGroupId: string, id: string) {
    await this.assertOptionGroupExists(categoryId, optionGroupId);

    const option = await this.prisma.categoryOption.findFirst({
      where: { id, groupId: optionGroupId },
    });

    if (!option) {
      throw new NotFoundException(
        `Option with id ${id} not found for option group ${optionGroupId}`,
      );
    }

    return option;
  }

  async update(
    categoryId: string,
    optionGroupId: string,
    id: string,
    updateCategoryOptionDto: UpdateCategoryOptionDto,
  ) {
    await this.findOne(categoryId, optionGroupId, id);

    return this.prisma.categoryOption.update({
      where: { id },
      data: updateCategoryOptionDto,
    });
  }

  async remove(categoryId: string, optionGroupId: string, id: string) {
    await this.findOne(categoryId, optionGroupId, id);

    return this.prisma.categoryOption.delete({
      where: { id },
    });
  }
}
