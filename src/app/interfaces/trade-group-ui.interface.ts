import { TradeUI } from './trade-ui.interface';

export interface TradeGroupUI {
  symbol: string;
  trades: TradeUI[];
  count: number;
  totalSize: number;
  totalSwap: number;
  totalProfit: number;
  avgOpenPrice: number;
}
