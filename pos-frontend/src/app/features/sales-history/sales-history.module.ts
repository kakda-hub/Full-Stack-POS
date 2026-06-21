import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ReusableComponentModule } from '../../shared/reusable-component/reusable-component.module';
import { SalesHistoryComponent } from './sales-history.component';

@NgModule({
  declarations: [SalesHistoryComponent],
  imports: [
    SharedModule,
    ReusableComponentModule,
    RouterModule.forChild([{ path: '', component: SalesHistoryComponent }]),
  ],
})
export class SalesHistoryModule {}
