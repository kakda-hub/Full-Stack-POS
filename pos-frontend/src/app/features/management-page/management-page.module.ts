import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManagementPageRoutingModule } from './management-page-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material.module';
import { ReusableComponentModule } from '../../shared/reusable-component/reusable-component.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ManagementPageListComponent } from './management-page-list/management-page-list.component';
import { ManagementPageDetailComponent } from './management-page-detail/management-page-detail.component';
import { LayoutModule } from "../../layout/layout.module";

@NgModule({
  declarations: [ManagementPageListComponent, ManagementPageDetailComponent],
  imports: [
    CommonModule,
    ManagementPageRoutingModule,
    SharedModule,
    RouterModule,
    MaterialModule,
    ReusableComponentModule,
    ReactiveFormsModule,
    LayoutModule
],
})
export class ManagementPageModule {}