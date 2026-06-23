import { ChangeDetectionStrategy, Component} from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';

@Component({
  selector: 'app-management-page-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation, pageTransition],
  templateUrl: './management-page-list.component.html',
})
export class ManagementPageListComponent {

}