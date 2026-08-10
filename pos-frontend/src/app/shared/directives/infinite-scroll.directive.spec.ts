import { ElementRef, SimpleChange } from '@angular/core';
import { InfiniteScrollDirective } from './infinite-scroll.directive';

describe('InfiniteScrollDirective', () => {
  let host: HTMLElement;
  let directive: InfiniteScrollDirective;
  let loadSpy: ReturnType<typeof vi.fn>;

  const setViewport = (width: number) =>
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });

  /** Creates a directive bound to a scrollable host element (mobile viewport). */
  function createDirective(enabled = true): void {
    host = document.createElement('div');
    host.style.overflowY = 'auto';
    directive = new InfiniteScrollDirective(new ElementRef<HTMLElement>(host), 'browser');
    loadSpy = vi.fn();
    directive.appInfiniteScrollLoad.subscribe(loadSpy);
    directive.appInfiniteScroll = enabled;
    directive.ngAfterViewInit();
  }

  /** Positions the scroll container 150px from the bottom (inside the 250px threshold). */
  function scrollNearBottom(): void {
    Object.defineProperty(host, 'scrollHeight', { configurable: true, value: 1000 });
    Object.defineProperty(host, 'clientHeight', { configurable: true, value: 400 });
    host.scrollTop = 850; // 850 + 400 = 1250 >= 1000 - 250 = 750
  }

  beforeEach(() => {
    setViewport(375); // mobile by default
  });

  afterEach(() => {
    directive?.ngOnDestroy();
    setViewport(1024);
  });

  describe('near-bottom detection', () => {
    it('emits appInfiniteScrollLoad when scrolled near the bottom on mobile', () => {
      createDirective();
      scrollNearBottom();
      host.dispatchEvent(new Event('scroll'));
      expect(loadSpy).toHaveBeenCalledTimes(1);
    });

    it('emits on every near-bottom scroll (the consumer guards duplicate loads)', () => {
      createDirective();
      scrollNearBottom();
      host.dispatchEvent(new Event('scroll'));
      host.dispatchEvent(new Event('scroll'));
      expect(loadSpy).toHaveBeenCalledTimes(2);
    });

    it('does not emit when not near the bottom', () => {
      createDirective();
      Object.defineProperty(host, 'scrollHeight', { configurable: true, value: 2000 });
      Object.defineProperty(host, 'clientHeight', { configurable: true, value: 400 });
      host.scrollTop = 0;
      host.dispatchEvent(new Event('scroll'));
      expect(loadSpy).not.toHaveBeenCalled();
    });
  });

  describe('mobile-only gating', () => {
    it('does not emit on a desktop viewport (>= 768px)', () => {
      setViewport(1200);
      createDirective();
      scrollNearBottom();
      host.dispatchEvent(new Event('scroll'));
      expect(loadSpy).not.toHaveBeenCalled();
    });

    it('emits again once the viewport is resized back to mobile', () => {
      setViewport(1200);
      createDirective();
      scrollNearBottom();
      host.dispatchEvent(new Event('scroll'));
      expect(loadSpy).not.toHaveBeenCalled();

      setViewport(375);
      host.dispatchEvent(new Event('scroll'));
      expect(loadSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('guards', () => {
    it('does not emit while a page is already loading', () => {
      createDirective();
      scrollNearBottom();
      directive.appInfiniteScrollLoading = true;
      host.dispatchEvent(new Event('scroll'));
      expect(loadSpy).not.toHaveBeenCalled();
    });

    it('emits again after loading finishes', () => {
      createDirective();
      scrollNearBottom();
      directive.appInfiniteScrollLoading = true;
      host.dispatchEvent(new Event('scroll'));
      directive.appInfiniteScrollLoading = false;
      host.dispatchEvent(new Event('scroll'));
      expect(loadSpy).toHaveBeenCalledTimes(1);
    });

    it('does not emit when there are no more pages (hasMore = false)', () => {
      createDirective();
      scrollNearBottom();
      directive.appInfiniteScrollHasMore = false;
      host.dispatchEvent(new Event('scroll'));
      expect(loadSpy).not.toHaveBeenCalled();
    });
  });

  describe('lifecycle', () => {
    it('does not attach when disabled', () => {
      createDirective(false);
      scrollNearBottom();
      host.dispatchEvent(new Event('scroll'));
      expect(loadSpy).not.toHaveBeenCalled();
    });

    it('reattaches when enabled at runtime via ngOnChanges', () => {
      createDirective(false);
      scrollNearBottom();
      host.dispatchEvent(new Event('scroll'));
      expect(loadSpy).not.toHaveBeenCalled();

      directive.appInfiniteScroll = true;
      directive.ngOnChanges({
        appInfiniteScroll: new SimpleChange(false, true, false),
      });
      host.dispatchEvent(new Event('scroll'));
      expect(loadSpy).toHaveBeenCalledTimes(1);
    });

    it('stops emitting after ngOnDestroy detaches the listener', () => {
      createDirective();
      scrollNearBottom();
      host.dispatchEvent(new Event('scroll'));
      expect(loadSpy).toHaveBeenCalledTimes(1);

      directive.ngOnDestroy();
      loadSpy.mockClear();
      host.dispatchEvent(new Event('scroll'));
      expect(loadSpy).not.toHaveBeenCalled();
    });
  });

  describe('scroll container resolution', () => {
    it('falls back to the document scroll element when no scrollable ancestor exists', () => {
      host = document.createElement('div'); // no overflow style → walk-up finds nothing
      directive = new InfiniteScrollDirective(new ElementRef<HTMLElement>(host), 'browser');
      loadSpy = vi.fn();
      directive.appInfiniteScrollLoad.subscribe(loadSpy);
      directive.ngAfterViewInit();

      // jsdom does not define scrollingElement, so the directive falls back
      // to document.documentElement — use the same resolution in the test.
      const scroller = (document.scrollingElement || document.documentElement) as HTMLElement;
      Object.defineProperty(scroller, 'scrollHeight', { configurable: true, value: 1000 });
      Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 400 });
      scroller.scrollTop = 850;
      scroller.dispatchEvent(new Event('scroll'));
      expect(loadSpy).toHaveBeenCalledTimes(1);
      directive.ngOnDestroy();
    });
  });
});
