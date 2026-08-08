import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ThemeService } from '../../../services/shared/theme.service';

export type SkeletonVariant =
  | 'text'
  | 'circle'
  | 'rect'
  | 'product-card'
  | 'table-row'
  | 'kpi-card'
  | 'user-card'
  | 'list-item'
  | 'receipt';

@Component({
  selector: 'app-skeleton',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
})
export class SkeletonComponent {
  @Input() variant: SkeletonVariant = 'text';
  @Input() width?: string;
  @Input() height?: string;
  @Input() size?: string;
  @Input() count: number = 1;

  constructor(public theme: ThemeService) {}

  get darkClass(): string {
    return this.theme.isDark() ? 'skeleton-dark' : '';
  }
}
