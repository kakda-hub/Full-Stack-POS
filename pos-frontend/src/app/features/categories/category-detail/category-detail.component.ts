import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
  @Input() category: any | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  isSaving = signal(false);
  isUploading = signal(false);
  id: number | undefined;

  constructor(
    private fb: FormBuilder,
    public lang: LanguageService,
    private categoriesService: CategoriesService,
    public theme: ThemeService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.category?.name || '', [Validators.required]],
      nameKh: [this.category?.nameKh || this.category?.nameKm || ''],
      description: [this.category?.description || ''],
      imgUrl: [this.category?.imgUrl || this.category?.icon || ''],
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isUploading.set(true);
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<any>('http://localhost:3000/api/v1/dynamicFileupload', formData).subscribe({
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

    if (this.category?.id) {
      this.categoriesService.update(this.category.id, payload).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.save.emit(res);
        },
        error: (err) => {
          console.error(err);
          this.isSaving.set(false);
          this.save.emit(payload); // emit anyway to close modal for demo
        }
      });
    } else {
      this.categoriesService.save(payload).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.save.emit(res);
        },
        error: (err) => {
          console.error(err);
          this.isSaving.set(false);
          this.save.emit(payload); // emit anyway to close modal for demo
        }
      });
    }
  }
}
