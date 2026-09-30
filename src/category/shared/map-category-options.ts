import type { CreateCategoryOptionDto } from '../options/dto/create-category-option.dto.js';

export function mapCategoryOptionsForCreate(
  options?: CreateCategoryOptionDto[],
) {
  if (!options?.length) {
    return undefined;
  }

  return {
    create: options.map((option, index) => ({
      name: option.name,
      defaultPrice: option.defaultPrice ?? 0,
      sortOrder: option.sortOrder ?? index,
      isActive: option.isActive ?? true,
    })),
  };
}
