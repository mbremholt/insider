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

async function fetchStockPrice(): Promise<{ currentPrice: number, changePercent: number } | null> {
  try {
    console.log('Fetching stock price for BOL.ST...');
    const response = await fetch(`/api/stock?symbol=BOL.ST`);
    console.log('Stock API response status:', response.status);
    const data = await response.json();
    console.log('Stock API data:', data);
    
    if (data.chart?.result?.[0]) {
      const result = data.chart.result[0];
      const currentPrice = result.meta.regularMarketPrice;
      const previousClose = result.meta.chartPreviousClose || result.meta.previousClose;
      
      console.log('Current price:', currentPrice);
      console.log('Previous close:', previousClose);
      
      const stockData = {
        currentPrice,
        changePercent: previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0
      };
      console.log('Processed stock data:', stockData);
      return stockData;
    }
    console.log('No stock data found in response');
    return null;
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return null;
  }
}

export async function fetchInsiderTransactions(): Promise<InsiderTransaction[]> {
  try {
    console.log('Starting to fetch insider transactions...');
    const response = await fetch('/api/insider');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('Received response text length:', text.length);
    
    const htmlPages = text.split('\n');
    console.log('Number of pages:', htmlPages.length);
    
    const allTransactions: InsiderTransaction[] = [];
    
    // Fetch stock price once
    const stockData = await fetchStockPrice();
    console.log('Stock data:', stockData);
    
    for (const html of htmlPages) {
      if (!html.trim()) {
        console.log('Skipping empty page');
        continue;
      }
      
      console.log('HTML content of page:', html);
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const rows = doc.querySelectorAll('table tr:not(:first-child)');
      console.log('Found rows in page:', rows.length);
      
      const pageTransactions = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        console.log('Row cells:', cells.length);
        const transaction = {
          publishDate: cells[0]?.textContent?.trim() || '',
          issuer: cells[1]?.textContent?.trim() || '',
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
          priceChange: stockData?.changePercent
        };
        return transaction;
      });
      
      console.log('Parsed transactions in page:', pageTransactions.length);
      allTransactions.push(...pageTransactions);
    }
    
    console.log('Total transactions parsed:', allTransactions.length);
    return allTransactions;
    
  } catch (error) {
    console.error('Error fetching insider transactions:', error);
    throw error;
  }
} 