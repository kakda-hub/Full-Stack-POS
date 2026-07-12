import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StockMovementsRoutingModule } from './stock-movements-routing.module';
import { StockMovementListComponent } from './stock-movement-list/stock-movement-list.component';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material.module';
import { ReusableComponentModule } from '../../shared/reusable-component/reusable-component.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [StockMovementListComponent],
  imports: [
    CommonModule,
    StockMovementsRoutingModule,
    SharedModule,
    MaterialModule,
    ReusableComponentModule,
    ReactiveFormsModule,
  ],
})
export class StockMovementsModule {}
