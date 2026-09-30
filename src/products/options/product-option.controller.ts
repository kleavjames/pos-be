import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateProductOptionDto } from '../dto/create-product-option.dto.js';
import { UpdateProductOptionDto } from './dto/update-product-option.dto.js';
import { ProductOptionService } from './product-option.service.js';

@Controller('products/:productId/options')
export class ProductOptionController {
  constructor(private readonly productOptionService: ProductOptionService) {}

  @Post()
  create(
    @Param('productId') productId: string,
    @Body() createProductOptionDto: CreateProductOptionDto,
  ) {
    return this.productOptionService.create(productId, createProductOptionDto);
  }

  @Get()
  findAll(@Param('productId') productId: string) {
    return this.productOptionService.findAll(productId);
  }

  @Get(':id')
  findOne(@Param('productId') productId: string, @Param('id') id: string) {
    return this.productOptionService.findOne(productId, id);
  }

  @Patch(':id')
  update(
    @Param('productId') productId: string,
    @Param('id') id: string,
    @Body() updateProductOptionDto: UpdateProductOptionDto,
  ) {
    return this.productOptionService.update(
      productId,
      id,
      updateProductOptionDto,
    );
  }

  @Delete(':id')
  remove(@Param('productId') productId: string, @Param('id') id: string) {
    return this.productOptionService.remove(productId, id);
  }
}
