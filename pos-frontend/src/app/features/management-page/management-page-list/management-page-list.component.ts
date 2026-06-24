import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef, signal } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ManagementPage, ManagementPageService } from '../../../services/management-page.service';
import { ManagementPageDetailComponent } from '../management-page-detail/management-page-detail.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-management-page-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation, pageTransition],
  templateUrl: './management-page-list.component.html',
})
export class ManagementPageListComponent implements OnInit, OnDestroy {
  
  managementPageList: any[] = [];
  filteredPageList: any[] = [];
  searchQuery = signal('');

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private managementPageService: ManagementPageService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    public lang: LanguageService,
    public theme: ThemeService,
  ) { }

  ngOnInit(): void {
    this.getManagementPage();
    this.checkDialogQueryParams();

    this.searchSubject.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe(q => {
        this.searchQuery.set(q);
        const query = q.toLowerCase().trim();
        if (!query) {
          this.filteredPageList = this.managementPageList;
        } else {
          this.filteredPageList = this.filterTree(this.managementPageList, (node) =>
            (node.title || '').toLowerCase().includes(query) ||
            (node.titleKm || '').toLowerCase().includes(query) ||
            (node.url || '').toLowerCase().includes(query)
          );
        }
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

  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.searchSubject.next('');
    input.focus();
  }

  /**
   * Recursively filter tree nodes while preserving parent-child hierarchy.
   * A parent is included if a match is found in any descendant.
   */
  private filterTree(nodes: any[], predicate: (node: any) => boolean): any[] {
    return nodes.reduce((acc: any[], node: any) => {
      const matches = predicate(node);
      const filteredChildren = node.children ? this.filterTree(node.children, predicate) : [];

      if (matches || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren,
          expanded: !matches, // auto-expand parents on search match
        });
      }
      return acc;
    }, []);
  }

  private getManagementPage() {
    this.managementPageService.list().subscribe(res => {
      this.managementPageList = res.data;
      this.filteredPageList = res.data;
      this.cdr.markForCheck();
    });
  }

  toggleNode(node: any) {
    if (node.type === 'menu' || (node.children && node.children.length > 0)) {
      node.expanded = !node.expanded;
    }
  }

  selectNode(node: any) {
    node.selected = !node.selected;
  }

  private checkDialogQueryParams(): void {
    const params = this.route.snapshot.queryParams;
    const path = params['path'];

    if (path === 'add') {
      this.openAddDialog();
    } else if (path === 'edit' && params['id']) {
      const id = +params['id'];
      this.managementPageService.get(id).subscribe({
        next: (res) => this.openEditDialog(res.data),
        error: () => this.clearDialogQueryParams(),
      });
    }
  }

  navigateToDialog(id?: number): void {
    const queryParams: Params = id ? { path: 'edit', id } : { path: 'add' };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  private clearDialogQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { path: null, id: null },
      queryParamsHandling: 'merge',
    });
  }

  private openAddDialog(): void {
    const dialogRef = this.dialog.open(ManagementPageDetailComponent, {
      width: '600px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      this.clearDialogQueryParams();
      if (result) {
        this.getManagementPage();
      }
    });
  }

  private openEditDialog(page: ManagementPage): void {
    const dialogRef = this.dialog.open(ManagementPageDetailComponent, {
      width: '600px',
      data: { page },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      this.clearDialogQueryParams();
      if (result) {
        this.getManagementPage();
      }
    });
  }

  // ─── User actions ──────────────────────────────────────────────────────

  AddSubMenu(node: any): void {
    const dialogRef = this.dialog.open(ManagementPageDetailComponent, {
      width: '600px',
      data: { page: { parentId: node.id, type: 'menu', isActive: true } },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getManagementPage();
      }
    });
  }

  onAddNew(): void {
    this.navigateToDialog();
    this.openAddDialog();
  }

  onEdit(node: any): void {
    this.navigateToDialog(node.id);
    this.openEditDialog(node);
  }

  onDelete(node: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Management Page',
        message: `Are you sure you want to delete "${node.title}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.managementPageService.delete(node.id).subscribe({
          next: () => {
            this.getManagementPage();
          },
          error: (err) => {
            console.error('Error deleting:', err);
          }
        });
      }
    });
  }
}