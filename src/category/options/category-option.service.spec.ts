import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CategoryOptionService } from './category-option.service.js';

describe('CategoryOptionService', () => {
  let service: CategoryOptionService;

  const mockOptionGroup = {
    id: 'group-1',
    categoryId: 'cat-1',
    name: 'Size',
    type: 'SERVING_VARIANT' as const,
    sortOrder: 0,
  };

  const mockOption = {
    id: 'option-1',
    groupId: 'group-1',
    name: 'Small',
    defaultPrice: 0,
    sortOrder: 0,
    isActive: true,
  };

  const mockPrisma = {
    categoryOptionGroup: {
      findFirst: vi.fn().mockResolvedValue(mockOptionGroup),
    },
    categoryOption: {
      create: vi.fn().mockResolvedValue(mockOption),
      findMany: vi.fn().mockResolvedValue([mockOption]),
      findFirst: vi.fn().mockResolvedValue(mockOption),
      update: vi.fn().mockResolvedValue(mockOption),
      delete: vi.fn().mockResolvedValue(mockOption),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryOptionService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CategoryOptionService>(CategoryOptionService);

    vi.clearAllMocks();
    mockPrisma.categoryOptionGroup.findFirst.mockResolvedValue(mockOptionGroup);
    mockPrisma.categoryOption.findFirst.mockResolvedValue(mockOption);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates an option scoped to the option group', async () => {
      const dto = { name: 'Small', defaultPrice: 0 };

      const result = await service.create('cat-1', 'group-1', dto);

      expect(mockPrisma.categoryOptionGroup.findFirst).toHaveBeenCalledWith({
        where: { id: 'group-1', categoryId: 'cat-1' },
      });
      expect(mockPrisma.categoryOption.create).toHaveBeenCalledWith({
        data: {
          name: 'Small',
          groupId: 'group-1',
          defaultPrice: 0,
          sortOrder: 0,
          isActive: true,
        },
      });
      expect(result).toEqual(mockOption);
    });

    it('throws NotFoundException when option group does not exist', async () => {
      mockPrisma.categoryOptionGroup.findFirst.mockResolvedValue(null);

      await expect(
        service.create('cat-1', 'missing', { name: 'Small' }),
      ).rejects.toThrow(
        new NotFoundException(
          'Option group with id missing not found for category cat-1',
        ),
      );
    });
  });

  describe('findAll', () => {
    it('returns options scoped to the option group', async () => {
      const result = await service.findAll('cat-1', 'group-1');

      expect(mockPrisma.categoryOption.findMany).toHaveBeenCalledWith({
        where: { groupId: 'group-1' },
        orderBy: [{ sortOrder: 'asc' }],
      });
      expect(result).toEqual([mockOption]);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when option does not exist', async () => {
      mockPrisma.categoryOption.findFirst.mockResolvedValue(null);

      await expect(service.findOne('cat-1', 'group-1', 'missing')).rejects.toThrow(
        new NotFoundException(
          'Option with id missing not found for option group group-1',
        ),
      );
    });
  });
});
