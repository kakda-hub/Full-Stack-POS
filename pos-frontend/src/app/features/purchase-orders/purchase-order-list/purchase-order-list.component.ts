import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { fadeIn, listAnimation } from '../../../shared/animations/animations';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AlertService } from '../../../services/shared/alert.service';
import { AuthService } from '../../../services/shared/auth.service';
import { LanguageService } from '../../../services/shared/language.service';
import { nextSort, SortDirection } from '../../../shared/helpers/sort.helper';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { ReusableDialogService } from '../../../services/dialogs/reusable-dialog.service';
import { PurchaseOrderDetailComponent } from '../purchase-order-detail/purchase-order-detail.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';


@Component({
  selector: 'app-purchase-order-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation],
  templateUrl: './purchase-order-list.component.html',
  styleUrl: './purchase-order-list.component.scss',
})
export class PurchaseOrderListComponent implements OnInit, OnDestroy {
  isLoading = signal(true);
  editingPO: any | null = null;

  // Server-side pagination state
  purchaseOrders = signal<any[]>([]);
  totalItems = signal(0);
  pageSize = signal(10);
  pageSizeOptions = [10, 25, 50, 100];
  pageIndex = signal(0);
  searchQuery = signal('');

  // Server-side sorting (fields must be in the backend sort allowlist)
  sortBy = signal('createdAt');
  sortDir = signal<SortDirection>('desc');

  /** Monotonic token that invalidates in-flight requests (stale-response guard). */
  private loadSeq = 0;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private defaultOption: MatDialogConfig = {
    panelClass: 'large-dialog',
    disableClose: true,
  };

  constructor(
    public poService: PurchaseOrderService,
    public lang: LanguageService,
    private authService: AuthService,
    private reusableDialogService: ReusableDialogService,
    private dialog: MatDialog,
    public theme: ThemeService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
  ) {
    this.reusableDialogService.setDialogComponent(PurchaseOrderDetailComponent);
    this.reusableDialogService.setDialogConfigOption(this.defaultOption);
  }

  ngOnInit(): void {
    this.loadPOs();

    this.searchSubject.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.searchQuery.set(q);
        this.pageIndex.set(0); // Reset to first page on search
        this.loadPOs();
      });
  }

  /** Loads one server-side page using the standard list query params. */
  loadPOs() {
    this.isLoading.set(true);
    const seq = ++this.loadSeq;
    this.poService.getAll({
      search: this.searchQuery() || undefined,
      sortBy: this.sortBy(),
      sort: this.sortDir(),
      offset: this.pageIndex() * this.pageSize(),
      max: this.pageSize(),
    }).subscribe({
      next: (res: any) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        const data = res?.data ?? [];
        // After a delete, the current page may be empty — step back one page.
        if (data.length === 0 && this.pageIndex() > 0) {
          this.pageIndex.update(p => p - 1);
          this.loadPOs();
          return;
        }
        this.purchaseOrders.set(data);
        this.totalItems.set(res?.total ?? data.length);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        console.error('Failed to load purchase orders', err);
        this.purchaseOrders.set([]);
        this.totalItems.set(0);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  /** Column header click: toggle asc/desc on the active column, else start asc. */
  onSort(field: string): void {
    // Date/total default to descending first (newest / highest first).
    const next = nextSort(this.sortBy(), this.sortDir(), field, ['createdAt', 'total']);
    this.sortBy.set(next.sortBy);
    this.sortDir.set(next.sort);
    this.pageIndex.set(0);
    this.loadPOs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(query: string): void {
    this.searchSubject.next(query);
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page - 1);
    this.loadPOs();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(0); // changing page size resets the offset to 0
    this.loadPOs();
  }

  onAdd(): void {
    this.editingPO = null;
    this.openDialog();
  }

  openView(po: any): void {
    this.editingPO = po;
    this.openDialog();
  }

  receivePO(po: any, event: Event): void {
    event.stopPropagation();
    const userId = Number(this.authService.currentUser()?.id) || 0;

    this.poService.receive(po.id, { receivedBy: userId }).subscribe({
      next: () => {
        this.alertService.success(
          this.lang.t('purchaseOrders.receivedSuccess', { number: po.orderNumber }),
          this.lang.t('confirm.success')
        );
        this.loadPOs();
      },
      error: (err) => {
        console.error('Failed to receive PO', err);
        this.alertService.error(this.lang.t('purchaseOrders.receiveFailed'));
      },
    });
  }

  cancelPO(po: any, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.lang.t('purchaseOrders.confirmCancelTitle'),
        message: this.lang.t('purchaseOrders.confirmCancelMessage', { number: po.orderNumber }),
        confirmLabel: this.lang.t('purchaseOrders.cancel'),
        cancelLabel: this.lang.t('button.back'),
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.poService.cancel(po.id).subscribe({
        next: () => {
          this.alertService.warning(
            this.lang.t('purchaseOrders.cancelled', { number: po.orderNumber }),
            this.lang.t('purchaseOrders.cancelledTitle')
          );
          this.loadPOs();
        },
        error: (err) => {
          console.error('Failed to cancel PO', err);
          this.alertService.error(this.lang.t('purchaseOrders.cancelFailed'));
        },
      });
    });
  }

  /** Returns CSS class based on PO status */
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      draft: 'status-badge--draft',
      ordered: 'status-badge--ordered',
      partially_received: 'status-badge--partial',
      received: 'status-badge--received',
      cancelled: 'status-badge--cancelled',
    };
    return map[status] || 'status-badge--draft';
  }

  /** Returns translated label for PO status */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'purchaseOrders.statusDraft',
      ordered: 'purchaseOrders.statusOrdered',
      partially_received: 'purchaseOrders.statusPartial',
      received: 'purchaseOrders.statusReceived',
      cancelled: 'purchaseOrders.statusCancelled',
    };
    const key = labels[status] || '';
    return key ? this.lang.t(key) : status;
  }

  /** Whether the given PO can be received */
  canReceive(status: string): boolean {
    return status === 'ordered' || status === 'partially_received';
  }

  /** Whether the given PO can be cancelled */
  canCancel(status: string): boolean {
    return status === 'draft' || status === 'ordered' || status === 'partially_received';
  }

  trackById(_: number, po: any): string {
    return po.id;
  }

  openDialog() {
    const dialogRef = this.reusableDialogService.open(
      this.editingPO ? { purchaseOrder: this.editingPO } : undefined
    );
    dialogRef.subscribe((result) => {
      if (!result) {
        this.editingPO = null;
        return;
      }
      this.loadPOs();
      const isEdit = !!this.editingPO;
      this.alertService.success(
        this.lang.t('purchaseOrders.saved', {
          action: this.lang.t(isEdit ? 'confirm.actionUpdated' : 'confirm.actionAdded'),
        }),
        this.lang.t('confirm.success')
      );
      this.editingPO = null;
    });
  }
}
