import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PermissionsRoutingModule } from './permissions-routing-module';
import { PermissionListComponent } from './permission-list/permission-list.component';
import { ReusableComponentModule } from "../../shared/reusable-component/reusable-component.module";

@NgModule({
  declarations: [PermissionListComponent],
  imports: [CommonModule, PermissionsRoutingModule, ReusableComponentModule,],
})
export class PermissionsModule { }
