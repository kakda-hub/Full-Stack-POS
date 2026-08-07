import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CloudinaryFileUploadListComponent } from './cloudinary-file-upload-list/cloudinary-file-upload-list.component';
import { CloudinarySignInComponent } from './cloudinary-sign-in/cloudinary-sign-in.component';
import { cloudinarySignedInGuard } from './cloudinary-signed-in.guard';

const routes: Routes = [
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: CloudinarySignInComponent },
  {
    path: 'list',
    component: CloudinaryFileUploadListComponent,
    canActivate: [cloudinarySignedInGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CloudinaryFileUploadRoutingModule {}
