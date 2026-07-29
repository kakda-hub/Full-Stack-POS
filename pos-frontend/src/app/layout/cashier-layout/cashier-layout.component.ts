import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { AvatarUploadDialogComponent } from '../../shared/components/avatar-upload-dialog/avatar-upload-dialog.component';
import { counterAnimation, themeRotate } from '../../shared/animations/animations';

@Component({
  selector: 'app-cashier-layout',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [counterAnimation, themeRotate],
  templateUrl: './cashier-layout.component.html',
  styleUrl: './cashier-layout.component.scss',
})
export class CashierLayoutComponent {
  constructor(
    public auth: AuthService,
    public langService: LanguageService,
    public cart: CartService,
    public theme: ThemeService,
    private dialog: MatDialog,
  ) { }

  openAvatarDialog(): void {
    this.dialog.open(AvatarUploadDialogComponent, {
      width: '440px',
      maxWidth: '95vw',
      panelClass: 'avatar-upload-dialog-panel',
      disableClose: true,
      data: {
        currentAvatarUrl: this.auth.currentUser()?.avatarUrl || '',
        userName: this.auth.currentUser()?.name || 'User',
      },
    });
  }
}
