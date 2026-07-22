import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuickPickListComponent } from './quick-pick-list/quick-pick-list.component';

const routes: Routes = [{ path: '', component: QuickPickListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuickPicksRoutingModule {}
