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
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.module').then((m) => m.ReportsModule),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.module').then((m) => m.UsersModule),
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
