import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { UiButtonComponent } from './components/ui-button/ui-button.component';
import { AlertComponent } from './components/alert/alert.component';
import { AlertHostComponent } from './components/alert/alert-host.component';
import { LoaderComponent } from './components/loader/loader.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table.component';
import { DateFormatPipe } from './pipes/date-format-pipe';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ModalComponent } from './components/modal/modal.component';

@NgModule({
  declarations: [
    UiButtonComponent,
    ModalComponent,
    AlertComponent,
    AlertHostComponent,
    LoaderComponent,
    SkeletonComponent,
    DynamicTableComponent,
    DateFormatPipe,
    PaginationComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    MatDialogModule,
    MatPaginatorModule,
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
    DynamicTableComponent,
    DateFormatPipe,
    PaginationComponent,
  ],
})
export class SharedModule { }
