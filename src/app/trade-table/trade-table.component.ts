import { Component, inject, signal, effect } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { TradesService } from '../services/trades.service';
import { QuotesService } from '../services/quotes.service';

@Component({
  selector: 'app-trade-table',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
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
  tradesService = inject(TradesService);
  quotesService = inject(QuotesService);

  expanded = signal<Set<string>>(new Set());

  constructor() {
    // TODO: change to untracked
    effect(() => {
      const symbols = this.tradesService.groupedBySymbol().map((g) => g.symbol);

      this.quotesService.subscribe(symbols);
      // this.quotesService.subscribe(['AUDCHF']);
    });
  }

  toggle(symbol: string) {
    const next = new Set(this.expanded());
    next.has(symbol) ? next.delete(symbol) : next.add(symbol);
    this.expanded.set(next);
  }

  isExpanded(symbol: string) {
    return this.expanded().has(symbol);
  }
}
