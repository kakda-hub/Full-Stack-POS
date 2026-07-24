import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ReportsComponent } from './reports/reports.component';
import { ReusableComponentModule } from '../../shared/reusable-component/reusable-component.module';
import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
  declarations: [ReportsComponent],
  imports: [
    CommonModule,
    DatePipe,
    SharedModule,
    ReusableComponentModule,
    NgApexchartsModule,
    RouterModule.forChild([{ path: '', component: ReportsComponent }])
  ],
})
export class ReportsModule { }
