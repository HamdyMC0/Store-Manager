import { Component, OnInit } from '@angular/core';

import { SITE } from '../../site.config';
import { Category, Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: false
})
export class HomeComponent implements OnInit {
  site = SITE;
  appName = 'Store Manager';

  loading = true;
  failed = false;

  products: Product[] = [];
  latest: Product[] = [];
  categories: Category[] = [];

  inStock = 0;
  outOfStock = 0;
  averagePrice = 0;

  faqs = [
    {
      question: 'Where does the product data come from?',
      answer: 'Everything comes from the store backend (Node.js, Express and MongoDB). The products, categories and accounts you see are saved in the database.'
    },
    {
      question: 'Who can add or delete products?',
      answer: 'Only admin accounts. Normal users can browse the products, see the details and manage their own profile.'
    },
    {
      question: 'Why do I need to activate my account?',
      answer: 'After you sign up we send an email with an activation link, to make sure the address is really yours. You can log in as soon as it is activated.'
    },
    {
      question: 'Does it work on a phone?',
      answer: 'Yes. The layout is responsive, and there is also a dark mode you can switch on from the navbar.'
    }
  ];
  openFaq = 0;

  constructor(
    public authService: AuthService,
    private productService: ProductService,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.categoryService.categories$.subscribe(list => {
      this.categories = list;
    });

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.calculate();
        this.loading = false;
      },
      error: () => {
        // the home page still works without the products
        this.failed = true;
        this.loading = false;
      }
    });
  }

  calculate() {
    let total = 0;
    this.inStock = 0;
    this.outOfStock = 0;

    for (const p of this.products) {
      total += p.price;
      if (p.stock > 0) {
        this.inStock++;
      } else {
        this.outOfStock++;
      }
    }

    this.averagePrice = this.products.length > 0 ? total / this.products.length : 0;

    // the 4 newest products
    const sorted = [...this.products].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    this.latest = sorted.slice(0, 4);
  }

  countInCategory(categoryId: string): number {
    let count = 0;
    for (const p of this.products) {
      if (p.categoryId === categoryId) {
        count++;
      }
    }
    return count;
  }

  toggleFaq(index: number) {
    this.openFaq = this.openFaq === index ? -1 : index;
  }
}
