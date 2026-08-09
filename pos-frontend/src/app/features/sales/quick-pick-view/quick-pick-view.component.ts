import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuickPickItem } from '../../../models';
import { LanguageService } from '../../../services/shared/language.service';

@Component({
  selector: 'app-quick-pick-view',
  standalone: false,
  templateUrl: './quick-pick-view.component.html',
  styleUrl: './quick-pick-view.component.scss',
})
export class QuickPickViewComponent {
  @Input() quickPicks: QuickPickItem[] = [];
  @Output() addQuickPick = new EventEmitter<QuickPickItem>();

  constructor(public langService: LanguageService) {}
}