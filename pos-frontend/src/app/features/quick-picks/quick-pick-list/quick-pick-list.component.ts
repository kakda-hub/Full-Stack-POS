import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AlertService } from '../../../core/services/alert.service';
import { LanguageService } from '../../../core/services/language.service';
import { QuickPickService } from '../../../core/services/api/quick-pick.service';
import { QuickPickItem } from '../../../models';
import { ThemeService } from '../../../core/services/theme.service';
import { ReusableDialogService } from '../../../core/services/dialogs/reusable-dialog.service';
import { QuickPickDetailComponent } from '../quick-pick-detail/quick-pick-detail.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-quick-pick-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation, pageTransition],
  templateUrl: './quick-pick-list.component.html',
  styleUrl: './quick-pick-list.component.scss',
})
export class QuickPickListComponent implements OnInit, OnDestroy {
  isLoading = signal(true);
  editingItem: QuickPickItem | null = null;

  // Server-side pagination state
  items = signal<QuickPickItem[]>([]);
  totalItems = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  searchQuery = signal('');

  /** Alias so the template keeps rendering the current page. */
  paginatedItems = computed(() => this.items());

  /** Monotonic token that invalidates in-flight requests (stale-response guard). */
  private loadSeq = 0;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private defaultOption: MatDialogConfig = {
    panelClass: 'medium-dialog',
    disableClose: true,
  };

  constructor(
    public quickPickService: QuickPickService,
    public lang: LanguageService,
    private reusableDialogService: ReusableDialogService,
    private dialog: MatDialog,
    public theme: ThemeService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
  ) {
    this.reusableDialogService.setDialogComponent(QuickPickDetailComponent);
    this.reusableDialogService.setDialogConfigOption(this.defaultOption);
  }

  ngOnInit(): void {
    this.loadItems();

    this.searchSubject.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.searchQuery.set(q.trim());
        this.pageIndex.set(0); // Reset to first page on search
        this.loadItems();
      });
  }

  /** Loads one server-side page using the standard list query params. */
  loadItems(): void {
    this.isLoading.set(true);
    const seq = ++this.loadSeq;
    this.quickPickService.getPage({
      search: this.searchQuery() || undefined,
      sortBy: 'sortOrder',
      sort: 'asc',
      offset: this.pageIndex() * this.pageSize(),
      max: this.pageSize(),
    }).subscribe({
      next: (res) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        const data = res?.data ?? [];
        // After a delete, the current page may be empty — step back one page.
        if (data.length === 0 && this.pageIndex() > 0) {
          this.pageIndex.update(p => p - 1);
          this.loadItems();
          return;
        }
        this.items.set(data);
        this.totalItems.set(res?.total ?? data.length);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        console.error('Failed to load quick pick items', err);
        this.items.set([]);
        this.totalItems.set(0);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(e: Event): void {
    this.searchSubject.next((e.target as HTMLInputElement).value);
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page - 1);
    this.loadItems();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(0); // changing page size resets the offset to 0
    this.loadItems();
  }

  openEdit(item: QuickPickItem): void {
    this.editingItem = item;
    this.openDialog();
  }

  deleteItem(item: QuickPickItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.lang.currentLang() === 'km' ? 'បញ្ជាក់ការលុប' : 'Confirm Delete',
        message:
          this.lang.currentLang() === 'km'
            ? `លុបទំនិញរហ័ស \"${item.label}\" មែនទេ?`
            : `Delete quick pick \"${item.label}\"?`,
        confirmLabel: this.lang.currentLang() === 'km' ? 'លុប' : 'Delete',
        cancelLabel: this.lang.currentLang() === 'km' ? 'បោះបង់' : 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.quickPickService.delete(item.id).subscribe({
        next: () => {
          this.alertService.warning(
            this.lang.currentLang() === 'km'
              ? `\"${item.label}\" ត្រូវបានលុបចោល`
              : `\"${item.label}\" has been deleted`,
            this.lang.currentLang() === 'km' ? 'បានលុប' : 'Deleted'
          );
          this.loadItems();
        },
        error: (err) => {
          console.error('Failed to delete quick pick', err);
          this.alertService.error(
            this.lang.currentLang() === 'km'
              ? 'ការលុបបរាជ័យ'
              : 'Failed to delete item'
          );
        },
      });
    });
  }

  trackById(_: number, item: QuickPickItem): number {
    return item.id;
  }

  openDialog(): void {
    const dialogRef = this.reusableDialogService.open(
      this.editingItem ? { quickPick: this.editingItem } : undefined
    );
    dialogRef.subscribe((result) => {
      if (!result) {
        this.editingItem = null;
        return;
      }
      this.loadItems();
      const isEdit = !!this.editingItem;
      this.alertService.success(
        this.lang.currentLang() === 'km'
          ? `ទំនិញរហ័សត្រូវបាន${isEdit ? 'កែប្រែ' : 'បន្ថែម'}ដោយជោគជ័យ`
          : `Quick pick ${isEdit ? 'updated' : 'added'} successfully`,
        this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Success'
      );
      this.editingItem = null;
    });
  }
}
