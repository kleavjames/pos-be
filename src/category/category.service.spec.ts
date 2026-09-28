import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { CategoryService } from './category.service.js';

const categoryInclude = {
  optionGroups: {
    include: {
      options: {
        orderBy: { sortOrder: 'asc' as const },
      },
    },
  },
};

describe('CategoryService', () => {
  let service: CategoryService;

  const mockCategory = {
    id: 'cat-1',
    businessId: 'biz-1',
    name: 'T-shirts',
    pricingMode: 'VARIANT' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    optionGroups: [],
  };

  const mockPrisma = {
    category: {
      create: vi.fn().mockResolvedValue(mockCategory),
      findMany: vi.fn().mockResolvedValue([mockCategory]),
      findUnique: vi.fn().mockResolvedValue(mockCategory),
      update: vi.fn().mockResolvedValue(mockCategory),
      delete: vi.fn().mockResolvedValue(mockCategory),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);

    vi.clearAllMocks();
    mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a category without option groups', async () => {
      const dto = { name: 'T-shirts', isActive: true };

      const result = await service.create('biz-1', dto);

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'T-shirts',
          isActive: true,
          businessId: 'biz-1',
          optionGroups: undefined,
        },
        include: categoryInclude,
      });
      expect(result).toEqual(mockCategory);
    });

    it('creates a category with nested option groups', async () => {
      const dto = {
        name: 'Coffee',
        optionGroups: [
          {
            name: 'Size',
            type: 'SERVING_VARIANT' as const,
            options: [{ name: 'Small' }, { name: 'Large', defaultPrice: 2 }],
          },
        ],
      };

      await service.create('biz-1', dto);

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Coffee',
          businessId: 'biz-1',
          optionGroups: {
            create: [
              {
                name: 'Size',
                type: 'SERVING_VARIANT',
                options: {
                  create: [
                    { name: 'Small', defaultPrice: 0, sortOrder: 0 },
                    { name: 'Large', defaultPrice: 2, sortOrder: 1 },
                  ],
                },
              },
            ],
          },
        },
        include: categoryInclude,
      });
    });
  });

  describe('findAll', () => {
    it('returns all categories when businessId is omitted', async () => {
      const result = await service.findAll();

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: [{ updatedAt: 'desc' }],
        include: categoryInclude,
      });
      expect(result).toEqual([mockCategory]);
    });

    it('filters by businessId when provided', async () => {
      await service.findAll('biz-1');

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { businessId: 'biz-1' },
        orderBy: [{ updatedAt: 'desc' }],
        include: categoryInclude,
      });
    });
  });

  describe('findOne', () => {
    it('returns the category when found', async () => {
      const result = await service.findOne('cat-1');

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        include: categoryInclude,
      });
      expect(result).toEqual(mockCategory);
    });

    it('throws NotFoundException when category does not exist', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        new NotFoundException('Category with id missing not found'),
      );
    });
  });

  describe('update', () => {
    it('updates top-level category fields', async () => {
      const dto = { name: 'Updated name', isActive: false };

      const result = await service.update('cat-1', dto);

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        include: categoryInclude,
      });
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: dto,
        include: categoryInclude,
      });
      expect(result).toEqual(mockCategory);
    });

    it('throws NotFoundException when category does not exist', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing', { name: 'Updated name' }),
      ).rejects.toThrow(
        new NotFoundException('Category with id missing not found'),
      );
      expect(mockPrisma.category.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes the category when found', async () => {
      const result = await service.remove('cat-1');

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        include: categoryInclude,
      });
      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        include: categoryInclude,
      });
      expect(result).toEqual(mockCategory);
    });

    it('throws NotFoundException when category does not exist', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        new NotFoundException('Category with id missing not found'),
      );
      expect(mockPrisma.category.delete).not.toHaveBeenCalled();
    });
  });
});
