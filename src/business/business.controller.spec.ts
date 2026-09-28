import { Test, TestingModule } from '@nestjs/testing';
import { BusinessController } from './business.controller.js';
import { BusinessService } from './business.service.js';

describe('BusinessController', () => {
  let controller: BusinessController;
  let service: BusinessService;

  const mockBusiness = {
    id: 'biz-1',
    name: 'Acme Coffee',
    slug: 'acme-coffee',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBusinessService = {
    create: vi.fn().mockResolvedValue(mockBusiness),
    findAll: vi.fn().mockResolvedValue([mockBusiness]),
    findOne: vi.fn().mockResolvedValue(mockBusiness),
    update: vi.fn().mockResolvedValue(mockBusiness),
    remove: vi.fn().mockResolvedValue(mockBusiness),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessController],
      providers: [
        {
          provide: BusinessService,
          useValue: mockBusinessService,
        },
      ],
    }).compile();

    controller = module.get<BusinessController>(BusinessController);
    service = module.get<BusinessService>(BusinessService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('calls businessService.create with dto', async () => {
      const dto = { name: 'Acme Coffee', slug: 'acme-coffee' };

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('findAll', () => {
    it('calls businessService.findAll', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(result).toEqual([mockBusiness]);
    });
  });

  describe('findOne', () => {
    it('calls businessService.findOne with id', async () => {
      const result = await controller.findOne('biz-1');

      expect(service.findOne).toHaveBeenCalledWith('biz-1');
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('update', () => {
    it('calls businessService.update with id and dto', async () => {
      const dto = { name: 'Updated name' };

      const result = await controller.update('biz-1', dto);

      expect(service.update).toHaveBeenCalledWith('biz-1', dto);
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('remove', () => {
    it('calls businessService.remove with id', async () => {
      const result = await controller.remove('biz-1');

      expect(service.remove).toHaveBeenCalledWith('biz-1');
      expect(result).toEqual(mockBusiness);
    });
  });
});
