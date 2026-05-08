import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material-module';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { DialogFormsComponent } from './dialog-forms/dialog-forms.component';
import { ReusableComponentModule } from '../../shared/reusable-component/reusable-component.module';

@NgModule({
  declarations: [
    UserListComponent,
    UserDetailComponent,
    DialogFormsComponent
  ],
  imports: [
    SharedModule,
    MaterialModule,
    ReusableComponentModule,
    RouterModule.forChild([
      { path: '', component: UserListComponent },
      // { path: ':id', component: UserDetailComponent },
    ]),
  ],
})
export class UsersModule { }
