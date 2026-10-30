import { Component, OnInit } from '@angular/core';

import { SITE } from '../../site.config';
import { Category } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  standalone: false
})
export class FooterComponent implements OnInit {
  site = SITE;
  categories: Category[] = [];

  constructor(
    public authService: AuthService,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.categoryService.categories$.subscribe(list => {
      // only the first 5 are shown in the footer
      this.categories = list.slice(0, 5);
    });
  }
}
