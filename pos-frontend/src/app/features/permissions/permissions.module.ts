import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionListComponent } from './permission-list/permission-list.component';
import { SharedModule } from "../../shared/shared.module";
import { ReusableComponentModule } from "../../shared/reusable-component/reusable-component.module";
import { PermissionsRoutingModule } from './permissions-routing.module';

@NgModule({
  declarations: [PermissionListComponent],
  imports: [CommonModule, PermissionsRoutingModule, SharedModule, ReusableComponentModule],
})
export class PermissionsModule { }
