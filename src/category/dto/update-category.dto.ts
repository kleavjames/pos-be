import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto.js';

export class UpdateCategoryDto extends PartialType(
  OmitType(CreateCategoryDto, ['optionGroups'] as const),
) {}
