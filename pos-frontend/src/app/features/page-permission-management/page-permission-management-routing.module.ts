import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagePermissionManagementListComponent } from './page-permission-management-list/page-permission-management-list.component';

const routes: Routes = [
  {
    path: '',
    component: PagePermissionManagementListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagePermissionManagementRoutingModule {}
