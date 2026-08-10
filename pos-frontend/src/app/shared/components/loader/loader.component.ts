import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring' | 'fullscreen';

@Component({
  selector: 'app-loader',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
export class LoaderComponent {
  @Input() variant: LoaderVariant = 'spinner';
  @Input() size: LoaderSize = 'md';
  @Input() text?: string;
  @Input() subtext?: string;
  @Input() showLabel: boolean = false;
  @Input() color: string = 'indigo';

  get sizeClass(): string { return this.size; }

  get labelWrapClass(): string {
    return this.size === 'xs' || this.size === 'sm' ? 'flex-row' : 'flex-row';
  }

  get labelColorClass(): string {
    return 'text-slate-600 dark:text-slate-300';
  }
}
