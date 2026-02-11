import { Side } from '../types/side.type';

export interface Trade {
  openTime: number;
  openPrice: number;
  swap: number;
  id: number;
  symbol: string;
  side: Side;
  size: number;
}
