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
}
