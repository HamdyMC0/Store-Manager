import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  standalone: false
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  related: Product[] = [];
  loading = true;
  notFound = false;
  errorMessage = '';
  currentId = '';
  imageFailed = false;

  // description, details or inventory
  activeTab = 'description';

  // delete confirmation (admin only)
  showDelete = false;
  deleting = false;

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    // paramMap is used (not snapshot) so the page updates if the id changes
    this.route.paramMap.subscribe(params => {
      this.currentId = params.get('id') || '';
      this.loadProduct();
    });
  }

  loadProduct() {
    this.loading = true;
    this.notFound = false;
    this.errorMessage = '';
    this.product = null;
    this.related = [];
    this.imageFailed = false;
    this.activeTab = 'description';

    // the service answers null when the id is wrong or the product does not exist
    this.productService.getProduct(this.currentId).subscribe({
      next: (data) => {
        if (data) {
          this.product = data;
          this.loadRelated();
        } else {
          this.notFound = true;
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.loading = false;
      }
    });
  }

  // other products from the same category
  loadRelated() {
    this.productService.getProducts().subscribe({
      next: (all) => {
        if (!this.product) {
          return;
        }
        const current = this.product;
        this.related = all
          .filter(p => p.categoryId !== '' && p.categoryId === current.categoryId && p.id !== current.id)
          .slice(0, 4);
      },
      error: () => {
        // related products are not important, so no error message
        this.related = [];
      }
    });
  }

  get outOfStock(): boolean {
    return !!this.product && this.product.stock === 0;
  }

  get stockLabel(): string {
    const count = this.product ? this.product.stock : 0;
    if (count === 0) {
      return 'Out of stock';
    } else if (count < 10) {
      return 'Low stock';
    } else if (count < 50) {
      return 'Medium stock';
    }
    return 'Well stocked';
  }

  // the width and color of the stock bar
  get stockBarClass(): string {
    const count = this.product ? this.product.stock : 0;
    if (count === 0) {
      return '';
    } else if (count < 10) {
      return 'w-25 bg-danger';
    } else if (count < 50) {
      return 'w-50 bg-warning';
    } else if (count < 100) {
      return 'w-75 bg-success';
    }
    return 'w-100 bg-success';
  }

  copyLink() {
    navigator.clipboard.writeText(window.location.href).then(
      () => this.toastService.show('Link copied to the clipboard.', 'success'),
      () => this.toastService.show('Could not copy the link.', 'danger')
    );
  }

  confirmDelete() {
    if (!this.product) {
      return;
    }

    this.deleting = true;
    this.productService.deleteProduct(this.product.id).subscribe({
      next: () => {
        this.toastService.show('The product was deleted.', 'success');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.toastService.show(err.message, 'danger');
        this.deleting = false;
        this.showDelete = false;
      }
    });
  }
}
