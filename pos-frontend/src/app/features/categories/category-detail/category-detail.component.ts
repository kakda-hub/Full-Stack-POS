import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '../../../services/shared/language.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { AlertService } from '../../../services/shared/alert.service';
import { CategoriesService } from '../../../services/categories.service';
import { modalAnimation, backdropAnimation } from '../../../shared/animations/animations';
import { CloudinaryService } from '../../../services/cloudinary.service';

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
    private cloudinaryService: CloudinaryService,
    private alertService: AlertService,
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
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isUploading.set(true);

    this.cloudinaryService.uploadFile(file).subscribe({
      next: (res) => {
        // Extract fileUrl from the nested response envelope
        const fileUrl =
          res?.data?.data?.fileUrl ||          // { data: { data: { fileUrl } } }
          res?.data?.data?.[0]?.fileUrl ||      // { data: { data: [{ fileUrl }] } }
          res?.data?.fileUrl;                    // { data: { fileUrl } }

        if (fileUrl) {
          this.form.patchValue({ imgUrl: fileUrl });
          this.alertService.success(
            this.lang.currentLang() === 'km' ? 'បានបង្ហោះរូបភាពដោយជោគជ័យ' : 'Image uploaded successfully',
            this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Success'
          );
        }
        this.isUploading.set(false);
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.alertService.error(
          this.lang.currentLang() === 'km' ? 'ការបង្ហោះរូបភាពបរាជ័យ' : 'Image upload failed',
          this.lang.currentLang() === 'km' ? 'កំហុស' : 'Error'
        );
        this.isUploading.set(false);
      },
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
