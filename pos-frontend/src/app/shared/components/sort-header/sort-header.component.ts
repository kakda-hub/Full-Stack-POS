import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

/**
 * Sortable table column header. Renders the label with a sort affordance and
 * emits `sort` with its field when clicked. The active column is highlighted.
 */
@Component({
  selector: 'app-sort-header',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sort-header.component.html',
  styleUrl: './sort-header.component.scss',
})
export class SortHeaderComponent {
  @Input() label = '';
  @Input() labelKm = '';
  /** The field this header sorts by (must be in the backend sort allowlist). */
  @Input() field = '';
  /** Currently active sortBy (managed by the parent). */
  @Input() sortBy = '';
  /** Currently active sort direction (managed by the parent). */
  @Input() sortDir: 'asc' | 'desc' = 'asc';

  @Output() sort = new EventEmitter<string>();

  constructor(public lang: LanguageService) {}

  get isActive(): boolean {
    return this.sortBy === this.field;
  }

  get activeDir(): 'asc' | 'desc' {
    return this.sortDir;
  }

  get displayLabel(): string {
    return this.lang.currentLang() === 'km' && this.labelKm ? this.labelKm : this.label;
  }

  onClick(): void {
    this.sort.emit(this.field);
  }
}
