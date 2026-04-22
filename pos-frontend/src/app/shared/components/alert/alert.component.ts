import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnInit, OnDestroy
} from '@angular/core';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';

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
  template: `
    <div *ngIf="visible"
      [@slideInRight]="position === 'top-right' || position === 'bottom-right'"
      [@slideInTop]="position === 'top-center' || position === 'top-left'"
      [@fadeInScale]="position === 'inline'"
      class="alert-wrap"
      [ngClass]="wrapperClass"
      role="alert"
    >
      <!-- Progress bar for timed alerts -->
      <div *ngIf="duration && duration > 0" class="progress-bar" [ngClass]="progressClass"
        [style.animation-duration]="duration + 'ms'"></div>

      <div class="flex items-start gap-3 p-4">
        <!-- Icon -->
        <div *ngIf="showIcon" class="icon-wrap flex-shrink-0 mt-0.5" [ngClass]="iconWrapClass">
          <!-- Success -->
          <svg *ngIf="type === 'success'" class="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
          </svg>
          <!-- Error -->
          <svg *ngIf="type === 'error'" class="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
          </svg>
          <!-- Warning -->
          <svg *ngIf="type === 'warning'" class="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
          </svg>
          <!-- Info -->
          <svg *ngIf="type === 'info'" class="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"/>
          </svg>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p *ngIf="title" class="text-sm font-bold leading-tight mb-0.5" [ngClass]="titleClass">
            {{ title }}
          </p>
          <p class="text-sm leading-relaxed" [ngClass]="messageClass">{{ message }}</p>
        </div>

        <!-- Dismiss button -->
        <button *ngIf="dismissible" (click)="dismiss()"
          class="flex-shrink-0 ml-1 p-1 rounded-lg transition-all opacity-60 hover:opacity-100"
          [ngClass]="dismissClass">
          <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M1 1l12 12M13 1L1 13"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .alert-wrap {
      position: relative;
      overflow: hidden;
      border-radius: 14px;
      border-width: 1px;
      box-shadow: 0 4px 24px -4px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.06) inset;
      backdrop-filter: blur(12px);
      min-width: 280px;
      max-width: 420px;
    }

    /* ---- Success ---- */
    .alert-success {
      background: linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%);
      border-color: rgba(16,185,129,0.35);
    }
    .dark .alert-success {
      background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.10) 100%);
      border-color: rgba(16,185,129,0.30);
    }

    /* ---- Error ---- */
    .alert-error {
      background: linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(220,38,38,0.07) 100%);
      border-color: rgba(239,68,68,0.35);
    }
    .dark .alert-error {
      background: linear-gradient(135deg, rgba(239,68,68,0.14) 0%, rgba(220,38,38,0.10) 100%);
      border-color: rgba(239,68,68,0.30);
    }

    /* ---- Warning ---- */
    .alert-warning {
      background: linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(217,119,6,0.07) 100%);
      border-color: rgba(245,158,11,0.35);
    }
    .dark .alert-warning {
      background: linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(217,119,6,0.10) 100%);
      border-color: rgba(245,158,11,0.28);
    }

    /* ---- Info ---- */
    .alert-info {
      background: linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(79,70,229,0.07) 100%);
      border-color: rgba(99,102,241,0.35);
    }
    .dark .alert-info {
      background: linear-gradient(135deg, rgba(99,102,241,0.16) 0%, rgba(79,70,229,0.12) 100%);
      border-color: rgba(99,102,241,0.30);
    }

    /* progress bar */
    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 100%;
      transform-origin: left;
      animation: shrink linear forwards;
      border-radius: 0 0 14px 14px;
    }
    @keyframes shrink {
      from { transform: scaleX(1); }
      to   { transform: scaleX(0); }
    }
    .progress-success { background: linear-gradient(90deg, #10b981, #34d399); }
    .progress-error   { background: linear-gradient(90deg, #ef4444, #f87171); }
    .progress-warning { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .progress-info    { background: linear-gradient(90deg, #6366f1, #818cf8); }

    /* icon wrap */
    .icon-success { color: #10b981; }
    .icon-error   { color: #ef4444; }
    .icon-warning { color: #f59e0b; }
    .icon-info    { color: #6366f1; }

    /* positioned variants */
    .alert-fixed {
      position: fixed;
      z-index: 9999;
    }
    .pos-top-right    { top: 1.25rem; right: 1.25rem; }
    .pos-top-left     { top: 1.25rem; left: 1.25rem; }
    .pos-top-center   { top: 1.25rem; left: 50%; transform: translateX(-50%); }
    .pos-bottom-right { bottom: 1.25rem; right: 1.25rem; }
    .pos-bottom-left  { bottom: 1.25rem; left: 1.25rem; }
    .pos-bottom-center{ bottom: 1.25rem; left: 50%; transform: translateX(-50%); }
    .pos-inline       { position: relative; width: 100%; max-width: 100%; }
  `],
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
