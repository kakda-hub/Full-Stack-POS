import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Mobile-only infinite scroll.
 *
 * Attaches a passive scroll listener to the nearest scrollable ancestor (e.g.
 * the admin layout `.main-content` container) and emits `appInfiniteScrollLoad`
 * when the user scrolls near the bottom — but only on a mobile-width viewport
 * (`< 768px`), so desktop tables/paginators are never affected.
 *
 * Usage:
 * ```html
 * <div
 *   appInfiniteScroll
 *   [appInfiniteScrollHasMore]="hasMore()"
 *   [appInfiniteScrollLoading]="isLoadingMore()"
 *   (appInfiniteScrollLoad)="loadMore()"
 * >
 * ```
 */
@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true,
})
export class InfiniteScrollDirective implements AfterViewInit, OnChanges, OnDestroy {
  /** Whether infinite scroll is active for this element. */
  @Input() appInfiniteScroll = true;

  /** Whether more pages exist — no event is emitted when false. */
  @Input() appInfiniteScrollHasMore = true;

  /** Whether the next page is already being fetched — no event while true. */
  @Input() appInfiniteScrollLoading = false;

  /** Distance (px) from the bottom of the scroll container that counts as "near". */
  @Input() appInfiniteScrollThreshold = 250;

  /** Emitted when the user scrolls near the bottom (mobile viewport only). */
  @Output() appInfiniteScrollLoad = new EventEmitter<void>();

  /** The scroll container the listener is attached to. */
  private scrollContainer: HTMLElement | null = null;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngAfterViewInit(): void {
    if (this.appInfiniteScroll && isPlatformBrowser(this.platformId)) {
      this.attach();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appInfiniteScroll'] && isPlatformBrowser(this.platformId)) {
      if (this.appInfiniteScroll) {
        this.attach();
      } else {
        this.detach();
      }
    }
  }

  ngOnDestroy(): void {
    this.detach();
  }

  /** Attaches the scroll listener to the nearest scrollable ancestor. */
  private attach(): void {
    if (this.scrollContainer) return;
    let el: HTMLElement | null = this.elementRef.nativeElement as HTMLElement;
    while (el) {
      const overflowY = getComputedStyle(el).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
        this.scrollContainer = el;
        break;
      }
      el = el.parentElement;
    }
    if (!this.scrollContainer) {
      // `scrollingElement` is undefined in some environments (e.g. jsdom) —
      // fall back to the document element so the listener always has a target.
      this.scrollContainer = (document.scrollingElement || document.documentElement) as HTMLElement;
    }
    this.scrollContainer.addEventListener('scroll', this.onScroll, { passive: true });
  }

  private detach(): void {
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.onScroll);
      this.scrollContainer = null;
    }
  }

  private onScroll = (): void => {
    // Infinite scroll applies to the mobile card layout only.
    if (window.innerWidth >= 768) return;
    const el = this.scrollContainer;
    if (!el) return;
    // Let the consumer load one page at a time — no duplicate or trailing requests.
    if (this.appInfiniteScrollLoading || !this.appInfiniteScrollHasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - this.appInfiniteScrollThreshold) {
      this.appInfiniteScrollLoad.emit();
    }
  };
}
