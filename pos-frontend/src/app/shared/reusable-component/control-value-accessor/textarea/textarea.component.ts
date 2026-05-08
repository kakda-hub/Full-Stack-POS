import { Component, Input, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-textarea',
  standalone: false,
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() placeholder: string = '';
  @Input() rows: number = 3;
  @Input() isRequired: boolean = false;

  inputControl = new FormControl('');
  private destroy$ = new Subject<void>();

  // CVA Callbacks
  onChange = (value: any) => { };
  onTouched = () => { };

  ngOnInit(): void {
    // Add validation internally if isRequired is set
    if (this.isRequired) {
      this.inputControl.addValidators(Validators.required);
      this.inputControl.updateValueAndValidity();
    }

    // Listen for internal changes and report them to the parent form
    this.inputControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.onChange(val);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Writes value from the parent form to the internal control
  writeValue(value: any): void {
    this.inputControl.setValue(value, { emitEvent: false });
  }

  // Registers the callback for change events
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Registers the callback for touched events
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Handles disabled state from the parent form
  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.inputControl.disable() : this.inputControl.enable();
  }
}