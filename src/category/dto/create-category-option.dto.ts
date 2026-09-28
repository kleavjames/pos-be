import type { CategoryOptionType } from '../../generated/prisma/client.js';

export class CreateCategoryOptionDto {
  name!: string;
  defaultPrice?: number;
  sortOrder?: number;
}

export class CreateCategoryOptionGroupDto {
  name!: string;
  type!: CategoryOptionType;
  sortOrder?: number;
  options!: CreateCategoryOptionDto[];
}
