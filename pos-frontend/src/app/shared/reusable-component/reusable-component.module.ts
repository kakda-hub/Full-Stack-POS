import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared.module';
import { ReusableCardComponent } from './reusable-card/reusable-card.component';
import { InputFieldComponent } from './control-value-accessor/input-field/input-field.component';
import { DatePickerComponent } from './control-value-accessor/date-picker/date-picker.component';
import { SelectOptionComponent } from './control-value-accessor/select-option/select-option.component';
import { MaterialModule } from '../../core/material/material-module';

@NgModule({
  declarations: [
    ReusableCardComponent,
    InputFieldComponent,
    DatePickerComponent,
    SelectOptionComponent,
  ],
  imports: [CommonModule, SharedModule, MaterialModule],
  exports: [InputFieldComponent, DatePickerComponent, SelectOptionComponent, ReusableCardComponent],
})
export class ReusableComponentModule { }
