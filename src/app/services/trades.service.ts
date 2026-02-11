import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { QuotesService } from './quotes.service';
import { SYMBOL_MULTIPLIERS } from '../constants/sumbol-multipliers.const';
import { TradesApiResponse } from '../interfaces/trade-api-response.interface';
import { Side } from '../types/side.type';

@Injectable({ providedIn: 'root' })
export class TradesService {
  private http = inject(HttpClient);
  private quotesService = inject(QuotesService);
  private readonly apiUrl = 'https://geeksoft.pl/assets/order-data.json';

  private readonly tradesResponse = toSignal(this.http.get<TradesApiResponse>(this.apiUrl), {
    initialValue: { data: [] },
  });

  readonly trades = computed(() => this.tradesResponse().data);

  readonly tradesWithProfit = computed(() => {
    const quotes = this.quotesService.quotes();

    return this.trades().map((trade) => ({
      ...trade,
      profit:
        quotes[trade.symbol] != null
          ? this.calculateProfit(trade.openPrice, quotes[trade.symbol], trade.side, trade.symbol)
          : 0,
    }));
  });

  readonly groupedBySymbol = computed(() => {
    const map = new Map<string, any[]>();

    for (const t of this.tradesWithProfit()) {
      map.set(t.symbol, [...(map.get(t.symbol) ?? []), t]);
    }

    return Array.from(map.entries()).map(([symbol, trades]) => ({
      symbol,
      trades,
      count: trades.length,
      totalSize: trades.reduce((a, t) => a + t.size, 0),
      totalSwap: trades.reduce((a, t) => a + t.swap, 0),
      totalProfit: trades.reduce((a, t) => a + t.profit, 0),
      avgOpenPrice: trades.reduce((a, t) => a + t.openPrice, 0) / trades.length,
    }));
  });

  calculateProfit(openPrice: number, currentBid: number, side: Side, symbol: string): number {
    const multiplier = 10 ** (SYMBOL_MULTIPLIERS[symbol] ?? 0);
    const sideMultiplier = side === 'BUY' ? 1 : -1;

    return ((currentBid - openPrice) * multiplier * sideMultiplier) / 100;
  }
}
