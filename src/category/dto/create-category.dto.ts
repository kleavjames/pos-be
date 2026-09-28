import type { CategoryPricingMode } from '../../generated/prisma/client.js';
import { CreateCategoryOptionGroupDto } from './create-category-option.dto.js';

export class CreateCategoryDto {
  name!: string;
  pricingMode?: CategoryPricingMode;
  isActive?: boolean;
  optionGroups?: CreateCategoryOptionGroupDto[];
}
