import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'success' | 'danger' | 'secondary' | 'ghost' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-ui-button',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="getClasses()"
      (click)="onClick.emit($event)"
    >
      <span *ngIf="loading" class="animate-spin mr-2 inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
      <ng-content></ng-content>
    </button>
  `,
})
export class UiButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() onClick = new EventEmitter<MouseEvent>();

  getClasses(): string {
    const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none cursor-pointer';
    const disabled = 'disabled:opacity-50 disabled:cursor-not-allowed';
    const width = this.fullWidth ? 'w-full' : '';

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
      xl: 'px-8 py-4 text-lg gap-3',
    };

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white focus:ring-indigo-500 shadow-sm hover:shadow-md',
      success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white focus:ring-emerald-500 shadow-sm hover:shadow-md',
      danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white focus:ring-rose-500 shadow-sm hover:shadow-md',
      secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 focus:ring-slate-400',
      ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 focus:ring-slate-400',
      warning: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white focus:ring-amber-400 shadow-sm hover:shadow-md',
    };

    return [base, disabled, width, sizes[this.size], variants[this.variant]].filter(Boolean).join(' ');
  }
}
