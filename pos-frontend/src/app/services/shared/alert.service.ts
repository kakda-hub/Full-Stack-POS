import { Injectable, signal } from '@angular/core';
import { AlertConfig, AlertType } from '../../shared/components/alert/alert.component';

export interface ActiveAlert extends AlertConfig {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private _alerts = signal<ActiveAlert[]>([]);
  alerts = this._alerts.asReadonly();

  show(config: AlertConfig): string {
    const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this._alerts.update(list => [...list, { ...config, id }]);
    return id;
  }

  success(message: string, title?: string, duration = 4000) {
    return this.show({ type: 'success', message, title, duration, position: 'top-right', dismissible: true });
  }

  error(message: string, title?: string, duration = 6000) {
    return this.show({ type: 'error', message, title, duration, position: 'top-right', dismissible: true });
  }

  warning(message: string, title?: string, duration = 5000) {
    return this.show({ type: 'warning', message, title, duration, position: 'top-right', dismissible: true });
  }

  info(message: string, title?: string, duration = 4000) {
    return this.show({ type: 'info', message, title, duration, position: 'top-right', dismissible: true });
  }

  dismiss(id: string) {
    this._alerts.update(list => list.filter(a => a.id !== id));
  }

  clear() {
    this._alerts.set([]);
  }
}
