import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

/**
 * Reusable search input.
 *
 * Emits the raw query string on every keystroke via `search` so parents keep
 * their own debounce logic. For a controlled value (e.g. when a clear button
 * must reflect the applied query), bind `[value]` and listen to `cleared`.
 *
 * Usage:
 *   <app-search-input
 *     placeholder="products.search"
 *     [value]="searchQuery()"
 *     [showClear]="true"
 *     (search)="onSearch($event)"
 *     (cleared)="clearSearch()"
 *   ></app-search-input>
 */
@Component({
  selector: 'app-search-input',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
})
export class SearchInputComponent implements OnChanges {
  /** Translation key (or plain text) shown inside the field. */
  @Input() placeholder = 'common.search';
  /** Translation key (or plain text) used for the input aria-label. */
  @Input() ariaLabel = 'common.search';
  /** Controlled value — bind the applied query to show/clear it. */
  @Input() value = '';
  /** Show the × clear button once the field has text. */
  @Input() showClear = false;
  /** Visual size — `lg` for prominent search bars (e.g. POS). */
  @Input() size: 'md' | 'lg' = 'md';

  /** Emits the raw query on every keystroke. */
  @Output() search = new EventEmitter<string>();
  /** Emitted when the clear button is clicked. */
  @Output() cleared = new EventEmitter<void>();
  /** Emitted on Enter keydown (e.g. barcode scan in POS). */
  @Output() enter = new EventEmitter<Event>();

  @ViewChild('inputEl') private inputEl?: ElementRef<HTMLInputElement>;

  currentValue = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.currentValue = this.value || '';
    }
  }

  onInput(event: Event): void {
    this.currentValue = (event.target as HTMLInputElement).value;
    this.search.emit(this.currentValue);
  }

  onClear(): void {
    this.currentValue = '';
    this.cleared.emit();
    this.focus();
  }

  onEnter(event: Event): void {
    this.enter.emit(event);
  }

  /** Programmatically focus the underlying input (e.g. keyboard shortcuts). */
  focus(): void {
    this.inputEl?.nativeElement.focus();
  }
}
