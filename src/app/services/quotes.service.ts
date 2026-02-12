import { Injectable, signal } from '@angular/core';
import { Quote } from '../interfaces/quote.interface';

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private ws?: WebSocket;

  private readonly _quotes = signal<Record<string, number>>({});
  readonly quotes = this._quotes.asReadonly();

  private readonly _quoteError = signal<string | null>(null);
  readonly quoteError = this._quoteError.asReadonly();

  connect() {
    if (this.ws) return;

    this.ws = new WebSocket('wss://webquotes.geeksoft.pl/websocket/quotes');

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this._quoteError.set(null);
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      this._quoteError.set('WebSocket connection error');
    };

    this.ws.onclose = (event) => {
      console.warn('WebSocket closed', event);
      if (!event.wasClean) {
        this._quoteError.set('WebSocket connection closed unexpectedly');
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.p === '/quotes/subscribed') {
          const next = { ...this._quotes() };

          for (const q of msg.d as Quote[]) {
            next[q.s] = q.b;
          }

          this._quotes.set(next);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
        this._quoteError.set('Invalid message from server');
      }
    };
  }

  trackQuotes(symbols: string[]) {
    this.connect();

    const sendWhenOpen = () => {
      if (this.ws!.readyState === WebSocket.OPEN) {
        this.ws!.send(JSON.stringify({ p: '/subscribe/addlist', d: symbols }));
      } else {
        this.ws!.addEventListener(
          'open',
          () => {
            this.ws!.send(JSON.stringify({ p: '/subscribe/addlist', d: symbols }));
          },
          { once: true },
        );
      }
    };

    sendWhenOpen();
  }

  untrackQuotes(symbols: string[]) {
    this.ws?.send(
      JSON.stringify({
        p: '/subscribe/removelist',
        d: symbols,
      }),
    );
  }
}
