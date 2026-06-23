import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';
import { CashierLayoutComponent } from './layout/cashier-layout/cashier-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: '',
    component: CashierLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'sales',
        loadChildren: () => import('./features/sales/sales.module').then((m) => m.SalesModule),
      },
      { path: '', redirectTo: 'sales', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.module').then((m) => m.ProductsModule),
        data: { breadcrumb: 'Products', labelKh: 'ផលិតផល' }
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.module').then((m) => m.ReportsModule),
        data: { breadcrumb: 'Reports', labelKh: 'របាយការណ៍' }
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.module').then((m) => m.UsersModule),
        data: { breadcrumb: 'Users', labelKh: 'អ្នកប្រើប្រាស់' }
      },
      {
        path: 'page-not-found',
        loadChildren: () => import('./features/page-not-found/page-not-found.module').then((m) => m.PageNotFoundModule),
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./features/categories/categories.module').then((m) => m.CategoriesModule),
      },
      {
        path: 'permission',
        loadChildren: () => import('./features/permissions/permissions.module').then((m) => m.PermissionsModule),
        data: { breadcrumb: 'Permission', labelKh: 'ការអនុញ្ញាត' }
      },
      {
        path: 'sales-history',
        loadChildren: () => import('./features/sales-history/sales-history.module').then((m) => m.SalesHistoryModule),
        data: { breadcrumb: 'Sales History', labelKh: 'ប្រវត្តិការលក់' }
      },
      {
        path: 'user-management',
        loadChildren: () => import('./features/user-management/user-management.module').then((m) => m.UserManagementModule),
        data: { breadcrumb: 'User Management', labelKh: 'ការគ្រប់គ្រងអ្នកប្រើប្រាស់' }
      },
      {
        path: 'cloudinary-file-upload', 
        loadChildren: () => import('./features/cloudinary-file-upload/cloudinary-file-upload.module').then((m) => m.CloudinaryFileUploadModule),
        data: { breadcrumb: 'Cloudinary File Upload', labelKh: 'ការផ្ទុកឯកសារ Cloudinary' }
      },
      {
        path: 'user-role',
        loadChildren: () => import('./features/user-role/user-role.module').then((m) => m.UserRoleModule),
        data: { breadcrumb: 'User Role', labelKh: 'តួនាទីអ្នកប្រើ' }
      },
      {
        path: 'management-page',
        loadChildren: () => import('./features/management-page/management-page.module').then((m) => m.ManagementPageModule),
        data: { breadcrumb: 'Management Page', labelKh: 'គ្រប់គ្រង់ទំព័រ' }
      }
    ],
  },
  // { path: '**', redirectTo: 'sales' },
  { path: '**', redirectTo: 'page-not-found' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
