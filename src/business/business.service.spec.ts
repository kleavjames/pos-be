import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { BusinessService } from './business.service.js';

describe('BusinessService', () => {
  let service: BusinessService;

  const mockBusiness = {
    id: 'biz-1',
    name: 'Acme Coffee',
    slug: 'acme-coffee',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    business: {
      create: vi.fn().mockResolvedValue(mockBusiness),
      findMany: vi.fn().mockResolvedValue([mockBusiness]),
      findUnique: vi.fn().mockResolvedValue(mockBusiness),
      update: vi.fn().mockResolvedValue(mockBusiness),
      delete: vi.fn().mockResolvedValue(mockBusiness),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);

    vi.clearAllMocks();
    mockPrisma.business.findUnique.mockResolvedValue(mockBusiness);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a business', async () => {
      const dto = { name: 'Acme Coffee', slug: 'acme-coffee' };

      const result = await service.create(dto);

      expect(mockPrisma.business.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('findAll', () => {
    it('returns all businesses ordered by updatedAt', async () => {
      const result = await service.findAll();

      expect(mockPrisma.business.findMany).toHaveBeenCalledWith({
        orderBy: [{ updatedAt: 'desc' }],
      });
      expect(result).toEqual([mockBusiness]);
    });
  });

  describe('findOne', () => {
    it('returns the business when found', async () => {
      const result = await service.findOne('biz-1');

      expect(mockPrisma.business.findUnique).toHaveBeenCalledWith({
        where: { id: 'biz-1' },
      });
      expect(result).toEqual(mockBusiness);
    });

    it('throws NotFoundException when business does not exist', async () => {
      mockPrisma.business.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        new NotFoundException('Business with id missing not found'),
      );
    });
  });

  describe('update', () => {
    it('updates business fields', async () => {
      const dto = { name: 'Updated name' };

      const result = await service.update('biz-1', dto);

      expect(mockPrisma.business.findUnique).toHaveBeenCalledWith({
        where: { id: 'biz-1' },
      });
      expect(mockPrisma.business.update).toHaveBeenCalledWith({
        where: { id: 'biz-1' },
        data: dto,
      });
      expect(result).toEqual(mockBusiness);
    });

    it('throws NotFoundException when business does not exist', async () => {
      mockPrisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing', { name: 'Updated name' }),
      ).rejects.toThrow(
        new NotFoundException('Business with id missing not found'),
      );
      expect(mockPrisma.business.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes the business when found', async () => {
      const result = await service.remove('biz-1');

      expect(mockPrisma.business.findUnique).toHaveBeenCalledWith({
        where: { id: 'biz-1' },
      });
      expect(mockPrisma.business.delete).toHaveBeenCalledWith({
        where: { id: 'biz-1' },
      });
      expect(result).toEqual(mockBusiness);
    });

    it('throws NotFoundException when business does not exist', async () => {
      mockPrisma.business.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        new NotFoundException('Business with id missing not found'),
      );
      expect(mockPrisma.business.delete).not.toHaveBeenCalled();
    });
  });
});
