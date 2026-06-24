// import { ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
// import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
// import { ManagementPageService } from '../../../services/management-page.service';

// @Component({
//   selector: 'app-management-page-list',
//   standalone: false,
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   animations: [fadeIn, listAnimation, pageTransition],
//   templateUrl: './management-page-list.component.html',
// })
// export class ManagementPageListComponent implements OnInit {
  
//   managementPageList: any[] = []
//   constructor(
//     private managementPageService: ManagementPageService,
//   ) { }

//   ngOnInit(): void {
//     this.getManagementPage();
//   }

//   private getManagementPage() {
//     this.managementPageService.getAll().subscribe(res => {
//       console.log(res);
//       this.managementPageList = res;
//     })
//   }

//   toggleNode(node: any) {
//     if (node.type === 'folder') {
//       node.expanded = !node.expanded;
//     }
//   }

//   selectNode(node: any) {
//     // Basic selection logic
//     node.selected = !node.selected;
//   }
// }

import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { ManagementPageService } from '../../../services/management-page.service';

@Component({
  selector: 'app-management-page-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation, pageTransition],
  templateUrl: './management-page-list.component.html',
})
export class ManagementPageListComponent implements OnInit {
  
  managementPageList: any[] = [];

  constructor(
    private managementPageService: ManagementPageService,
    private cdr: ChangeDetectorRef // Required for OnPush when updating data from async source
  ) { }

  ngOnInit(): void {
    this.getManagementPage();
  }

  private getManagementPage() {
    this.managementPageService.getAll().subscribe(res => {
      // res.data contains the array from your example
      this.managementPageList = res;
      this.cdr.markForCheck(); // Trigger UI update for OnPush
    });
  }

  toggleNode(node: any) {
    // In your data, 'menu' type represents a folder
    if (node.type === 'menu' || (node.children && node.children.length > 0)) {
      node.expanded = !node.expanded;
    }
  }

  selectNode(node: any) {
    node.selected = !node.selected;
  }
}