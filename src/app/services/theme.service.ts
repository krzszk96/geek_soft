import { Injectable } from '@angular/core';
import { ThemeType } from '../types/theme.type';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: ThemeType = 'dark-theme';

  constructor() {
    this.setTheme(this.currentTheme);
  }

  setTheme(theme: ThemeType) {
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
