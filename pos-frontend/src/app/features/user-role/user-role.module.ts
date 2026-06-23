import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UserRoleRoutingModule } from './user-role-routing.module';
import { UserRoleComponent } from './user-role.component';
import { SharedModule } from '../../shared/shared.module';
import { ReusableComponentModule } from '../../shared/reusable-component/reusable-component.module';

@NgModule({
  declarations: [UserRoleComponent],
  imports: [
    CommonModule,
    UserRoleRoutingModule,
    SharedModule,
    ReusableComponentModule,
    RouterModule,
  ],
})
export class UserRoleModule {}
