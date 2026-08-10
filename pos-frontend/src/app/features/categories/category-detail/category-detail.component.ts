import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '../../../services/shared/language.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { CategoriesService } from '../../../services/categories.service';
import { modalAnimation, backdropAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-category-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.scss',
})
export class CategoryDetailComponent implements OnInit {
  form!: FormGroup;
  isSaving = signal(false);
  isUploading = signal(false);

  get id(): number | undefined {
    return this.data?.category?.id;
  }

  constructor(
    private fb: FormBuilder,
    public lang: LanguageService,
    private categoriesService: CategoriesService,
    public theme: ThemeService,
    private dialogRef: MatDialogRef<CategoryDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { category?: any } | null,
  ) { }

  ngOnInit(): void {
    const category = this.data?.category || null;
    this.form = this.fb.group({
      name: [category?.name || '', [Validators.required]],
      nameKh: [category?.nameKh || category?.nameKm || ''],
      description: [category?.description || ''],
      imgUrl: [category?.imgUrl || category?.icon || ''],
    });
  }

  onFileSelected(event: Event): void {
    // Handled by ImageUploadAvatarComponent
  }

  onImageChange(url: string): void {
    this.form.patchValue({ imgUrl: url });
  }

  onImageRemove(): void {
    this.form.patchValue({ imgUrl: '' });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload = this.form.value;

    const category = this.data?.category || null;
    const id = category?.id;

    const request$ = id
      ? this.categoriesService.update(id, payload)
      : this.categoriesService.save(payload);

    request$.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.error('Failed to save category', err);
        this.isSaving.set(false);
      },
    });
  }
}
