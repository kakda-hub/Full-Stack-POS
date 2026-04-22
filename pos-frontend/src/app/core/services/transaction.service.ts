import { Injectable, signal, computed } from '@angular/core';
import { Transaction, CartItem } from '../models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private _transactions = signal<Transaction[]>(this.loadTransactions());

  transactions = this._transactions.asReadonly();

  todayTransactions = computed(() => {
    const today = new Date().toDateString();
    return this._transactions().filter(t => new Date(t.timestamp).toDateString() === today);
  });

  todayRevenue = computed(() =>
    this.todayTransactions().reduce((sum, t) => sum + t.total, 0)
  );

  paymentBreakdown = computed(() => {
    const breakdown: Record<string, { amount: number; count: number }> = {};
    this.todayTransactions().forEach(t => {
      if (!breakdown[t.paymentMethod]) breakdown[t.paymentMethod] = { amount: 0, count: 0 };
      breakdown[t.paymentMethod].amount += t.total;
      breakdown[t.paymentMethod].count++;
    });
    return breakdown;
  });

  saveTransaction(
    items: CartItem[],
    subtotal: number,
    totalDiscount: number,
    tax: number,
    total: number,
    paymentMethod: 'cash' | 'aba' | 'card',
    cashier: string,
    cashReceived?: number
  ): Transaction {
    const transaction: Transaction = {
      id: `TXN-${Date.now()}`,
      items,
      subtotal,
      totalDiscount,
      tax,
      total,
      paymentMethod,
      cashReceived,
      change: cashReceived ? cashReceived - total : 0,
      cashier,
      timestamp: new Date(),
    };
    this._transactions.update(txns => [transaction, ...txns]);
    this.saveToStorage();
    return transaction;
  }

  private saveToStorage(): void {
    localStorage.setItem('pos_transactions', JSON.stringify(this._transactions()));
  }

  private loadTransactions(): Transaction[] {
    try {
      const stored = localStorage.getItem('pos_transactions');
      if (!stored) return [];
      return JSON.parse(stored).map((t: Transaction) => ({ ...t, timestamp: new Date(t.timestamp) }));
    } catch { return []; }
  }
}
