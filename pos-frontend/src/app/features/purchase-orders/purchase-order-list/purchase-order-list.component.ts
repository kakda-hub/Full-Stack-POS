import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AlertService } from '../../../core/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { PurchaseOrderService } from '../../../core/services/api/purchase-order.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ReusableDialogService } from '../../../core/services/dialogs/reusable-dialog.service';
import { PurchaseOrderDetailComponent } from '../purchase-order-detail/purchase-order-detail.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';


@Component({
  selector: 'app-purchase-order-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation, pageTransition],
  templateUrl: './purchase-order-list.component.html',
  styleUrl: './purchase-order-list.component.scss',
})
export class PurchaseOrderListComponent implements OnInit, OnDestroy {
  isLoading = signal(true);
  editingPO: any | null = null;
  purchaseOrders = signal<any[]>([]);
  filteredPOs = signal<any[]>([]);

  // Pagination
  pageSize = signal(10);
  pageIndex = signal(0);
  paginatedPOs = computed(() => {
    const startIndex = this.pageIndex() * this.pageSize();
    return this.filteredPOs().slice(startIndex, startIndex + this.pageSize());
  });

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
        const query = q.toLowerCase().trim();
        if (!query) {
          this.filteredPOs.set(this.purchaseOrders());
        } else {
          this.filteredPOs.set(
            this.purchaseOrders().filter(
              (po) =>
                (po.orderNumber || '').toLowerCase().includes(query) ||
                (po.supplier?.name || '').toLowerCase().includes(query)
            )
          );
        }
        this.pageIndex.set(0);
      });
  }

  loadPOs() {
    this.isLoading.set(true);
    this.poService.getAll().subscribe((data: any) => {
      this.purchaseOrders.set(data);
      this.filteredPOs.set(data);
      this.isLoading.set(false);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(e: Event): void {
    this.searchSubject.next((e.target as HTMLInputElement).value);
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
          this.lang.currentLang() === 'km'
            ? `លេខបញ្ជាទិញ ${po.orderNumber} ត្រូវបានទទួលដោយជោគជ័យ`
            : `PO ${po.orderNumber} received successfully`,
          this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Success'
        );
        this.loadPOs();
      },
      error: (err) => {
        console.error('Failed to receive PO', err);
        this.alertService.error(
          this.lang.currentLang() === 'km'
            ? 'ការទទួលបញ្ជាទិញបរាជ័យ'
            : 'Failed to receive purchase order'
        );
      },
    });
  }

  cancelPO(po: any, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.lang.currentLang() === 'km' ? 'បញ្ជាក់ការបោះបង់' : 'Confirm Cancel',
        message:
          this.lang.currentLang() === 'km'
            ? `បោះបង់បញ្ជាទិញលេខ ${po.orderNumber} មែនទេ?`
            : `Cancel PO "${po.orderNumber}"?`,
        confirmLabel: this.lang.currentLang() === 'km' ? 'បោះបង់' : 'Cancel',
        cancelLabel: this.lang.currentLang() === 'km' ? 'ត្រលប់' : 'Back',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.poService.cancel(po.id).subscribe({
        next: () => {
          this.alertService.warning(
            this.lang.currentLang() === 'km'
              ? `បញ្ជាទិញលេខ ${po.orderNumber} ត្រូវបានបោះបង់`
              : `PO ${po.orderNumber} has been cancelled`,
            this.lang.currentLang() === 'km' ? 'បានបោះបង់' : 'Cancelled'
          );
          this.loadPOs();
        },
        error: (err) => {
          console.error('Failed to cancel PO', err);
          this.alertService.error(
            this.lang.currentLang() === 'km'
              ? 'ការបោះបង់បញ្ជាទិញបរាជ័យ'
              : 'Failed to cancel purchase order'
          );
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
      draft: 'Draft',
      ordered: 'Ordered',
      partially_received: 'Partial',
      received: 'Received',
      cancelled: 'Cancelled',
    };
    const kmLabels: Record<string, string> = {
      draft: 'ព្រាង',
      ordered: 'បានបញ្ជា',
      partially_received: 'ទទួលខ្លះ',
      received: 'បានទទួល',
      cancelled: 'បានបោះបង់',
    };
    return this.lang.currentLang() === 'km'
      ? kmLabels[status] || status
      : labels[status] || status;
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
        this.lang.currentLang() === 'km'
          ? `បញ្ជាទិញត្រូវបាន${isEdit ? 'កែប្រែ' : 'បន្ថែម'}ដោយជោគជ័យ`
          : `Purchase Order ${isEdit ? 'updated' : 'added'} successfully`,
        this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Success'
      );
      this.editingPO = null;
    });
  }
}
