import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  standalone: false
})
export class ProductCardComponent implements OnChanges {
  @Input() product!: Product;
  @Input() canManage = false;    // true shows the edit and delete buttons (admin only)
  @Input() preview = false;      // true is used in the add product page
  @Output() delete = new EventEmitter<string>();

  imageFailed = false;

  ngOnChanges() {
    // try the image again if the product changed
    this.imageFailed = false;
  }

  get outOfStock(): boolean {
    return this.product.stock === 0;
  }

  get lowStock(): boolean {
    return this.product.stock > 0 && this.product.stock < 10;
  }

  // a product is "new" for 7 days
  get isNew(): boolean {
    if (this.preview) {
      return false;
    }
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - this.product.createdAt.getTime() < sevenDays;
  }

  onDelete() {
    this.delete.emit(this.product.id);
  }
}
