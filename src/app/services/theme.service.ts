import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  theme: 'light' | 'dark' = 'light';

  constructor() {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('theme');
    } catch (e) {
      saved = null;
    }

    if (saved === 'dark' || saved === 'light') {
      this.theme = saved;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.theme = 'dark';
    }

    this.apply();
  }

  toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.apply();

    try {
      localStorage.setItem('theme', this.theme);
    } catch (e) {
      // storage is not available, ignore it
    }
  }

  private apply() {
    document.documentElement.setAttribute('data-bs-theme', this.theme);
  }
}
