import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { TradesService } from './trades.service';
import { QuotesService } from './quotes.service';

describe('TradesService', () => {
  let service: TradesService;
  let httpMock: HttpTestingController;

  const mockQuotesService = {
    quotes: signal({
      AUDCHF: 0.549435,
      BTCUSD: 67435.18,
    }),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TradesService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: QuotesService, useValue: mockQuotesService },
      ],
    });

    service = TestBed.inject(TradesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should calculate profit using flattened quote record', () => {
    const mockApiResponse = {
      data: [{ id: 1, symbol: 'BTCUSD', openPrice: 67000, side: 'BUY', size: 1, swap: 0 }],
    };

    const req = httpMock.expectOne('https://geeksoft.pl/assets/order-data.json');
    req.flush(mockApiResponse);

    const trades = service.tradesWithProfit();
    const btcTrade = trades.find((t) => t.symbol === 'BTCUSD');

    expect(btcTrade).toBeDefined();
    expect(btcTrade?.profit).toBeGreaterThan(0);
  });

  it('should remove a specific order from the trades list', () => {
    const mockApiResponse = {
      data: [
        { id: 101, symbol: 'AAPL', openPrice: 150, side: 'BUY', size: 1, swap: 0 },
        { id: 102, symbol: 'TSLA', openPrice: 800, side: 'BUY', size: 1, swap: 0 },
      ],
    };
    const req = httpMock.expectOne('https://geeksoft.pl/assets/order-data.json');
    req.flush(mockApiResponse);

    expect(service.trades().length).toBe(2);

    service.removeOrder(101);

    const trades = service.trades();
    expect(trades.length).toBe(1);
    expect(trades[0].id).toBe(102);
    expect(trades.find((t) => t.id === 101)).toBeUndefined();
  });

  it('should remove an entire symbol group from the view', () => {
    const mockApiResponse = {
      data: [
        { id: 1, symbol: 'AAPL', openPrice: 150, side: 'BUY', size: 1, swap: 0 },
        { id: 2, symbol: 'AAPL', openPrice: 155, side: 'BUY', size: 1, swap: 0 },
        { id: 3, symbol: 'BTCUSD', openPrice: 60000, side: 'BUY', size: 1, swap: 0 },
      ],
    };
    const req = httpMock.expectOne('https://geeksoft.pl/assets/order-data.json');
    req.flush(mockApiResponse);

    service.removeGroup('AAPL');

    expect(service.trades().length).toBe(1);
    expect(service.trades()[0].symbol).toBe('BTCUSD');

    const groups = service.groupedBySymbol();
    expect(groups.length).toBe(1);
    expect(groups.find((g) => g.symbol === 'AAPL')).toBeUndefined();
  });
});
