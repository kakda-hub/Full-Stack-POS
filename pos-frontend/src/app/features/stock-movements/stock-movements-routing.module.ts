import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockMovementListComponent } from './stock-movement-list/stock-movement-list.component';

const routes: Routes = [{ path: '', component: StockMovementListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockMovementsRoutingModule {}
