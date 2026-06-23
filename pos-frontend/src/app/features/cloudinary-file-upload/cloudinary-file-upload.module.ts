import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CloudinaryFileUploadRoutingModule } from './cloudinary-file-upload-routing.module';
import { CloudinaryFileUploadListComponent } from './cloudinary-file-upload-list/cloudinary-file-upload-list.component';

import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material.module';

@NgModule({
  declarations: [CloudinaryFileUploadListComponent],
  imports: [
    CommonModule, 
    CloudinaryFileUploadRoutingModule,
    SharedModule,
    MaterialModule
  ],
})
export class CloudinaryFileUploadModule {}
