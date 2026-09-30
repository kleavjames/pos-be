import { PartialType } from '@nestjs/mapped-types';
import { CreateProductOptionDto } from '../../dto/create-product-option.dto.js';

export class UpdateProductOptionDto extends PartialType(CreateProductOptionDto) {}
