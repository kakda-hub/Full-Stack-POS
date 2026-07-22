import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AlertService } from '../../../core/services/alert.service';
import { LanguageService } from '../../../core/services/language.service';
import { QuickPickService } from '../../../core/services/api/quick-pick.service';
import { QuickPickItem } from '../../../core/models';
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
  items = signal<QuickPickItem[]>([]);
  filteredItems = signal<QuickPickItem[]>([]);

  // Pagination
  pageSize = signal(10);
  pageIndex = signal(0);
  paginatedItems = computed(() => {
    const startIndex = this.pageIndex() * this.pageSize();
    return this.filteredItems().slice(startIndex, startIndex + this.pageSize());
  });

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
        const query = q.toLowerCase().trim();
        if (!query) {
          this.filteredItems.set(this.items());
        } else {
          this.filteredItems.set(
            this.items().filter(
              (i) =>
                (i.label || '').toLowerCase().includes(query) ||
                (i.labelKh || '').toLowerCase().includes(query) ||
                String(i.price).includes(query)
            )
          );
        }
        this.pageIndex.set(0);
      });
  }

  loadItems(): void {
    this.isLoading.set(true);
    this.quickPickService.getAll().subscribe((res: any) => {
      const data = Array.isArray(res) ? res : res?.data ?? res ?? [];
      this.items.set(data);
      this.filteredItems.set(data);
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

  onPageChange(page: number): void {
    this.pageIndex.set(page - 1);
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
