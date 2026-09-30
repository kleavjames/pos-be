import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

describe('ProductsController', () => {
  let controller: ProductsController;
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

  const mockProductsService = {
    create: vi.fn().mockResolvedValue(mockProduct),
    findAll: vi.fn().mockResolvedValue([mockProduct]),
    findOne: vi.fn().mockResolvedValue(mockProduct),
    update: vi.fn().mockResolvedValue(mockProduct),
    remove: vi.fn().mockResolvedValue(mockProduct),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('calls productsService.create with businessId and dto', async () => {
      const dto = { categoryId: 'cat-1', name: 'Latte', basePrice: 4.5 };

      const result = await controller.create('biz-1', dto);

      expect(service.create).toHaveBeenCalledWith('biz-1', dto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('calls productsService.findAll with query filters', async () => {
      const result = await controller.findAll('biz-1', 'cat-1', 'lat');

      expect(service.findAll).toHaveBeenCalledWith('biz-1', 'cat-1', 'lat');
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('calls productsService.findOne with id', async () => {
      const result = await controller.findOne('prod-1');

      expect(service.findOne).toHaveBeenCalledWith('prod-1');
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('calls productsService.update with id and dto', async () => {
      const dto = { name: 'Updated latte' };

      const result = await controller.update('prod-1', dto);

      expect(service.update).toHaveBeenCalledWith('prod-1', dto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('remove', () => {
    it('calls productsService.remove with id', async () => {
      const result = await controller.remove('prod-1');

      expect(service.remove).toHaveBeenCalledWith('prod-1');
      expect(result).toEqual(mockProduct);
    });
  });
});
