import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateProductOptionDto } from '../dto/create-product-option.dto.js';
import { UpdateProductOptionDto } from './dto/update-product-option.dto.js';

@Injectable()
export class ProductOptionService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertProductExists(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, categoryId: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    return product;
  }

  private async assertCategoryOptionForProduct(
    categoryId: string,
    categoryOptionId: string,
  ) {
    const categoryOption = await this.prisma.categoryOption.findFirst({
      where: {
        id: categoryOptionId,
        group: { categoryId },
      },
    });

    if (!categoryOption) {
      throw new BadRequestException(
        `Category option ${categoryOptionId} is invalid for this product's category`,
      );
    }

    return categoryOption;
  }

  async create(productId: string, createProductOptionDto: CreateProductOptionDto) {
    const product = await this.assertProductExists(productId);
    await this.assertCategoryOptionForProduct(
      product.categoryId,
      createProductOptionDto.categoryOptionId,
    );

    const { isEnabled, ...optionData } = createProductOptionDto;

    return this.prisma.productOption.create({
      data: {
        ...optionData,
        productId,
        isEnabled: isEnabled ?? true,
      },
      include: { categoryOption: true },
    });
  }

  async findAll(productId: string) {
    await this.assertProductExists(productId);

    return this.prisma.productOption.findMany({
      where: { productId },
      include: { categoryOption: true },
    });
  }

  async findOne(productId: string, id: string) {
    await this.assertProductExists(productId);

    const productOption = await this.prisma.productOption.findFirst({
      where: { id, productId },
      include: { categoryOption: true },
    });

    if (!productOption) {
      throw new NotFoundException(
        `Product option with id ${id} not found for product ${productId}`,
      );
    }

    return productOption;
  }

  async update(
    productId: string,
    id: string,
    updateProductOptionDto: UpdateProductOptionDto,
  ) {
    const product = await this.assertProductExists(productId);
    await this.findOne(productId, id);

    if (updateProductOptionDto.categoryOptionId) {
      await this.assertCategoryOptionForProduct(
        product.categoryId,
        updateProductOptionDto.categoryOptionId,
      );
    }

    return this.prisma.productOption.update({
      where: { id },
      data: updateProductOptionDto,
      include: { categoryOption: true },
    });
  }

  async remove(productId: string, id: string) {
    await this.findOne(productId, id);

    return this.prisma.productOption.delete({
      where: { id },
      include: { categoryOption: true },
    });
  }
}
