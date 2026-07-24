import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SharedModule } from '../../../shared/shared.module';
import { ReusableComponentModule } from '../../../shared/reusable-component/reusable-component.module';
import { UserDetailDialogComponent } from './user-detail-dialog.component';

@NgModule({
  declarations: [UserDetailDialogComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSelectModule,
    MatSlideToggleModule,
    SharedModule,
    ReusableComponentModule,
  ],
  exports: [UserDetailDialogComponent],
})
export class UserDetailDialogModule {}
