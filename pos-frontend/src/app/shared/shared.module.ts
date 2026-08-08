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
import { FormatNumberPipe } from './pipes/format-number.pipe';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ModalComponent } from './components/modal/modal.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { UiAvatarComponent } from './components/ui-avatar/ui-avatar.component';
import { AvatarUploadComponent } from './components/avatar-upload/avatar-upload.component';
import { ImageUploadAvatarComponent } from './components/image-upload-avatar/image-upload-avatar.component';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { AppIconComponent } from './components/app-icon/app-icon.component';
import { SortHeaderComponent } from './components/sort-header/sort-header.component';
import { ImgFallbackDirective } from './directives/img-fallback.directive';

const components = [ 
    UiAvatarComponent,
    AppIconComponent,
    UiButtonComponent,
    ModalComponent,
    ConfirmDialogComponent,
    AvatarUploadComponent,
    ImageUploadAvatarComponent,
    SearchInputComponent,
    AlertComponent,
    AlertHostComponent,
    LoaderComponent,
    SkeletonComponent,
    DynamicTableComponent,
    DateFormatPipe,
    FormatNumberPipe,
    PaginationComponent,
    SortHeaderComponent,
]

@NgModule({
  declarations: [
    ...components 
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    MatDialogModule,
    MatPaginatorModule,
    ImgFallbackDirective,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    ...components,
    ImgFallbackDirective,
  ],
})
export class SharedModule { }
