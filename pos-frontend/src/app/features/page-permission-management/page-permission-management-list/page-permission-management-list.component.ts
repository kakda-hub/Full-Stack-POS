import { Component, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-page-permission-management-list',
  standalone: false,
  templateUrl: './page-permission-management-list.component.html',
  styleUrl: './page-permission-management-list.component.scss',
})
export class PagePermissionManagementListComponent {

  constructor(public langService: LanguageService) {}
}
