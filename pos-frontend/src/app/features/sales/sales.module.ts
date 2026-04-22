import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SalesComponent } from './sales/sales.component';
import { PaymentModalComponent } from './payment-modal/payment-modal.component';
// import { ReceiptModalComponent } from './receipt-modal.component';
import { FormsModule } from '@angular/forms';
import { ReceiptModalComponent } from './receipt-modal/receipt-modal.component';

const components = [SalesComponent, PaymentModalComponent, ReceiptModalComponent];

@NgModule({
  declarations: [components],
  imports: [
    SharedModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: SalesComponent }]),
  ],
})
export class SalesModule {}
