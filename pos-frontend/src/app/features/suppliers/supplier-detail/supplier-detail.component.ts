import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AlertService } from '../../../core/services/alert.service';
import { SupplierService } from '../../../core/services/api/supplier.service';
import { modalAnimation, backdropAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-supplier-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './supplier-detail.component.html',
})
export class SupplierDetailComponent implements OnInit {
  form!: FormGroup;
  isSaving = signal(false);

  get id(): number | undefined {
    return this.data?.supplier?.id;
  }

  constructor(
    private fb: FormBuilder,
    public lang: LanguageService,
    private alertService: AlertService,
    private supplierService: SupplierService,
    public theme: ThemeService,
    private dialogRef: MatDialogRef<SupplierDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { supplier?: any } | null,
  ) {}

  ngOnInit(): void {
    const supplier = this.data?.supplier || null;
    this.form = this.fb.group({
      name: [supplier?.name || '', [Validators.required]],
      contactPerson: [supplier?.contactPerson || ''],
      phone: [supplier?.phone || ''],
      email: [supplier?.email || ''],
      address: [supplier?.address || ''],
      taxId: [supplier?.taxId || ''],
      notes: [supplier?.notes || ''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload = this.form.value;

    const supplier = this.data?.supplier || null;
    const id = supplier?.id;

    const request$ = id
      ? this.supplierService.update(id, payload)
      : this.supplierService.save(payload);

    request$.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.error('Failed to save supplier', err);
        this.alertService.error(
          this.lang.currentLang() === 'km'
            ? 'ការរក្សាទុកអ្នកផ្គត់ផ្គង់បរាជ័យ'
            : 'Failed to save supplier'
        );
        this.isSaving.set(false);
      },
    });
  }
}
