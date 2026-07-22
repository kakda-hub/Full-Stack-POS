import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickPicksRoutingModule } from './quick-picks-routing.module';
import { QuickPickListComponent } from './quick-pick-list/quick-pick-list.component';
import { QuickPickDetailComponent } from './quick-pick-detail/quick-pick-detail.component';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material.module';
import { ReusableComponentModule } from '../../shared/reusable-component/reusable-component.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [QuickPickListComponent, QuickPickDetailComponent],
  imports: [
    CommonModule,
    QuickPicksRoutingModule,
    SharedModule,
    MaterialModule,
    ReusableComponentModule,
    ReactiveFormsModule,
  ],
})
export class QuickPicksModule {}
