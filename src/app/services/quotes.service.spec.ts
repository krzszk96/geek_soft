import { TestBed } from '@angular/core/testing';
import { QuotesService } from './quotes.service';
import { Quote } from '../interfaces/quote.interface';

describe('QuotesService', () => {
  let service: QuotesService;

  let mockWebSocket: any;
  let wsSendSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuotesService],
    });

    service = TestBed.inject(QuotesService);

    wsSendSpy = jasmine.createSpy('send');
    mockWebSocket = {
      send: wsSendSpy,
      readyState: WebSocket.OPEN,
      addEventListener: (event: string, cb: any) => {
        if (event === 'open') cb();
      },
      onmessage: null,
    };

    spyOn(window as any, 'WebSocket').and.returnValue(mockWebSocket);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should connect and update quotes when message received', () => {
    service.connect();

    const msg: any = {
      p: '/quotes/subscribed',
      d: [
        { s: 'AAPL', b: 150 },
        { s: 'TSLA', b: 800 },
      ] as Quote[],
    };

    mockWebSocket.onmessage!({ data: JSON.stringify(msg) });

    const quotes = service.quotes();
    expect(quotes['AAPL']).toBe(150);
    expect(quotes['TSLA']).toBe(800);
  });

  it('should send subscribe message when tracking quotes', () => {
    service.trackQuotes(['AAPL', 'TSLA']);

    expect(wsSendSpy).toHaveBeenCalledWith(
      JSON.stringify({ p: '/subscribe/addlist', d: ['AAPL', 'TSLA'] }),
    );
  });

  it('should send untrack message when untracking quotes', () => {
    service.connect();
    service.untrackQuotes(['AAPL']);

    expect(wsSendSpy).toHaveBeenCalledWith(
      JSON.stringify({ p: '/subscribe/removelist', d: ['AAPL'] }),
    );
  });
});
