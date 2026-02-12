import { Injectable } from '@angular/core';
import { ThemeType } from '../types/theme.type';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private storageKey = 'app-theme';
  private currentTheme: ThemeType = 'dark-theme';

  constructor() {
    const savedTheme = localStorage.getItem(this.storageKey) as ThemeType | null;

    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else {
      this.currentTheme = this.mediaQuery.matches ? 'dark-theme' : 'light-theme';
    }

    this.applyTheme();

    this.mediaQuery.addEventListener('change', (event) => {
      if (!localStorage.getItem(this.storageKey)) {
        this.setTheme(event.matches ? 'dark-theme' : 'light-theme');
      }
    });
  }

  setTheme(theme: ThemeType) {
    this.currentTheme = theme;
    localStorage.setItem(this.storageKey, theme);
    this.applyTheme();
  }

  toggleTheme() {
    this.setTheme(this.currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme');
  }

  getTheme() {
    return this.currentTheme;
  }

  private applyTheme() {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(this.currentTheme);
  }
}
