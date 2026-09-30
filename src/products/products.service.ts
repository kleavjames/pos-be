import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateProductOptionDto } from './dto/create-product-option.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { mapProductOptionsForCreate } from './shared/map-product-options.js';

export const productInclude = {
  category: true,
  productOptions: {
    include: {
      categoryOption: true,
    },
  },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertCategoryForBusiness(
    businessId: string,
    categoryId: string,
  ) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, businessId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with id ${categoryId} not found for business ${businessId}`,
      );
    }

    return category;
  }

  private async assertCategoryOptionsForCategory(
    categoryId: string,
    productOptions?: CreateProductOptionDto[],
  ) {
    if (!productOptions?.length) {
      return;
    }

    const categoryOptionIds = [
      ...new Set(productOptions.map((option) => option.categoryOptionId)),
    ];

    const validCount = await this.prisma.categoryOption.count({
      where: {
        id: { in: categoryOptionIds },
        group: { categoryId },
      },
    });

    if (validCount !== categoryOptionIds.length) {
      throw new BadRequestException(
        'One or more category options are invalid for this category',
      );
    }
  }

  async create(businessId: string, createProductDto: CreateProductDto) {
    const { productOptions, categoryId, basePrice, isActive, ...productData } =
      createProductDto;

    await this.assertCategoryForBusiness(businessId, categoryId);
    await this.assertCategoryOptionsForCategory(categoryId, productOptions);

    return this.prisma.product.create({
      data: {
        ...productData,
        categoryId,
        businessId,
        basePrice,
        isActive: isActive ?? true,
        productOptions: mapProductOptionsForCreate(productOptions),
      },
      include: productInclude,
    });
  }

  findAll(businessId?: string, categoryId?: string, name?: string) {
    return this.prisma.product.findMany({
      where: {
        businessId,
        categoryId,
        name: name ? { contains: name, mode: 'insensitive' } : undefined,
      },
      orderBy: [{ updatedAt: 'desc' }],
      include: productInclude,
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (updateProductDto.categoryId) {
      await this.assertCategoryForBusiness(
        product.businessId,
        updateProductDto.categoryId,
      );
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: productInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.product.delete({
      where: { id },
      include: productInclude,
    });
  }
}
