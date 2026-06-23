import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CategoriesService } from '../../../services/categories.service';
import { modalAnimation, backdropAnimation } from '../../../shared/animations/animations';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-category-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './category-detail.component.html',
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
    private http: HttpClient,
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
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isUploading.set(true);
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<any>('/api/v1/dynamicFileupload', formData).subscribe({
      next: (res) => {
        if (res.data && res.data.data && res.data.data.length > 0) {
          this.form.patchValue({ imgUrl: res.data.data[0].fileUrl });
        }
        this.isUploading.set(false);
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.isUploading.set(false);
      }
    });
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
