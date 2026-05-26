import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostBinding } from '@angular/core';

type ButtonVariant = 'primary' | 'success' | 'danger' | 'secondary' | 'ghost' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
type ButtonShape = 'solid' | 'soft' | 'outline';

@Component({
  selector: 'app-ui-button',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-button.component.html',
  styleUrl: './ui-button.component.scss',
})
export class UiButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() shape: ButtonShape = 'solid';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @HostBinding('class.full-width') get isFullWidth() {
    return this.fullWidth;
  }

  @Output() onClick = new EventEmitter<MouseEvent>();
}

/* 
Implement style of button UI
- Buttons colors
- Soft buttons
- Outline buttons
- Dark mode button styles
*/