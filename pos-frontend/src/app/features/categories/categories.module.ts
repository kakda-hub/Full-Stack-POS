import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryDetailComponent } from './category-detail/category-detail.component';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material.module';
import { ReusableComponentModule } from '../../shared/reusable-component/reusable-component.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [CategoryListComponent, CategoryDetailComponent],
  imports: [
    CommonModule,
    CategoriesRoutingModule,
    SharedModule,
    MaterialModule,
    ReusableComponentModule,
    ReactiveFormsModule
  ],
})
export class CategoriesModule { }
