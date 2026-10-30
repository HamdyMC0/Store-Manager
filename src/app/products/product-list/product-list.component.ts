import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Category, Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  standalone: false
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];      // all the products
  filtered: Product[] = [];      // after search, category and sort
  pageItems: Product[] = [];     // only the products of the current page
  categories: Category[] = [];

  loading = true;
  errorMessage = '';

  // filters
  searchText = '';
  selectedCategory = '';         // the slug of the category
  sortBy = 'newest';

  // pagination
  currentPage = 1;
  pageSize = 8;
  totalPages = 1;
  pages: number[] = [1];

  // numbers for the top cards
  inStock = 0;
  outOfStock = 0;
  averagePrice = 0;

  // the product waiting for the delete confirmation
  productToDelete: Product | null = null;
  deleting = false;

  constructor(
    public authService: AuthService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.categoryService.categories$.subscribe(list => {
      this.categories = list;
    });

    // the category comes from the url, like /products?category=shoes
    this.route.queryParamMap.subscribe(params => {
      this.selectedCategory = params.get('category') || '';
      this.currentPage = 1;
      this.applyFilters();
    });

    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.updateNumbers();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.loading = false;
      }
    });
  }

  // the numbers of the top cards
  updateNumbers() {
    this.inStock = 0;
    this.outOfStock = 0;
    let total = 0;

    for (const p of this.products) {
      if (p.stock > 0) {
        this.inStock++;
      } else {
        this.outOfStock++;
      }
      total += p.price;
    }

    this.averagePrice = this.products.length > 0 ? total / this.products.length : 0;
  }

  applyFilters() {
    const text = this.searchText.trim().toLowerCase();
    const result: Product[] = [];

    for (const p of this.products) {
      const matchesText = text === ''
        || p.title.toLowerCase().includes(text)
        || p.category.toLowerCase().includes(text)
        || p.subcategory.toLowerCase().includes(text);
      const matchesCategory = this.selectedCategory === '' || p.categorySlug === this.selectedCategory;

      if (matchesText && matchesCategory) {
        result.push(p);
      }
    }

    if (this.sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.sortBy === 'stock-low') {
      result.sort((a, b) => a.stock - b.stock);
    } else {
      result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    this.filtered = result;
    this.updatePages();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters() {
    this.searchText = '';
    this.sortBy = 'newest';
    this.currentPage = 1;
    this.applyFilters();
  }

  updatePages() {
    this.totalPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }

    const start = (this.currentPage - 1) * this.pageSize;
    this.pageItems = this.filtered.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.updatePages();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // delete with a confirmation modal (admin only)
  askToDelete(id: string) {
    const found = this.products.find(p => p.id === id);
    if (found) {
      this.productToDelete = found;
    }
  }

  cancelDelete() {
    if (!this.deleting) {
      this.productToDelete = null;
    }
  }

  confirmDelete() {
    if (!this.productToDelete) {
      return;
    }

    const product = this.productToDelete;
    this.deleting = true;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== product.id);
        this.updateNumbers();
        this.applyFilters();
        this.toastService.show('The product was deleted.', 'success');
        this.deleting = false;
        this.productToDelete = null;
      },
      error: (err) => {
        this.toastService.show(err.message, 'danger');
        this.deleting = false;
        this.productToDelete = null;
      }
    });
  }
}
