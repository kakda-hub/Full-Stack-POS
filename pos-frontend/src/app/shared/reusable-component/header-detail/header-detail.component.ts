import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header-detail',
  standalone: false,
  templateUrl: './header-detail.component.html',
  styleUrl: './header-detail.component.scss',
})
export class HeaderDetailComponent {
  @Input() id: number | undefined = undefined;
  @Input() title: string | undefined = undefined;
  @Input() iconType: 'category' | 'product' | 'user' | 'supplier' | 'purchase' | 'management' | 'default' = 'default';
  @Input() subtitle: string | undefined = undefined;

  get iconPath(): string {
    switch (this.iconType) {
      case 'category':
        return 'M3 4h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 15h7v7H3z';
      case 'product':
        return 'M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16V8z';
      case 'user':
        return 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z';
      case 'supplier':
        return 'M3.75 21h16.5M4.5 21V6.75a.75.75 0 01.75-.75h13.5a.75.75 0 01.75.75V21M9 21v-6.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75V21';
      case 'purchase':
        return 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2';
      case 'management':
        return 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z';
      default:
        return 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25';
    }
  }

  get defaultSubtitle(): string {
    return this.subtitle || (this.id 
      ? 'Edit the details below' 
      : 'Fill in the information below');
  }
}
