import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-alert-host',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="alert-host-stack" aria-live="polite" aria-atomic="false">
      <app-alert
        *ngFor="let alert of alertService.alerts(); trackBy: trackById"
        [type]="alert.type"
        [title]="alert.title"
        [message]="alert.message"
        [duration]="alert.duration ?? 4000"
        [dismissible]="alert.dismissible ?? true"
        [showIcon]="alert.icon ?? true"
        position="inline"
        (dismissed)="alertService.dismiss(alert.id)"
      ></app-alert>
    </div>
  `,
  styles: [`
    .alert-host-stack {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      pointer-events: none;
      max-width: 420px;
      width: calc(100vw - 2.5rem);
    }
    .alert-host-stack > * {
      pointer-events: all;
    }
    @media (max-width: 480px) {
      .alert-host-stack {
        top: auto;
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
        max-width: 100%;
      }
    }
  `],
})
export class AlertHostComponent {
  constructor(public alertService: AlertService) {}
  trackById(_: number, a: { id: string }) { return a.id; }
}
