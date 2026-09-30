import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryOptionDto } from './create-category-option.dto.js';

export class UpdateCategoryOptionDto extends PartialType(
  CreateCategoryOptionDto,
) {}
