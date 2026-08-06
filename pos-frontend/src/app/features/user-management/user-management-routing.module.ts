import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManagementListComponent } from './user-management-list/user-management-list.component';
import { UserManagementCardComponent } from './user-management-card/user-management-card.component';

const routes: Routes = [
  { path: '', component: UserManagementListComponent },
  {
    path: 'card',
    component: UserManagementCardComponent,
    data: { breadcrumb: 'Card View', labelKh: 'ទិដ្ឋភាពកាត' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserManagementRoutingModule { }
