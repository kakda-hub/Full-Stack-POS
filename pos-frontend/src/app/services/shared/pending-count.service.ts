import { Injectable, signal, DestroyRef, inject } from '@angular/core';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PurchaseOrderService } from '../purchase-order.service';

@Injectable({
  providedIn: 'root',
})
export class PendingCountService {
  /** Shared signal — any component can read it for the latest cached count */
  readonly count = signal(0);

  private destroyRef = inject(DestroyRef);

  constructor(private poService: PurchaseOrderService) {
    this.startPolling();
  }

  /** Kick off the initial fetch and the 30-second polling interval */
  private startPolling(): void {
    this.refresh();
    interval(30_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refresh());
  }

  /** Manually trigger a refresh (e.g., after receiving/cancelling a PO) */
  refresh(): void {
    this.poService.getPendingCount().subscribe({
      next: (count: any) => this.count.set(count),
      error: () => this.count.set(0),
    });
  }
}
