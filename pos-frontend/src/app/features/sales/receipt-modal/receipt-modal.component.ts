import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Transaction } from '../../../models';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { backdropAnimation, modalAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-receipt-modal',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './receipt-modal.component.html',
  styleUrl: './receipt-modal.component.scss',
})
export class ReceiptModalComponent {
  @Input() transaction!: Transaction;
  @Input() photoResolver: (category: string) => string | undefined = () => undefined;
  @Output() close = new EventEmitter<void>();

  constructor(
    public lang: LanguageService,
    public theme: ThemeService,
  ) {}

  printReceipt(): void {
    const content = document.getElementById('receipt-print');
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head>
      <title>Receipt</title>
      <style>
        body { font-family: monospace; font-size: 12px; width: 80mm; margin: 0 auto; padding: 4mm; }
        .border-dashed { border-bottom: 1px dashed #999; padding-bottom: 4px; margin-bottom: 4px; }
        .text-center { text-align: center; }
        .flex { display: flex; justify-content: space-between; }
        .font-black { font-weight: 900; }
        .receipt-item { display: flex; align-items: flex-start; gap: 4px; margin-bottom: 4px; }
        .receipt-item-body { flex: 1; min-width: 0; }
        .receipt-thumb { width: 28px; height: 28px; object-fit: cover; border-radius: 2px; flex-shrink: 0; }
        .receipt-thumb-ph { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        @media print { @page { size: 80mm auto; margin: 0; } }
      </style>
      </head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  }
}
