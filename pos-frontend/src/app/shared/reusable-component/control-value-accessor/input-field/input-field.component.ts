import { Component, Input, Self, Optional, OnInit, inject, DestroyRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-input-field',
  standalone: false,
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss',
})
export class InputFieldComponent implements ControlValueAccessor, OnInit {
  @Input() placeholder: string = '';
  @Input() isRequired: boolean = false; // Check if required [true,false]
  @Input() type: string = 'text';

  // Internal control that interacts with the HTML template
  inputControl: FormControl = new FormControl();

  // Modern way to handle subscription cleanup in Angular 16+
  private destroyRef = inject(DestroyRef);

  constructor(@Self() @Optional() public controlDir: NgControl) {
    if (this.controlDir && this.isRequired) {
      this.controlDir.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    // Sync Internal -> External:
    // When the user types, notify the parent form
    this.inputControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.onChange(val);
      });

    // Optional: Sync parent validators to internal control (for UI/red borders)
    if (this.controlDir?.control) {
      this.inputControl.setValidators(this.controlDir.control.validator);
      this.inputControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  // Sync External -> Internal: 
  // Called when the parent form sets a value (e.g., patchValue)
  writeValue(value: any): void {
    this.inputControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  // Sync External -> Internal:
  // Called when parent form disables the control
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