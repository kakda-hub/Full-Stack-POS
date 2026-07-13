import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AlertService } from '../../../core/services/alert.service';
import { LanguageService } from '../../../core/services/language.service';
import { SupplierService } from '../../../core/services/api/supplier.service';
import { ThemeService } from '../../../core/services/theme.service';
import { PageEvent } from '@angular/material/paginator';
import { TableColumn } from '../../../shared/components/dynamic-table/dynamic-table.component';
import { ReusableDialogService } from '../../../core/services/dialogs/reusable-dialog.service';
import { SupplierDetailComponent } from '../supplier-detail/supplier-detail.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-supplier-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation, pageTransition],
  templateUrl: './supplier-list.component.html',
})
export class SupplierListComponent implements OnInit, OnDestroy {
  isLoading = signal(true);
  editingSupplier: any | null = null;
  suppliers = signal<any[]>([]);
  filteredSuppliers = signal<any[]>([]);

  /** Column definitions passed to DynamicTableComponent */
  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Name', labelKm: 'ឈ្មោះ' },
    { key: 'contactPerson', label: 'Contact Person', labelKm: 'អ្នកទំនាក់ទំនង', responsive: 'md' },
    { key: 'phone', label: 'Phone', labelKm: 'ទូរស័ព្ទ', responsive: 'md' },
    { key: 'email', label: 'Email', labelKm: 'អ៊ីមែល', responsive: 'lg' },
  ];

  // Pagination
  pageSize = signal(10);
  pageIndex = signal(0);
  paginatedSuppliers = computed(() => {
    const startIndex = this.pageIndex() * this.pageSize();
    return this.filteredSuppliers().slice(startIndex, startIndex + this.pageSize());
  });

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private defaultOption: MatDialogConfig = {
    panelClass: 'medium-dialog',
    disableClose: true,
  };

  constructor(
    public supplierService: SupplierService,
    public lang: LanguageService,
    private reusableDialogService: ReusableDialogService,
    private dialog: MatDialog,
    public theme: ThemeService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
  ) {
    this.reusableDialogService.setDialogComponent(SupplierDetailComponent);
    this.reusableDialogService.setDialogConfigOption(this.defaultOption);
  }

  ngOnInit(): void {
    this.loadSuppliers();

    this.searchSubject.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe((q) => {
        const query = q.toLowerCase().trim();
        if (!query) {
          this.filteredSuppliers.set(this.suppliers());
        } else {
          this.filteredSuppliers.set(
            this.suppliers().filter(
              (s) =>
                (s.name || '').toLowerCase().includes(query) ||
                (s.contactPerson || '').toLowerCase().includes(query) ||
                (s.phone || '').includes(query) ||
                (s.email || '').toLowerCase().includes(query)
            )
          );
        }
        this.pageIndex.set(0);
      });
  }

  loadSuppliers() {
    this.isLoading.set(true);
    this.supplierService.list().subscribe((res: any) => {
      const data = res.data || [];
      this.suppliers.set(data);
      this.filteredSuppliers.set(data);
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

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  openEdit(s: any): void {
    this.editingSupplier = s;
    this.openDialog();
  }

  deleteSupplier(s: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.lang.currentLang() === 'km' ? 'បញ្ជាក់ការលុប' : 'Confirm Delete',
        message:
          this.lang.currentLang() === 'km'
            ? `លុបអ្នកផ្គត់ផ្គង់ "${s.name}" មែនទេ?`
            : `Delete supplier "${s.name}"?`,
        confirmLabel: this.lang.currentLang() === 'km' ? 'លុប' : 'Delete',
        cancelLabel: this.lang.currentLang() === 'km' ? 'បោះបង់' : 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.supplierService.delete(s.id).subscribe({
        next: () => {
          this.alertService.warning(
            this.lang.currentLang() === 'km'
              ? `អ្នកផ្គត់ផ្គង់ "${s.name}" ត្រូវបានលុបចោល`
              : `Supplier "${s.name}" has been deleted`,
            this.lang.currentLang() === 'km' ? 'បានលុប' : 'Deleted'
          );
          this.loadSuppliers();
        },
        error: (err) => {
          console.error('Failed to delete supplier', err);
          this.alertService.error(
            this.lang.currentLang() === 'km'
              ? 'ការលុបអ្នកផ្គត់ផ្គង់បរាជ័យ'
              : 'Failed to delete supplier'
          );
        },
      });
    });
  }

  trackById(_: number, s: any): string {
    return s.id;
  }

  openDialog() {
    const dialogRef = this.reusableDialogService.open(
      this.editingSupplier ? { supplier: this.editingSupplier } : undefined
    );
    dialogRef.subscribe((result) => {
      if (!result) {
        this.editingSupplier = null;
        return;
      }
      this.loadSuppliers();
      const isEdit = !!this.editingSupplier;
      this.alertService.success(
        this.lang.currentLang() === 'km'
          ? `អ្នកផ្គត់ផ្គង់ត្រូវបាន${isEdit ? 'កែប្រែ' : 'បន្ថែម'}ដោយជោគជ័យ`
          : `Supplier ${isEdit ? 'updated' : 'added'} successfully`,
        this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Success'
      );
      this.editingSupplier = null;
    });
  }
}
