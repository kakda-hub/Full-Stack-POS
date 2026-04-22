import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material-module';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

@NgModule({
  declarations: [
    ProductListComponent,
    ProductDetailComponent,
  ],
  imports: [
    SharedModule,
    MaterialModule,
    RouterModule.forChild([{ path: '', component: ProductListComponent }]),
  ],
})
export class ProductsModule { }
