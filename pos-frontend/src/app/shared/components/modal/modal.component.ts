import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { modalAnimation, backdropAnimation } from '../../animations/animations';

@Component({
  selector: 'app-modal',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showClose = true;
  @Input() closeOnBackdrop = true;
  @Output() close = new EventEmitter<void>();

  get sizeClass(): string {
    return { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }[this.size];
  }
}
