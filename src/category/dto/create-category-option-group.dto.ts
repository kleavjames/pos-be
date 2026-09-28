import type { CategoryOptionType } from '../../generated/prisma/client.js';
import { CreateCategoryOptionDto } from './create-category-option.dto.js';

export class CreateCategoryOptionGroupDto {
  name!: string;
  type!: CategoryOptionType;
  sortOrder?: number;
  options!: CreateCategoryOptionDto[];
}
