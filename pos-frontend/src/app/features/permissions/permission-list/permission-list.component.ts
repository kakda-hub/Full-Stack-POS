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
    { label: 'Access Sales', labelKm: 'ចូលប្រើការលក់', admin: true, cashier: true },
    { label: 'Process Payments', labelKm: 'ដំណើរការទូទាត់', admin: true, cashier: true },
    { label: 'View Reports', labelKm: 'មើលរបាយការណ៍', admin: true, cashier: false },
    { label: 'Manage Products', labelKm: 'គ្រប់គ្រងផលិតផល', admin: true, cashier: false },
    { label: 'Manage Users', labelKm: 'គ្រប់គ្រងអ្នកប្រើ', admin: true, cashier: false },
    { label: 'Apply Discounts', labelKm: 'បញ្ចុះតម្លៃ', admin: true, cashier: true },
    { label: 'Delete Transactions', labelKm: 'លុបប្រតិបត្តិការ', admin: true, cashier: false },
    { label: 'Export Data', labelKm: 'នាំចេញទិន្នន័យ', admin: true, cashier: false },
  ];

  constructor(public lang: LanguageService) { }
}
