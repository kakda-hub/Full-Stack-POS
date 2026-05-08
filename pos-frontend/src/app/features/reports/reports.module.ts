import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ReportsComponent } from './reports/reports.component';
import { ReusableComponentModule } from '../../shared/reusable-component/reusable-component.module';
// import { ReportsComponent } from './reports.component';

@NgModule({
  declarations: [ReportsComponent],
  imports: [SharedModule, ReusableComponentModule, RouterModule.forChild([{ path: '', component: ReportsComponent }])],
})
export class ReportsModule { }
