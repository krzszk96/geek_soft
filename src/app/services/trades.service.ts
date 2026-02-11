import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { QuotesService } from './quotes.service';
import { SYMBOL_MULTIPLIERS } from '../constants/sumbol-multipliers.const';
import { TradesApiResponse } from '../interfaces/trade-api-response.interface';
import { Side } from '../types/side.type';
import { TradeUI } from '../interfaces/trade-ui.interface';
import { TradeGroupUI } from '../interfaces/trade-group-ui.interface';

@Injectable({ providedIn: 'root' })
export class TradesService {
  private http = inject(HttpClient);
  private quotesService = inject(QuotesService);

  private readonly apiUrl = 'https://geeksoft.pl/assets/order-data.json';
  private removedIds = signal<Set<number>>(new Set());
  private removedSymbols = signal<Set<string>>(new Set());
  private readonly tradesResponse = toSignal(this.http.get<TradesApiResponse>(this.apiUrl), {
    initialValue: null,
  });

  readonly isLoading = computed(() => this.tradesResponse() === null);

  readonly trades = computed(() => {
    const allTrades = this.tradesResponse()?.data ?? [];
    const idsToRemove = this.removedIds();
    const symbolsToRemove = this.removedSymbols();

    return allTrades.filter(
      (trade) => !idsToRemove.has(trade.id) && !symbolsToRemove.has(trade.symbol),
    );
  });

  readonly tradesWithProfit = computed<TradeUI[]>(() => {
    const quotes = this.quotesService.quotes();

    return this.trades().map((trade) => ({
      ...trade,
      profit:
        quotes[trade.symbol] != null
          ? this.calculateProfit(trade.openPrice, quotes[trade.symbol], trade.side, trade.symbol)
          : 0,
    }));
  });

  readonly groupedBySymbol = computed<TradeGroupUI[]>(() => {
    const map = new Map<string, TradeUI[]>();

    for (const trade of this.tradesWithProfit()) {
      map.set(trade.symbol, [...(map.get(trade.symbol) ?? []), trade]);
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

  private calculateProfit(
    openPrice: number,
    currentBid: number,
    side: Side,
    symbol: string,
  ): number {
    const multiplier = 10 ** (SYMBOL_MULTIPLIERS[symbol] ?? 0);
    const sideMultiplier = side === 'BUY' ? 1 : -1;

    return ((currentBid - openPrice) * multiplier * sideMultiplier) / 100;
  }

  removeOrder(id: number) {
    this.removedIds.update((s) => new Set(s).add(id));
  }

  removeGroup(symbol: string) {
    this.removedSymbols.update((s) => new Set(s).add(symbol));
  }
}
