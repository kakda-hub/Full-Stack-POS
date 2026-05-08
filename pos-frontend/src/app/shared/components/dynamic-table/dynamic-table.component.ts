import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  signal,
  computed,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { fadeIn, listAnimation } from '../../animations/animations';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageService } from '../../../core/services/language.service';

/** Column definition for DynamicTableComponent */
export interface TableColumn {
  /** Field key on the data item */
  key: string;
  /** English header label */
  label: string;
  /** Khmer header label (optional) */
  labelKm?: string;
  /** Cell type – controls how the cell is rendered */
  type?: 'text' | 'subtext' | 'image' | 'badge' | 'description';
  /** Secondary text field (shown beneath main text when type = 'subtext') */
  subKey?: string;
  /** Align cell content */
  align?: 'left' | 'center' | 'right';
  /** Hide the column on small screens */
  responsive?: 'md' | 'lg';
}

@Component({
  selector: 'app-dynamic-table',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss',
})
export class DynamicTableComponent implements OnChanges {
  /** Column definitions */
  @Input() columns: TableColumn[] = [];

  /** Full (unfiltered or pre-filtered) dataset – used for paginator length */
  @Input() totalCount = 0;

  /** Already-sliced page of rows to display */
  @Input() rows: any[] = [];

  /** Whether to show the skeleton loading state */
  @Input() isLoading = false;

  /** Current page index (0-based) */
  @Input() pageIndex = 0;

  /** Rows per page */
  @Input() pageSize = 10;

  /** Available page-size options */
  @Input() pageSizeOptions: number[] = [5, 10, 25, 100];

  /** Emitted when the user clicks the Edit button for a row */
  @Output() onEdit = new EventEmitter<any>();

  /** Emitted when the user clicks the Delete button for a row */
  @Output() onDelete = new EventEmitter<any>();

  /** Emitted when the paginator page changes */
  @Output() pageChange = new EventEmitter<PageEvent>();

  /** Skeleton row placeholders */
  readonly skeletonRows = [1, 2, 3, 4, 5];

  constructor(
    public theme: ThemeService,
    public lang: LanguageService,
  ) {}

  ngOnChanges(): void {}

  rowNumber(index: number): number {
    return this.pageIndex * this.pageSize + index + 1;
  }

  trackById(_: number, item: any): any {
    return item?.id ?? _;
  }

  onPageChange(page: number): void {
    this.pageChange.emit({
      pageIndex: page - 1,
      pageSize: this.pageSize,
      length: this.totalCount,
    });
  }

  onPageSizeChange(pageSize: number): void {
    this.pageChange.emit({
      pageIndex: 0,
      pageSize: pageSize,
      length: this.totalCount,
    });
  }

  /** Returns the label for a column in the active language */
  colLabel(col: TableColumn): string {
    return this.lang.currentLang() === 'km' && col.labelKm ? col.labelKm : col.label;
  }

  /** Extracts the primary display value from a row for a given column */
  cellValue(row: any, col: TableColumn): any {
    return row?.[col.key] ?? '-';
  }

  /** Extracts the secondary display value (subtext) */
  subValue(row: any, col: TableColumn): any {
    return col.subKey ? row?.[col.subKey] ?? '' : '';
  }
}
