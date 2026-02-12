import { Component, inject, signal, effect, untracked, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { TradesService } from '../services/trades.service';
import { QuotesService } from '../services/quotes.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TradeGroupUI } from '../interfaces/trade-group-ui.interface';

@Component({
  selector: 'app-trade-table',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './trade-table.component.html',
  styleUrl: './trade-table.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: '0px', opacity: 0, overflow: 'hidden' }),
        animate('250ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: '0px', opacity: 0 })),
      ]),
    ]),
  ],
})
export class TradeTableComponent {
  private tradesService = inject(TradesService);
  private quotesService = inject(QuotesService);
  private snackBar = inject(MatSnackBar);

  expanded = signal<Set<string>>(new Set());
  readonly groupedTrades = this.tradesService.groupedBySymbol;
  readonly isLoading = this.tradesService.isLoading;
  readonly tradeError = this.tradesService.tradeError;
  readonly webSocketError = this.quotesService.quoteError;

  readonly combinedError = computed(() => this.tradeError() ?? this.webSocketError());

  constructor() {
    effect(() => {
      const trades = this.tradesService.trades();

      if (trades.length > 0) {
        untracked(() => {
          const symbols = this.tradesService.groupedBySymbol().map((g) => g.symbol);
          this.quotesService.trackQuotes(symbols);
        });
      }
    });

    effect(() => {
      const error = this.combinedError();

      if (error) {
        this.showErrorSnackBar(error);
      }
    });
  }

  closeOrder(id: number): void {
    this.tradesService.removeOrder(id);
    this.showSnackBar(`Order ${id} closed`);
  }

  closeGroup(group: TradeGroupUI): void {
    const ids = group.trades.map((trade) => trade.id).join(', ');
    this.tradesService.removeGroup(group.symbol);
    this.quotesService.untrackQuotes([group.symbol]);
    this.showSnackBar(`Closed all orders for group: ${ids}`);
  }

  toggle(symbol: string) {
    const next = new Set(this.expanded());
    next.has(symbol) ? next.delete(symbol) : next.add(symbol);
    this.expanded.set(next);
  }

  isExpanded(symbol: string) {
    return this.expanded().has(symbol);
  }

  private showSnackBar(msg: string) {
    this.snackBar.open(msg, 'Dismiss', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
    });
  }

  private showErrorSnackBar(msg: string) {
    this.snackBar.open(`ERROR: ${msg}`, 'Dismiss', {
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: ['error-snackbar'],
    });
  }
}
