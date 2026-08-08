import { TestBed, ComponentFixture } from '@angular/core/testing';
import {
  AppIconComponent,
  AppIconName,
  APP_ICON_NAMES,
  asAppIconName,
} from './app-icon.component';

describe('AppIconComponent — shared icon registry', () => {
  let fixture: ComponentFixture<AppIconComponent>;

  /** The mask span rendered inside the component for the given icon name. */
  function render(name: AppIconName): HTMLElement {
    fixture.componentRef.setInput('name', name);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.app-icon-mask') as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppIconComponent);
    fixture.detectChanges();
  });

  it('paints every registered icon from its assets/icons/<name>.svg file', () => {
    for (const name of APP_ICON_NAMES) {
      if (!name) continue;
      render(name);
      expect(fixture.componentInstance.maskStyle, `name="${name}"`).toBe(
        `url('assets/icons/${name}.svg') no-repeat center / contain`,
      );
    }
  });

  it('renders a mask span wired to the icon asset file', () => {
    for (const name of ['logout', 'sun', 'chevron-down', 'dashboard', 'search', 'x'] as AppIconName[]) {
      const span = render(name);
      expect(span).toBeTruthy();
      expect(span.getAttribute('aria-hidden')).toBe('true');
      // The mask url is bound onto the span via the --app-icon-mask custom prop
      expect(span.style.getPropertyValue('--app-icon-mask')).toContain(
        `assets/icons/${name}.svg`,
      );
      expect(span.style.visibility).toBe('visible');
    }
  });

  it('registers each icon name exactly once', () => {
    expect(new Set(APP_ICON_NAMES).size).toBe(APP_ICON_NAMES.length);
  });

  it('every registered (non-empty) name resolves to an .svg asset', () => {
    for (const name of APP_ICON_NAMES) {
      if (!name) continue;
      render(name);
      const style = fixture.componentInstance.maskStyle;
      expect(style.startsWith("url('assets/icons/")).toBe(true);
      expect(style.endsWith(".svg') no-repeat center / contain")).toBe(true);
    }
  });

  describe('asAppIconName() runtime fallback', () => {
    it('passes registered names through unchanged', () => {
      expect(asAppIconName('dashboard')).toBe('dashboard');
      expect(asAppIconName('chevron-right')).toBe('chevron-right');
      expect(asAppIconName('search')).toBe('search');
      expect(asAppIconName('')).toBe('');
    });

    it('falls back to empty for unknown names', () => {
      expect(asAppIconName('bogus-icon')).toBe('');
      expect(asAppIconName('role')).toBe('');
      expect(asAppIconName('cloudinary')).toBe('');
    });
  });

  it('renders nothing (mask: none, hidden) when no name is set', () => {
    const span = render('');
    expect(span).toBeTruthy();
    expect(fixture.componentInstance.maskStyle).toBe('none');
    expect(span.style.getPropertyValue('--app-icon-mask')).toBe('none');
    expect(span.style.visibility).toBe('hidden');
  });

  it('renders nothing (mask: none, hidden) for unknown icon names', () => {
    const span = render('bogus-icon' as AppIconName);
    expect(span).toBeTruthy();
    expect(fixture.componentInstance.maskStyle).toBe('none');
    expect(span.style.visibility).toBe('hidden');
  });

  it('applies svgClass to the rendered span', () => {
    fixture.componentRef.setInput('svgClass', 'w-4 h-4');
    fixture.detectChanges();

    const cls = render('logout').getAttribute('class') ?? '';
    expect(cls).toContain('app-icon-mask');
    expect(cls).toContain('w-4');
    expect(cls).toContain('h-4');
  });

  it('keeps the default size when no svgClass is provided', () => {
    const cls = render('menu').getAttribute('class') ?? '';
    expect(cls).toContain('w-5');
    expect(cls).toContain('h-5');
  });
});
