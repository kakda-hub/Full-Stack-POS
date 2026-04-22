import { NgModule } from '@angular/core';

// Buttons & Inputs
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

// Layout
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

// Navigation
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';

// Data display
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

// Feedback
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Form controls
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';

// Icons
import { MatIconModule } from '@angular/material/icon';

// Others
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  exports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCardModule,
    MatMenuModule,
    MatListModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    MatTooltipModule
  ]
})
export class MaterialModule {}