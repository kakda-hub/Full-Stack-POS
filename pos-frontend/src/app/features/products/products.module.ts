import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material.module';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ReusableComponentModule } from "../../shared/reusable-component/reusable-component.module";
import { ReactiveFormsModule } from '@angular/forms';
import { CloudinaryMediaGalleryModalComponent } from '../../shared/components/cloudinary-media-gallery/cloudinary-media-gallery-modal.component';

@NgModule({
  declarations: [
    ProductListComponent,
    ProductDetailComponent,
    CloudinaryMediaGalleryModalComponent,
  ],
  imports: [
    SharedModule,
    MaterialModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: ProductListComponent }]),
    ReusableComponentModule,
  ],
})
export class ProductsModule { }
