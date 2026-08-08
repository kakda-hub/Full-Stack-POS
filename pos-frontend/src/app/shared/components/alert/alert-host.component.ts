import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AlertService } from '../../../services/shared/alert.service';

@Component({
  selector: 'app-alert-host',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert-host.component.html',
  styleUrl: './alert-host.component.scss',
})
export class AlertHostComponent {
  constructor(public alertService: AlertService) {}
  trackById(_: number, a: { id: string }) { return a.id; }
}
