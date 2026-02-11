import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { ThemeType } from '../types/theme.type';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    document.body.className = '';

    TestBed.configureTestingModule({
      providers: [ThemeService],
    });

    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set initial theme to dark-theme', () => {
    expect(service.getTheme()).toBe('dark-theme');
    expect(document.body.classList.contains('dark-theme')).toBeTrue();
  });

  it('should change theme when setTheme is called', () => {
    service.setTheme('light-theme' as ThemeType);

    expect(service.getTheme()).toBe('light-theme');
    expect(document.body.classList.contains('light-theme')).toBeTrue();
    expect(document.body.classList.contains('dark-theme')).toBeFalse();
  });

  it('should toggle theme correctly', () => {
    expect(service.getTheme()).toBe('dark-theme');

    service.toggleTheme();
    expect(service.getTheme()).toBe('light-theme');
    expect(document.body.classList.contains('light-theme')).toBeTrue();

    service.toggleTheme();
    expect(service.getTheme()).toBe('dark-theme');
    expect(document.body.classList.contains('dark-theme')).toBeTrue();
  });

  it('should replace previous theme when setTheme is called again', () => {
    service.setTheme('light-theme' as ThemeType);
    service.setTheme('dark-theme' as ThemeType);

    expect(document.body.classList.contains('light-theme')).toBeFalse();
    expect(document.body.classList.contains('dark-theme')).toBeTrue();
  });
});
