import { Component, HostListener, OnInit } from '@angular/core';

import { CategoryService } from './services/category.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'Store Manager';
  showTopButton = false;

  constructor(private categoryService: CategoryService) { }

  ngOnInit() {
    // the navbar, footer and home page use the categories, so they are loaded once here
    this.categoryService.refresh();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.showTopButton = window.scrollY > 400;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
