import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material.module';
import { UserListComponent } from './user-list/user-list.component';
import { ReusableComponentModule } from '../../shared/reusable-component/reusable-component.module';
import { UserDetailDialogModule } from '../shared/user-detail-dialog/user-detail-dialog.module';

@NgModule({
  declarations: [
    UserListComponent,
  ],
  imports: [
    SharedModule,
    MaterialModule,
    ReusableComponentModule,
    UserDetailDialogModule,
    RouterModule.forChild([
      { path: '', component: UserListComponent },
    ]),
  ],
})
export class UsersModule { }
