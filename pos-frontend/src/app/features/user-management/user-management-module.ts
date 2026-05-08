import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing-module';
import { UserManagementListComponent } from './user-management-list/user-management-list.component';

@NgModule({
  declarations: [UserManagementListComponent],
  imports: [CommonModule, UserManagementRoutingModule],
})
export class UserManagementModule { }
