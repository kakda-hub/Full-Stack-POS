import { Component, Input, input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dialog-actions',
  standalone: false,
  templateUrl: './dialog-actions.component.html',
  styleUrl: './dialog-actions.component.scss',
})
export class DialogActionsComponent {
  @Input() form: FormGroup | undefined;
}
