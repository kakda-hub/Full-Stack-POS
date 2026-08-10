import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SalesComponent } from './sales/sales.component';
import { PaymentModalComponent } from './payment-modal/payment-modal.component';
// import { ReceiptModalComponent } from './receipt-modal.component';
import { FormsModule } from '@angular/forms';
import { ReceiptModalComponent } from './receipt-modal/receipt-modal.component';
import { RightCartSidebarComponent } from './right-cart-sidebar/right-cart-sidebar.component';
import { ProductCardComponent } from './product-card/product-card.component';
import { CategoryTabsComponent } from './category-tabs/category-tabs.component';
import { QuickPickViewComponent } from './quick-pick-view/quick-pick-view.component';

const components = [
  SalesComponent,
  PaymentModalComponent,
  ReceiptModalComponent,
  RightCartSidebarComponent,
];

@NgModule({
  declarations: [components, ProductCardComponent, CategoryTabsComponent, QuickPickViewComponent],
  imports: [
    SharedModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: SalesComponent }]),
  ],
})
export class SalesModule {}
