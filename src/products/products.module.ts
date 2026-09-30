import { Module } from '@nestjs/common';
import { ProductOptionController } from './options/product-option.controller.js';
import { ProductOptionService } from './options/product-option.service.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  controllers: [ProductsController, ProductOptionController],
  providers: [ProductsService, ProductOptionService],
})
export class ProductsModule {}
