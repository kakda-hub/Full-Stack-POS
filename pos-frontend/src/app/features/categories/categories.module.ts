import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryDetailComponent } from './category-detail/category-detail.component';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material-module';

@NgModule({
  declarations: [CategoryListComponent, CategoryDetailComponent],
  imports: [CommonModule, CategoriesRoutingModule, SharedModule, MaterialModule],
})
export class CategoriesModule { }
