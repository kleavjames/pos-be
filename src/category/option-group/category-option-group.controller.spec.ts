import { Test, TestingModule } from '@nestjs/testing';
import { CategoryOptionGroupController } from './category-option-group.controller.js';
import { CategoryOptionGroupService } from './category-option-group.service.js';

describe('CategoryOptionGroupController', () => {
  let controller: CategoryOptionGroupController;

  const mockService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryOptionGroupController],
      providers: [
        {
          provide: CategoryOptionGroupService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CategoryOptionGroupController>(
      CategoryOptionGroupController,
    );

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
