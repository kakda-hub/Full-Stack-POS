import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { UiButtonComponent } from './components/ui-button/ui-button.component';
import { ModalComponent } from './components/modal/modal.component';
import { AlertComponent } from './components/alert/alert.component';
import { AlertHostComponent } from './components/alert/alert-host.component';
import { LoaderComponent } from './components/loader/loader.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    UiButtonComponent,
    ModalComponent,
    AlertComponent,
    AlertHostComponent,
    LoaderComponent,
    SkeletonComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    MatDialogModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    UiButtonComponent,
    ModalComponent,
    AlertComponent,
    AlertHostComponent,
    LoaderComponent,
    SkeletonComponent,
  ],
})
export class SharedModule { }
