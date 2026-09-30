import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ProductOptionService } from './product-option.service.js';

describe('ProductOptionService', () => {
  let service: ProductOptionService;

  const mockProduct = {
    id: 'prod-1',
    categoryId: 'cat-1',
  };

  const mockProductOption = {
    id: 'po-1',
    productId: 'prod-1',
    categoryOptionId: 'co-1',
    price: 1.5,
    isEnabled: true,
    categoryOption: { id: 'co-1', name: 'Large' },
  };

  const mockPrisma = {
    product: {
      findUnique: vi.fn().mockResolvedValue(mockProduct),
    },
    categoryOption: {
      findFirst: vi.fn().mockResolvedValue({ id: 'co-1' }),
    },
    productOption: {
      create: vi.fn().mockResolvedValue(mockProductOption),
      findMany: vi.fn().mockResolvedValue([mockProductOption]),
      findFirst: vi.fn().mockResolvedValue(mockProductOption),
      update: vi.fn().mockResolvedValue(mockProductOption),
      delete: vi.fn().mockResolvedValue(mockProductOption),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductOptionService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ProductOptionService>(ProductOptionService);

    vi.clearAllMocks();
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
    mockPrisma.categoryOption.findFirst.mockResolvedValue({ id: 'co-1' });
    mockPrisma.productOption.findFirst.mockResolvedValue(mockProductOption);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a product option scoped to the product category', async () => {
      const dto = { categoryOptionId: 'co-1', price: 1.5 };

      const result = await service.create('prod-1', dto);

      expect(mockPrisma.categoryOption.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'co-1',
          group: { categoryId: 'cat-1' },
        },
      });
      expect(mockPrisma.productOption.create).toHaveBeenCalledWith({
        data: {
          categoryOptionId: 'co-1',
          price: 1.5,
          productId: 'prod-1',
          isEnabled: true,
        },
        include: { categoryOption: true },
      });
      expect(result).toEqual(mockProductOption);
    });

    it('throws when the product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.create('missing', { categoryOptionId: 'co-1', price: 0 }),
      ).rejects.toThrow(
        new NotFoundException('Product with id missing not found'),
      );
    });

    it('throws when the category option is invalid', async () => {
      mockPrisma.categoryOption.findFirst.mockResolvedValue(null);

      await expect(
        service.create('prod-1', { categoryOptionId: 'co-1', price: 0 }),
      ).rejects.toThrow(
        new BadRequestException(
          "Category option co-1 is invalid for this product's category",
        ),
      );
    });
  });
});
