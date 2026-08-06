import { TestBed, ComponentFixture } from '@angular/core/testing';
import {
  AppIconComponent,
  AppIconName,
  APP_ICON_NAMES,
  asAppIconName,
} from './app-icon.component';

describe('AppIconComponent — shared icon registry', () => {
  let fixture: ComponentFixture<AppIconComponent>;

  /** Shapes rendered inside the icon's <svg> for the given icon name */
  function svgShapes(name: AppIconName): Element[] {
    fixture.componentRef.setInput('name', name);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    return Array.from(svg?.children ?? []);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppIconComponent);
    fixture.detectChanges();
  });

  /** Expected shape count for every registered icon name — adding a new case
      to the registry must come with an entry here (typed against the union,
      so the compiler enforces completeness). */
  const iconShapeCounts: Record<AppIconName, number> = {
    '': 0,
    logout: 3,
    sun: 9,
    moon: 1,
    'chevron-down': 1,
    'chevron-right': 1,
    check: 1,
    menu: 1,
    'panel-collapse': 1,
    'panel-expand': 1,
    dashboard: 4,
    sale: 3,
    product: 4,
    report: 2,
    history: 1,
    user: 2,
    category: 4,
    permission: 1,
    'purchase-order': 2,
    supplier: 3,
    management: 8,
    settings: 4,
    cart: 1,
    orders: 1,
    x: 1,
    zap: 1,
    globe: 2,
    'shopping-bag': 1,
  };

  it('renders the expected shape count for every registered icon name', () => {
    for (const name of Object.keys(iconShapeCounts) as AppIconName[]) {
      const shapes = svgShapes(name);
      expect(shapes.length, `name="${name}"`).toBe(iconShapeCounts[name]);
    }
  });

  it('APP_ICON_NAMES covers exactly the union (and thus the template switch)', () => {
    // Every union member must be registered for the runtime fallback to work
    const missing = (APP_ICON_NAMES as readonly string[]).filter(
      name => !(name in iconShapeCounts)
    );
    expect(missing).toEqual([]);
    expect(new Set(APP_ICON_NAMES).size).toBe(APP_ICON_NAMES.length); // no duplicates
  });

  describe('asAppIconName() runtime fallback', () => {
    it('passes registered names through unchanged', () => {
      expect(asAppIconName('dashboard')).toBe('dashboard');
      expect(asAppIconName('chevron-right')).toBe('chevron-right');
      expect(asAppIconName('')).toBe('');
    });

    it('falls back to empty for unknown names', () => {
      expect(asAppIconName('bogus-icon')).toBe('');
      expect(asAppIconName('role')).toBe('');
      expect(asAppIconName('cloudinary')).toBe('');
    });
  });

  it('renders an empty SVG when no name is set', () => {
    expect(svgShapes('').length).toBe(0);
    // The svg wrapper itself always exists (decorative, stroke-based)
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('fill')).toBe('none');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
  });

  it('renders logout as 1 path + 1 polyline + 1 line', () => {
    const shapes = svgShapes('logout');

    expect(shapes.length).toBe(3);
    expect(shapes[0].tagName.toLowerCase()).toBe('path');
    expect(shapes[1].tagName.toLowerCase()).toBe('polyline');
    expect(shapes[2].tagName.toLowerCase()).toBe('line');
  });

  it('renders sun as 1 circle + 8 rays (9 shapes)', () => {
    const shapes = svgShapes('sun');

    expect(shapes.length).toBe(9);
    expect(shapes.filter(s => s.tagName.toLowerCase() === 'circle').length).toBe(1);
    expect(shapes.filter(s => s.tagName.toLowerCase() === 'line').length).toBe(8);
  });

  it('renders moon as exactly 1 path', () => {
    const shapes = svgShapes('moon');

    expect(shapes.length).toBe(1);
    expect(shapes[0].tagName.toLowerCase()).toBe('path');
  });

  it('applies svgClass to the inner svg', () => {
    fixture.componentRef.setInput('svgClass', 'w-4 h-4');
    fixture.detectChanges();

    const cls = fixture.nativeElement.querySelector('svg').getAttribute('class');
    expect(cls).toContain('w-4');
    expect(cls).toContain('h-4');
  });

  it('keeps the same stroke-based styling across all icon names', () => {
    for (const name of Object.keys(iconShapeCounts) as AppIconName[]) {
      if (!name) continue;
      svgShapes(name);
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg.getAttribute('stroke-width')).toBe('2');
      expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    }
  });
});
