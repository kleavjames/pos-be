import { CreateProductOptionDto } from './create-product-option.dto.js';

export class CreateProductDto {
  categoryId!: string;
  name!: string;
  basePrice?: number;
  isActive?: boolean;
  productOptions?: CreateProductOptionDto[];
}
