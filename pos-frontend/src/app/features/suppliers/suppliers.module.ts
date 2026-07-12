import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuppliersRoutingModule } from './suppliers-routing.module';
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { SupplierDetailComponent } from './supplier-detail/supplier-detail.component';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material.module';
import { ReusableComponentModule } from '../../shared/reusable-component/reusable-component.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [SupplierListComponent, SupplierDetailComponent],
  imports: [
    CommonModule,
    SuppliersRoutingModule,
    SharedModule,
    MaterialModule,
    ReusableComponentModule,
    ReactiveFormsModule,
  ],
})
export class SuppliersModule {}
