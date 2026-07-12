import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseOrdersRoutingModule } from './purchase-orders-routing.module';
import { PurchaseOrderListComponent } from './purchase-order-list/purchase-order-list.component';
import { PurchaseOrderDetailComponent } from './purchase-order-detail/purchase-order-detail.component';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material.module';
import { ReusableComponentModule } from '../../shared/reusable-component/reusable-component.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [PurchaseOrderListComponent, PurchaseOrderDetailComponent],
  imports: [
    CommonModule,
    PurchaseOrdersRoutingModule,
    SharedModule,
    MaterialModule,
    ReusableComponentModule,
    ReactiveFormsModule,
  ],
})
export class PurchaseOrdersModule {}
