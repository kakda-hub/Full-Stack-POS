import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material-module';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserDetailRouteComponent } from './user-detail/user-detail-route.component';

@NgModule({
  declarations: [UserListComponent, UserDetailComponent, UserDetailRouteComponent],
  imports: [
    SharedModule,
    MaterialModule,
    RouterModule.forChild([
      { path: '', component: UserListComponent },
      // { path: ':id', component: UserDetailComponent },
    ]),
  ],
})
export class UsersModule {}
