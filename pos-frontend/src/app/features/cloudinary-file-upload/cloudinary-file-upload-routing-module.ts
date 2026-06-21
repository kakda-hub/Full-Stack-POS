import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CloudinaryFileUploadListComponent } from './cloudinary-file-upload-list/cloudinary-file-upload-list.component';

const routes: Routes = [
  {
    path: '', 
    component: CloudinaryFileUploadListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CloudinaryFileUploadRoutingModule {}
