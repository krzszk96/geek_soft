import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { ThemeType } from '../types/theme.type';

describe('ThemeService', () => {
  let service: ThemeService;

  const mockMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jasmine.createSpy().and.returnValue({
        matches,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addEventListener: jasmine.createSpy(),
        removeEventListener: jasmine.createSpy(),
        dispatchEvent: jasmine.createSpy(),
      }),
    });
  };

  beforeEach(() => {
    document.body.className = '';
    localStorage.clear();
  });

  const createService = () => {
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);
  };

  it('should be created', () => {
    mockMatchMedia(true);
    createService();
    expect(service).toBeTruthy();
  });

  it('should use system dark theme when no saved theme exists', () => {
    mockMatchMedia(true);
    createService();

    expect(service.getTheme()).toBe('dark-theme');
    expect(document.body.classList.contains('dark-theme')).toBeTrue();
  });

  it('should use system light theme when no saved theme exists', () => {
    mockMatchMedia(false);
    createService();

    expect(service.getTheme()).toBe('light-theme');
    expect(document.body.classList.contains('light-theme')).toBeTrue();
  });

  it('should use saved theme from localStorage if exists', () => {
    localStorage.setItem('app-theme', 'light-theme');
    mockMatchMedia(true);

    createService();

    expect(service.getTheme()).toBe('light-theme');
    expect(document.body.classList.contains('light-theme')).toBeTrue();
  });

  it('should persist theme when setTheme is called', () => {
    mockMatchMedia(true);
    createService();

    service.setTheme('light-theme' as ThemeType);

    expect(localStorage.getItem('app-theme')).toBe('light-theme');
    expect(service.getTheme()).toBe('light-theme');
  });

  it('should toggle theme correctly', () => {
    mockMatchMedia(true);
    createService();

    service.toggleTheme();
    expect(service.getTheme()).toBe('light-theme');

    service.toggleTheme();
    expect(service.getTheme()).toBe('dark-theme');
  });

  it('should replace previous theme class on body', () => {
    mockMatchMedia(true);
    createService();

    service.setTheme('light-theme' as ThemeType);
    service.setTheme('dark-theme' as ThemeType);

    expect(document.body.classList.contains('light-theme')).toBeFalse();
    expect(document.body.classList.contains('dark-theme')).toBeTrue();
  });
});
