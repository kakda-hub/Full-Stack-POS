import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ManagementPageService } from '../../../services/management-page.service';
import { modalAnimation, backdropAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-management-page-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './management-page-detail.component.html',
})
export class ManagementPageDetailComponent implements OnInit {
  form!: FormGroup;
  isSaving = signal(false);

  get id(): number | undefined {
    return this.data?.page?.id;
  }

  constructor(
    private fb: FormBuilder,
    public lang: LanguageService,
    private managementPageService: ManagementPageService,
    public theme: ThemeService,
    private dialogRef: MatDialogRef<ManagementPageDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { page?: any } | null,
  ) {}

  ngOnInit(): void {
    const page = this.data?.page || null;
    this.form = this.fb.group({
      title: [page?.title || '', [Validators.required]],
      titleKm: [page?.titleKm || ''],
      icon: [page?.icon || ''],
      type: [page?.type || 'page'],
      url: [page?.url || ''],
      description: [page?.description || ''],
      sortOrder: [page?.sortOrder ?? 0],
      isActive: [page ? !!page.isActive : true],
      parentId: [page?.parentId ?? null],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload = { ...this.form.value };

    const page = this.data?.page || null;
    const id = page?.id;

    const request$ = id
      ? this.managementPageService.update(id, payload)
      : this.managementPageService.create(payload);

    request$.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.error('Failed to save management page', err);
        this.isSaving.set(false);
      },
    });
  }
}
