import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: 'light-theme' | 'dark-theme' = 'dark-theme';

  constructor() {
    this.setTheme(this.currentTheme);
  }

  setTheme(theme: 'light-theme' | 'dark-theme') {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(theme);
    this.currentTheme = theme;
  }

  toggleTheme() {
    this.setTheme(this.currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme');
  }

  getTheme() {
    return this.currentTheme;
  }
}
