import { Test, TestingModule } from '@nestjs/testing';
import { CategoryOptionController } from './category-option.controller.js';
import { CategoryOptionService } from './category-option.service.js';

describe('CategoryOptionController', () => {
  let controller: CategoryOptionController;

  const mockService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryOptionController],
      providers: [
        {
          provide: CategoryOptionService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CategoryOptionController>(CategoryOptionController);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
