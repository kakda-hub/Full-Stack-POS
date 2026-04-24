import { Injectable } from '@angular/core';
import { GenericDialogService } from './generic-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';

@Injectable({
  providedIn: 'root',
})
export class ReusableDialogService extends GenericDialogService<any> {

  private component: ComponentType<any> | undefined;

  constructor(
    public override dialog: MatDialog,
  ) {
    super(dialog)
  }

  public setDialogComponent(component: ComponentType<any>): void {
    this.component = component;
  }

  public getDialogComponent(): ComponentType<any> {
    return this.component!;
  }

}
