export interface MarketQuote {
  symbol: string;
  price: number;
  changePercent: number;
  updatedAt: number;
}

export interface MarketDataProvider {
  getSnapshot(symbols: string[]): Promise<MarketQuote[]>;
  subscribe(
    symbols: string[],
    onUpdate: (quotes: MarketQuote[]) => void,
  ): () => void;
}
