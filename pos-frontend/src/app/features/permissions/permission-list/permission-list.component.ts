import { Component } from '@angular/core';
import { LanguageService } from '../../../services/shared/language.service';
import { fadeIn } from '../../../shared/animations/animations';

@Component({
  selector: 'app-permission-list',
  standalone: false,
  animations: [fadeIn],
  templateUrl: './permission-list.component.html',
  styleUrl: './permission-list.component.scss',
})
export class PermissionListComponent {
  permissions = [
    { labelKey: 'permissions.accessSales', admin: true, cashier: true },
    { labelKey: 'permissions.processPayments', admin: true, cashier: true },
    { labelKey: 'permissions.viewReports', admin: true, cashier: false },
    { labelKey: 'permissions.manageProducts', admin: true, cashier: false },
    { labelKey: 'permissions.manageUsers', admin: true, cashier: false },
    { labelKey: 'permissions.applyDiscounts', admin: true, cashier: true },
    { labelKey: 'permissions.deleteTransactions', admin: true, cashier: false },
    { labelKey: 'permissions.exportData', admin: true, cashier: false },
  ];

  constructor(public lang: LanguageService) { }
}
