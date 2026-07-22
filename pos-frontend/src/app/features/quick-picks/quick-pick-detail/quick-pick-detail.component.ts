import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AlertService } from '../../../core/services/alert.service';
import { QuickPickService } from '../../../core/services/api/quick-pick.service';
import { QuickPickItem } from '../../../core/models';
import { modalAnimation, backdropAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-quick-pick-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './quick-pick-detail.component.html',
  styleUrl: './quick-pick-detail.component.scss',
})
export class QuickPickDetailComponent implements OnInit {
  form!: FormGroup;
  isSaving = signal(false);

  get id(): number | undefined {
    return this.data?.quickPick?.id;
  }

  constructor(
    private fb: FormBuilder,
    public lang: LanguageService,
    private alertService: AlertService,
    private quickPickService: QuickPickService,
    public theme: ThemeService,
    private dialogRef: MatDialogRef<QuickPickDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { quickPick?: QuickPickItem } | null,
  ) {}

  ngOnInit(): void {
    const item = this.data?.quickPick || null;
    this.form = this.fb.group({
      label: [item?.label || '', [Validators.required, Validators.minLength(1)]],
      labelKh: [item?.labelKh || ''],
      price: [item?.price || '', [Validators.required, Validators.min(0.01)]],
      icon: [item?.icon || ''],
      sortOrder: [item?.sortOrder || 1, [Validators.min(0)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload = this.form.value;
    const item = this.data?.quickPick || null;
    const id = item?.id;

    const request$ = id
      ? this.quickPickService.update(id, payload)
      : this.quickPickService.create(payload);

    request$.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.error('Failed to save quick pick', err);
        this.alertService.error(
          this.lang.currentLang() === 'km'
            ? 'ការរក្សាទុកបរាជ័យ'
            : 'Failed to save quick pick'
        );
        this.isSaving.set(false);
      },
    });
  }
}
