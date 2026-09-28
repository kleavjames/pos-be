import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBusinessDto } from './dto/create-business.dto.js';
import { UpdateBusinessDto } from './dto/update-business.dto.js';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  create(createBusinessDto: CreateBusinessDto) {
    return this.prisma.business.create({
      data: createBusinessDto,
    });
  }

  findAll() {
    return this.prisma.business.findMany({
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException(`Business with id ${id} not found`);
    }

    return business;
  }

  async update(id: string, updateBusinessDto: UpdateBusinessDto) {
    await this.findOne(id);

    return this.prisma.business.update({
      where: { id },
      data: updateBusinessDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.business.delete({
      where: { id },
    });
  }
}
