import { Injectable } from '@angular/core';
import { DialogConfig } from '../../models/enums/dialog-config.enum';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export abstract class GenericDialogService<T> {

  private defaultOption: MatDialogConfig;

  protected constructor(public dialog: MatDialog) {
    this.defaultOption = defaultMatOptionConfig;
  }

  public abstract getDialogComponent(): ComponentType<T>;

  /**
   * Open dialog
   * @param data
   */
  public open(data?: any) {
    // Merge the default options with the data into a fresh config object
    const config: MatDialogConfig = { ...this.defaultOption, data };

    const dialogRef = this.dialog.open(this.getDialogComponent(), config);

    // Reset defaultOption for the next use
    this.defaultOption = { ...defaultMatOptionConfig };

    return dialogRef.afterClosed();
  }

  /**
   * All sub-class can override this method to set dialog configuration
   */
  public setDialogConfigOption(config?: any) {
    this.defaultOption = config || this.defaultOption;
  }

}

const defaultMatOptionConfig = {
  panelClass: DialogConfig.MEDIUM_DIALOG,
  disableClose: true
};