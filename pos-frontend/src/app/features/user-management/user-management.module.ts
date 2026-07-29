import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementListComponent } from './user-management-list/user-management-list.component';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material.module';
import { ReusableComponentModule } from '../../shared/reusable-component/reusable-component.module';
import { UserDetailDialogModule } from '../../shared/user-detail-dialog/user-detail-dialog.module';
import { UserManagementCardComponent } from './user-management-card/user-management-card.component';

@NgModule({
  declarations: [UserManagementListComponent, UserManagementCardComponent],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    SharedModule,
    MaterialModule,
    ReusableComponentModule,
    UserDetailDialogModule,
  ],
})
export class UserManagementModule {}
