import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { productInclude, ProductsService } from './products.service.js';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProduct = {
    id: 'prod-1',
    businessId: 'biz-1',
    categoryId: 'cat-1',
    name: 'Latte',
    basePrice: 4.5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: { id: 'cat-1', name: 'Coffee' },
    productOptions: [],
  };

  const mockPrisma = {
    category: {
      findFirst: vi.fn().mockResolvedValue({ id: 'cat-1', businessId: 'biz-1' }),
    },
    categoryOption: {
      count: vi.fn().mockResolvedValue(1),
    },
    product: {
      create: vi.fn().mockResolvedValue(mockProduct),
      findMany: vi.fn().mockResolvedValue([mockProduct]),
      findUnique: vi.fn().mockResolvedValue(mockProduct),
      update: vi.fn().mockResolvedValue(mockProduct),
      delete: vi.fn().mockResolvedValue(mockProduct),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);

    vi.clearAllMocks();
    mockPrisma.category.findFirst.mockResolvedValue({
      id: 'cat-1',
      businessId: 'biz-1',
    });
    mockPrisma.categoryOption.count.mockResolvedValue(1);
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a product without options', async () => {
      const dto = {
        categoryId: 'cat-1',
        name: 'Latte',
        basePrice: 4.5,
        isActive: true,
      };

      const result = await service.create('biz-1', dto);

      expect(mockPrisma.category.findFirst).toHaveBeenCalledWith({
        where: { id: 'cat-1', businessId: 'biz-1' },
      });
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Latte',
          categoryId: 'cat-1',
          businessId: 'biz-1',
          basePrice: 4.5,
          isActive: true,
          productOptions: undefined,
        },
        include: productInclude,
      });
      expect(result).toEqual(mockProduct);
    });

    it('creates a product with nested product options', async () => {
      const dto = {
        categoryId: 'cat-1',
        name: 'Latte',
        productOptions: [
          { categoryOptionId: 'co-1', price: 0 },
          { categoryOptionId: 'co-2', price: 1.5, isEnabled: false },
        ],
      };

      mockPrisma.categoryOption.count.mockResolvedValue(2);

      await service.create('biz-1', dto);

      expect(mockPrisma.categoryOption.count).toHaveBeenCalledWith({
        where: {
          id: { in: ['co-1', 'co-2'] },
          group: { categoryId: 'cat-1' },
        },
      });
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Latte',
          categoryId: 'cat-1',
          businessId: 'biz-1',
          basePrice: undefined,
          isActive: true,
          productOptions: {
            create: [
              { categoryOptionId: 'co-1', price: 0, isEnabled: true },
              {
                categoryOptionId: 'co-2',
                price: 1.5,
                isEnabled: false,
              },
            ],
          },
        },
        include: productInclude,
      });
    });

    it('throws when category does not belong to the business', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.create('biz-1', { categoryId: 'cat-1', name: 'Latte' }),
      ).rejects.toThrow(
        new NotFoundException(
          'Category with id cat-1 not found for business biz-1',
        ),
      );
    });

    it('throws when product options are invalid for the category', async () => {
      mockPrisma.categoryOption.count.mockResolvedValue(0);

      await expect(
        service.create('biz-1', {
          categoryId: 'cat-1',
          name: 'Latte',
          productOptions: [{ categoryOptionId: 'co-1', price: 0 }],
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'One or more category options are invalid for this category',
        ),
      );
    });
  });

  describe('findAll', () => {
    it('returns products filtered by business and category', async () => {
      const result = await service.findAll('biz-1', 'cat-1', 'lat');

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          businessId: 'biz-1',
          categoryId: 'cat-1',
          name: { contains: 'lat', mode: 'insensitive' },
        },
        orderBy: [{ updatedAt: 'desc' }],
        include: productInclude,
      });
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        new NotFoundException('Product with id missing not found'),
      );
    });
  });

  describe('update', () => {
    it('validates category when categoryId changes', async () => {
      await service.update('prod-1', { categoryId: 'cat-2' });

      expect(mockPrisma.category.findFirst).toHaveBeenCalledWith({
        where: { id: 'cat-2', businessId: 'biz-1' },
      });
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { categoryId: 'cat-2' },
        include: productInclude,
      });
    });
  });

  describe('remove', () => {
    it('deletes the product when found', async () => {
      const result = await service.remove('prod-1');

      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        include: productInclude,
      });
      expect(result).toEqual(mockProduct);
    });
  });
});
