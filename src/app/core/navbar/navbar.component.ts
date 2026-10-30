import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SITE } from '../../site.config';
import { Category } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: false
})
export class NavbarComponent implements OnInit {
  site = SITE;
  categories: Category[] = [];

  menuOpen = false;

  // which dropdown is open: '', 'categories' or 'user'
  openDropdown = '';

  constructor(
    public themeService: ThemeService,
    public authService: AuthService,
    private categoryService: CategoryService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
    this.categoryService.categories$.subscribe(list => {
      this.categories = list;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleDropdown(event: Event, name: string) {
    event.preventDefault();
    event.stopPropagation();
    this.openDropdown = this.openDropdown === name ? '' : name;
  }

  closeMenu() {
    this.menuOpen = false;
    this.openDropdown = '';
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
    this.toastService.show('You have been logged out.', 'info');
    this.router.navigate(['/']);
  }

  // clicking anywhere else closes the dropdown
  @HostListener('document:click')
  onDocumentClick() {
    this.openDropdown = '';
  }
}
