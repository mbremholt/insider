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

async function fetchStockPrice(symbol: string): Promise<{ currentPrice: number, changePercent: number } | null> {
  try {
    const response = await fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`);
    const data = await response.json();
    
    if (data.chart.result?.[0]) {
      const result = data.chart.result[0];
      const currentPrice = result.meta.regularMarketPrice;
      const previousClose = result.meta.previousClose;
      const changePercent = ((currentPrice - previousClose) / previousClose) * 100;
      
      return {
        currentPrice,
        changePercent
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
}

export async function fetchInsiderTransactions(): Promise<InsiderTransaction[]> {
  try {
    const response = await fetch('/api/insider');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const htmlPages = (await response.text()).split('\n');
    const allTransactions: InsiderTransaction[] = [];
    
    for (const html of htmlPages) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const rows = doc.querySelectorAll('table tr:not(:first-child)');
      
      const pageTransactions = await Promise.all(Array.from(rows).map(async row => {
        const cells = row.querySelectorAll('td');
        const companyName = cells[1]?.textContent?.trim() || '';
        const symbol = COMPANY_SYMBOLS[companyName];
        let stockData = null;
        
        if (symbol) {
          stockData = await fetchStockPrice(symbol);
        }
        
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
          currentPrice: stockData?.currentPrice,
          priceChange: stockData?.changePercent,
          symbol
        };
      }));
      
      allTransactions.push(...pageTransactions);
    }
    
    return allTransactions;
  } catch (error) {
    console.error('Error fetching insider transactions:', error);
    throw error;
  }
} 