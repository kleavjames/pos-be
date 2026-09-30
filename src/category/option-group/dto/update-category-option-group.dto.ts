import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryOptionGroupDto } from './create-category-option-group.dto.js';

export class UpdateCategoryOptionGroupDto extends PartialType(
  CreateCategoryOptionGroupDto,
) {}
