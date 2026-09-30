import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoryOptionService } from './category-option.service.js';
import { CreateCategoryOptionDto } from './dto/create-category-option.dto.js';
import { UpdateCategoryOptionDto } from './dto/update-category-option.dto.js';

@Controller('category/:categoryId/option-groups/:optionGroupId/options')
export class CategoryOptionController {
  constructor(private readonly categoryOptionService: CategoryOptionService) {}

  @Post()
  create(
    @Param('categoryId') categoryId: string,
    @Param('optionGroupId') optionGroupId: string,
    @Body() createCategoryOptionDto: CreateCategoryOptionDto,
  ) {
    return this.categoryOptionService.create(
      categoryId,
      optionGroupId,
      createCategoryOptionDto,
    );
  }

  @Get()
  findAll(
    @Param('categoryId') categoryId: string,
    @Param('optionGroupId') optionGroupId: string,
  ) {
    return this.categoryOptionService.findAll(categoryId, optionGroupId);
  }

  @Get(':id')
  findOne(
    @Param('categoryId') categoryId: string,
    @Param('optionGroupId') optionGroupId: string,
    @Param('id') id: string,
  ) {
    return this.categoryOptionService.findOne(categoryId, optionGroupId, id);
  }

  @Patch(':id')
  update(
    @Param('categoryId') categoryId: string,
    @Param('optionGroupId') optionGroupId: string,
    @Param('id') id: string,
    @Body() updateCategoryOptionDto: UpdateCategoryOptionDto,
  ) {
    return this.categoryOptionService.update(
      categoryId,
      optionGroupId,
      id,
      updateCategoryOptionDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('categoryId') categoryId: string,
    @Param('optionGroupId') optionGroupId: string,
    @Param('id') id: string,
  ) {
    return this.categoryOptionService.remove(categoryId, optionGroupId, id);
  }
}
