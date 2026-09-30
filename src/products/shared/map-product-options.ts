import type { CreateProductOptionDto } from '../dto/create-product-option.dto.js';

export function mapProductOptionsForCreate(
  productOptions?: CreateProductOptionDto[],
) {
  if (!productOptions?.length) {
    return undefined;
  }

  return {
    create: productOptions.map((option) => ({
      categoryOptionId: option.categoryOptionId,
      price: option.price,
      isEnabled: option.isEnabled ?? true,
    })),
  };
}
