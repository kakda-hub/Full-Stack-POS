import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagePermissionManagementRoutingModule } from './page-permission-management-routing.module';
import { PagePermissionManagementListComponent } from './page-permission-management-list/page-permission-management-list.component';
import { MaterialModule } from '../../core/material/material.module';

@NgModule({
  declarations: [PagePermissionManagementListComponent],
  imports: [CommonModule, PagePermissionManagementRoutingModule, CommonModule,MaterialModule ],
})
export class PagePermissionManagementModule {}
