import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared.module';
import { InputFieldComponent } from './control-value-accessor/input-field/input-field.component';
import { DatePickerComponent } from './control-value-accessor/date-picker/date-picker.component';
import { SelectOptionComponent } from './control-value-accessor/select-option/select-option.component';
import { MaterialModule } from '../../core/material/material.module';
import { TextareaComponent } from './control-value-accessor/textarea/textarea.component';
import { HeaderDetailComponent } from './header-detail/header-detail.component';
import { DialogActionsComponent } from './dialog-actions/dialog-actions.component';
import { DragDropUploadComponent } from './drag-drop-upload/drag-drop-upload.component';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';

@NgModule({
  declarations: [
    InputFieldComponent,
    DatePickerComponent,
    SelectOptionComponent,
    TextareaComponent,
    HeaderDetailComponent,
    DialogActionsComponent,
    DragDropUploadComponent,
    BreadcrumbComponent,
  ],
  imports: [CommonModule, SharedModule, MaterialModule, TranslateModule],
  exports: [
    InputFieldComponent,
    DatePickerComponent,
    SelectOptionComponent,
    TextareaComponent,
    HeaderDetailComponent,
    DialogActionsComponent,
    BreadcrumbComponent,
  ],
})
export class ReusableComponentModule { }
