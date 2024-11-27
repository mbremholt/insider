import { InsiderTransaction } from '@/types/insider';

const COMPANY_SYMBOLS: { [key: string]: string } = {
  'ABB': 'ABB.ST',
  'Alfa Laval': 'ALFA.ST',
  'Assa Abloy': 'ASSA-B.ST',
  'Atlas Copco': 'ATCO-A.ST',
  'Autoliv': 'ALIV-SDB.ST',
  'Boliden': 'BOL.ST',
  'Electrolux': 'ELUX-B.ST',
  'Ericsson': 'ERIC-B.ST',
  'Essity': 'ESSITY-B.ST',
  'Evolution Gaming': 'EVO.ST',
  'Getinge': 'GETI-B.ST',
  'H&M': 'HM-B.ST',
  'Hexagon': 'HEXA-B.ST',
  'Investor': 'INVE-B.ST',
  'Kinnevik': 'KINV-B.ST',
  'Nordea': 'NDA-SE.ST',
  'Sandvik': 'SAND.ST',
  'SCA': 'SCA-B.ST',
  'SEB': 'SEB-A.ST',
  'Securitas': 'SECU-B.ST',
  'SKF': 'SKF-B.ST',
  'SSAB': 'SSAB-A.ST',
  'Swedbank': 'SWED-A.ST',
  'Swedish Match': 'SWMA.ST',
  'Tele2': 'TEL2-B.ST',
  'Telia': 'TELIA.ST',
  'Volvo': 'VOLV-B.ST',
  'Skanska': 'SKA-B.ST',
  'Sinch': 'SINCH.ST',
  'Nibe': 'NIBE-B.ST'
};

async function fetchStockPrices(symbols: string[]): Promise<Map<string, { currentPrice: number, changePercent: number }>> {
  const uniqueSymbols = [...new Set(symbols)];
  const priceMap = new Map();

  try {
    // Fetch prices in batches of 5 to avoid rate limits
    for (let i = 0; i < uniqueSymbols.length; i += 5) {
      const batch = uniqueSymbols.slice(i, i + 5);
      const promises = batch.map(symbol => 
        fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`)
          .then(res => res.json())
          .then(data => {
            if (data.chart?.result?.[0]) {
              const result = data.chart.result[0];
              priceMap.set(symbol, {
                currentPrice: result.meta.regularMarketPrice,
                changePercent: ((result.meta.regularMarketPrice - result.meta.previousClose) / result.meta.previousClose) * 100
              });
            }
          })
          .catch(error => console.error(`Error fetching ${symbol}:`, error))
      );
      
      await Promise.all(promises);
      // Small delay between batches
      if (i + 5 < uniqueSymbols.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (error) {
    console.error('Error fetching stock prices:', error);
  }

  return priceMap;
}

export async function fetchInsiderTransactions(): Promise<InsiderTransaction[]> {
  try {
    const response = await fetch('/api/insider');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const htmlPages = (await response.text()).split('\n');
    const allTransactions: InsiderTransaction[] = [];
    
    // First parse all transactions without stock prices
    for (const html of htmlPages) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const rows = doc.querySelectorAll('table tr:not(:first-child)');
      
      const pageTransactions = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        const companyName = cells[1]?.textContent?.trim() || '';
        const symbol = COMPANY_SYMBOLS[companyName];
        
        return {
          publishDate: cells[0]?.textContent?.trim() || '',
          issuer: companyName,
          insider: cells[2]?.textContent?.trim() || '',
          position: cells[3]?.textContent?.trim() || '',
          related: cells[4]?.textContent?.trim() === 'Ja',
          type: cells[5]?.textContent?.trim() as 'Förvärv' | 'Avyttring',
          instrumentName: cells[6]?.textContent?.trim() || '',
          instrumentType: cells[7]?.textContent?.trim() || '',
          isin: cells[8]?.textContent?.trim() || '',
          transactionDate: cells[9]?.textContent?.trim() || '',
          volume: parseFloat(cells[10]?.textContent?.trim()?.replace(/\s/g, '') || '0'),
          volumeUnit: cells[11]?.textContent?.trim() || '',
          price: parseFloat(cells[12]?.textContent?.trim()?.replace(/\s/g, '') || '0'),
          currency: cells[13]?.textContent?.trim() || '',
          details: cells[15]?.querySelector('a')?.href,
          symbol
        };
      });
      
      allTransactions.push(...pageTransactions);
    }
    
    // Then fetch all stock prices at once
    const symbols = allTransactions
      .map(t => t.symbol)
      .filter((symbol): symbol is string => !!symbol);
    
    const stockPrices = await fetchStockPrices(symbols);
    
    // Add stock prices to transactions
    return allTransactions.map(transaction => {
      if (transaction.symbol) {
        const stockData = stockPrices.get(transaction.symbol);
        if (stockData) {
          return {
            ...transaction,
            currentPrice: stockData.currentPrice,
            priceChange: stockData.changePercent
          };
        }
      }
      return transaction;
    });
    
  } catch (error) {
    console.error('Error fetching insider transactions:', error);
    throw error;
  }
} 