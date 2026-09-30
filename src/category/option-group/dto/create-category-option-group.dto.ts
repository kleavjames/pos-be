import type { CategoryOptionType } from '../../../generated/prisma/client.js';
import { CreateCategoryOptionDto } from '../../options/dto/create-category-option.dto.js';

export { CreateCategoryOptionDto };

export class CreateCategoryOptionGroupDto {
  name!: string;
  type!: CategoryOptionType;
  sortOrder?: number;
  options?: CreateCategoryOptionDto[];
}
