import { ChangeDetectionStrategy, Component, Input, Self, Optional, OnInit, inject, DestroyRef, booleanAttribute } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-input-field',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss',
})
export class InputFieldComponent implements ControlValueAccessor, OnInit {
  @Input() placeholder: string = '';
  @Input({ transform: booleanAttribute }) isRequired: boolean = false; // Check if required [true,false]
  @Input() type: string = 'text';

  inputControl: FormControl = new FormControl();

  private destroyRef = inject(DestroyRef);

  constructor(@Self() @Optional() public controlDir: NgControl) {
    if (this.controlDir) {
      this.controlDir.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    // Sync Internal -> External
    this.inputControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.onChange(val);
        this.onTouched(); // Ensure parent knows it was touched
      });

    // Sync Validators
    this.updateValidators();
  }

  private updateValidators(): void {
    const validators = [];

    if (this.controlDir?.control?.validator && this.isRequired) {
      validators.push(this.controlDir.control.validator);
    }

    this.inputControl.setValidators(validators);
    this.inputControl.updateValueAndValidity({ emitEvent: false });
  }

  writeValue(value: any): void {
    this.inputControl.setValue(value, { emitEvent: false });
  }


  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.inputControl.disable({ emitEvent: false }) : this.inputControl.enable({ emitEvent: false });
  }

  onChange: any = () => { };
  onTouched: any = () => { };

  get errorMessage(): string {
    const control = this.inputControl;
    if (control && control.errors && control.touched) {
      if (control.errors['required']) return `${this.placeholder} is required`;
      if (control.errors['email']) return `Invalid email format`;
      if (control.errors['minlength']) return `Min ${control.errors['minlength'].requiredLength} characters required`;
    }
    return '';
  }
}