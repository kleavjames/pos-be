import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller.js';
import { CategoryService } from './category.service.js';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategory = {
    id: 'cat-1',
    name: 'T-shirts',
    businessId: 'biz-1',
    pricingMode: 'VARIANT' as const,
    isActive: true,
    optionGroups: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoryService = {
    create: vi.fn().mockResolvedValue(mockCategory),
    findAll: vi.fn().mockResolvedValue([mockCategory]),
    findOne: vi.fn().mockResolvedValue(mockCategory),
    update: vi.fn().mockResolvedValue(mockCategory),
    remove: vi.fn().mockResolvedValue(mockCategory),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('calls categoryService.create with businessId and dto', async () => {
      const dto = { name: 'T-shirts', isActive: true };

      const result = await controller.create('biz-1', dto);

      expect(service.create).toHaveBeenCalledWith('biz-1', dto);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('calls categoryService.findAll without businessId', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockCategory]);
    });

    it('calls categoryService.findAll with businessId', async () => {
      const result = await controller.findAll('biz-1');

      expect(service.findAll).toHaveBeenCalledWith('biz-1');
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findOne', () => {
    it('calls categoryService.findOne with id', async () => {
      const result = await controller.findOne('cat-1');

      expect(service.findOne).toHaveBeenCalledWith('cat-1');
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('calls categoryService.update with id and dto', async () => {
      const dto = { name: 'Updated name' };

      const result = await controller.update('cat-1', dto);

      expect(service.update).toHaveBeenCalledWith('cat-1', dto);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('remove', () => {
    it('calls categoryService.remove with id', async () => {
      const result = await controller.remove('cat-1');

      expect(service.remove).toHaveBeenCalledWith('cat-1');
      expect(result).toEqual(mockCategory);
    });
  });
});
