import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { SafeHtmlPipe } from '../shared/pipes/safe-html.pipe';
import { MatIconModule } from '@angular/material/icon';
import { CashierLayoutComponent } from './cashier-layout/cashier-layout.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

const components = [CashierLayoutComponent, AdminLayoutComponent];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, SafeHtmlPipe, MatIconModule],
  exports: [...components],
})
export class LayoutModule { }
