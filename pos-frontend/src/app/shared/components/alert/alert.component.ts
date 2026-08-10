import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnInit, OnDestroy
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

export type AlertType = 'success' | 'error' | 'warning' | 'info';
export type AlertPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center' | 'inline';

export interface AlertConfig {
  type: AlertType;
  title?: string;
  message: string;
  duration?: number;       // ms, 0 = no auto-dismiss
  dismissible?: boolean;
  position?: AlertPosition;
  icon?: boolean;
}

const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(100%) scale(0.95)' }),
    animate('320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      style({ opacity: 1, transform: 'translateX(0) scale(1)' })
    ),
  ]),
  transition(':leave', [
    animate('200ms ease-in',
      style({ opacity: 0, transform: 'translateX(110%) scale(0.95)' })
    ),
  ]),
]);

const slideInTop = trigger('slideInTop', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-120%) scale(0.95)' }),
    animate('320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      style({ opacity: 1, transform: 'translateY(0) scale(1)' })
    ),
  ]),
  transition(':leave', [
    animate('200ms ease-in',
      style({ opacity: 0, transform: 'translateY(-120%) scale(0.95)' })
    ),
  ]),
]);

const fadeInScale = trigger('fadeInScale', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.96)' }),
    animate('250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      style({ opacity: 1, transform: 'scale(1)' })
    ),
  ]),
  transition(':leave', [
    animate('180ms ease-in',
      style({ opacity: 0, transform: 'scale(0.96)' })
    ),
  ]),
]);

@Component({
  selector: 'app-alert',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slideInRight, slideInTop, fadeInScale],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent implements OnInit, OnDestroy {
  @Input() type: AlertType = 'info';
  @Input() title?: string;
  @Input() message: string = '';
  @Input() duration: number = 4000;
  @Input() dismissible: boolean = true;
  @Input() position: AlertPosition = 'top-right';
  @Input() showIcon: boolean = true;

  @Output() dismissed = new EventEmitter<void>();

  visible = true;
  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    if (this.duration && this.duration > 0) {
      this.timer = setTimeout(() => this.dismiss(), this.duration);
    }
  }

  ngOnDestroy() {
    if (this.timer) clearTimeout(this.timer);
  }

  dismiss() {
    this.visible = false;
    setTimeout(() => this.dismissed.emit(), 220);
  }

  get wrapperClass(): Record<string, boolean> {
    return {
      [`alert-${this.type}`]: true,
      'alert-fixed': this.position !== 'inline',
      [`pos-${this.position}`]: this.position !== 'inline',
      'pos-inline': this.position === 'inline',
    };
  }

  get iconWrapClass(): string { return `icon-${this.type}`; }

  get progressClass(): string { return `progress-${this.type}`; }

  get titleClass(): string {
    const map: Record<AlertType, string> = {
      success: 'text-emerald-700 dark:text-emerald-300',
      error: 'text-red-700 dark:text-red-300',
      warning: 'text-amber-700 dark:text-amber-300',
      info: 'text-indigo-700 dark:text-indigo-300',
    };
    return map[this.type];
  }

  get messageClass(): string {
    const map: Record<AlertType, string> = {
      success: 'text-emerald-800 dark:text-emerald-200',
      error: 'text-red-800 dark:text-red-200',
      warning: 'text-amber-800 dark:text-amber-200',
      info: 'text-indigo-800 dark:text-indigo-200',
    };
    return map[this.type];
  }

  get dismissClass(): string {
    const map: Record<AlertType, string> = {
      success: 'text-emerald-600 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40',
      error: 'text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/40',
      warning: 'text-amber-600 hover:bg-amber-100/50 dark:hover:bg-amber-900/40',
      info: 'text-indigo-600 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40',
    };
    return map[this.type];
  }
}
