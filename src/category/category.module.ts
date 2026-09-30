import { Module } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CategoryController } from './category.controller.js';
import { CategoryOptionGroupController } from './option-group/category-option-group.controller.js';
import { CategoryOptionGroupService } from './option-group/category-option-group.service.js';
import { CategoryOptionController } from './options/category-option.controller.js';
import { CategoryOptionService } from './options/category-option.service.js';

@Module({
  controllers: [
    CategoryController,
    CategoryOptionGroupController,
    CategoryOptionController,
  ],
  providers: [CategoryService, CategoryOptionGroupService, CategoryOptionService],
})
export class CategoryModule {}
