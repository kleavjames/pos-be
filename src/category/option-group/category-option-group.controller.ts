import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoryOptionGroupService } from './category-option-group.service.js';
import { CreateCategoryOptionGroupDto } from './dto/create-category-option-group.dto.js';
import { UpdateCategoryOptionGroupDto } from './dto/update-category-option-group.dto.js';

@Controller('category/:categoryId/option-groups')
export class CategoryOptionGroupController {
  constructor(
    private readonly categoryOptionGroupService: CategoryOptionGroupService,
  ) {}

  @Post()
  create(
    @Param('categoryId') categoryId: string,
    @Body() createCategoryOptionGroupDto: CreateCategoryOptionGroupDto,
  ) {
    return this.categoryOptionGroupService.create(
      categoryId,
      createCategoryOptionGroupDto,
    );
  }

  @Get()
  findAll(@Param('categoryId') categoryId: string) {
    return this.categoryOptionGroupService.findAll(categoryId);
  }

  @Get(':id')
  findOne(
    @Param('categoryId') categoryId: string,
    @Param('id') id: string,
  ) {
    return this.categoryOptionGroupService.findOne(categoryId, id);
  }

  @Patch(':id')
  update(
    @Param('categoryId') categoryId: string,
    @Param('id') id: string,
    @Body() updateCategoryOptionGroupDto: UpdateCategoryOptionGroupDto,
  ) {
    return this.categoryOptionGroupService.update(
      categoryId,
      id,
      updateCategoryOptionGroupDto,
    );
  }

  @Delete(':id')
  remove(@Param('categoryId') categoryId: string, @Param('id') id: string) {
    return this.categoryOptionGroupService.remove(categoryId, id);
  }
}
