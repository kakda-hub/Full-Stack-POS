import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PageNotFoundComponent } from './page-not-found.component';

@NgModule({
  declarations: [PageNotFoundComponent],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild([{ path: '', component: PageNotFoundComponent }])
  ],
})
export class PageNotFoundModule { }
