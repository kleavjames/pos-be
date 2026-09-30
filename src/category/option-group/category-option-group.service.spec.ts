import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CategoryOptionGroupService } from './category-option-group.service.js';

const optionGroupInclude = {
  options: {
    orderBy: { sortOrder: 'asc' as const },
  },
};

describe('CategoryOptionGroupService', () => {
  let service: CategoryOptionGroupService;

  const mockCategory = {
    id: 'cat-1',
    businessId: 'biz-1',
    name: 'Coffee',
    pricingMode: 'VARIANT' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOptionGroup = {
    id: 'group-1',
    categoryId: 'cat-1',
    name: 'Size',
    type: 'SERVING_VARIANT' as const,
    sortOrder: 0,
    options: [],
  };

  const mockPrisma = {
    category: {
      findUnique: vi.fn().mockResolvedValue(mockCategory),
    },
    categoryOptionGroup: {
      create: vi.fn().mockResolvedValue(mockOptionGroup),
      findMany: vi.fn().mockResolvedValue([mockOptionGroup]),
      findFirst: vi.fn().mockResolvedValue(mockOptionGroup),
      update: vi.fn().mockResolvedValue(mockOptionGroup),
      delete: vi.fn().mockResolvedValue(mockOptionGroup),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryOptionGroupService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CategoryOptionGroupService>(CategoryOptionGroupService);

    vi.clearAllMocks();
    mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
    mockPrisma.categoryOptionGroup.findFirst.mockResolvedValue(mockOptionGroup);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates an option group for a category', async () => {
      const dto = {
        name: 'Size',
        type: 'SERVING_VARIANT' as const,
        options: [{ name: 'Small' }],
      };

      const result = await service.create('cat-1', dto);

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
      expect(mockPrisma.categoryOptionGroup.create).toHaveBeenCalledWith({
        data: {
          name: 'Size',
          type: 'SERVING_VARIANT',
          categoryId: 'cat-1',
          options: {
            create: [
              { name: 'Small', defaultPrice: 0, sortOrder: 0, isActive: true },
            ],
          },
        },
        include: optionGroupInclude,
      });
      expect(result).toEqual(mockOptionGroup);
    });

    it('throws NotFoundException when category does not exist', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(
        service.create('missing', {
          name: 'Size',
          type: 'SERVING_VARIANT',
        }),
      ).rejects.toThrow(
        new NotFoundException('Category with id missing not found'),
      );
    });
  });

  describe('findAll', () => {
    it('returns option groups scoped to the category', async () => {
      const result = await service.findAll('cat-1');

      expect(mockPrisma.categoryOptionGroup.findMany).toHaveBeenCalledWith({
        where: { categoryId: 'cat-1' },
        orderBy: [{ sortOrder: 'asc' }],
        include: optionGroupInclude,
      });
      expect(result).toEqual([mockOptionGroup]);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when option group does not exist', async () => {
      mockPrisma.categoryOptionGroup.findFirst.mockResolvedValue(null);

      await expect(service.findOne('cat-1', 'missing')).rejects.toThrow(
        new NotFoundException(
          'Option group with id missing not found for category cat-1',
        ),
      );
    });
  });
});
