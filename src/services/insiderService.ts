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
            } else {
              console.warn(`No data for symbol: ${symbol}`);
            }
          })
          .catch(error => console.error(`Error fetching ${symbol}:`, error))
      );
      
      await Promise.all(promises);
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
    console.log('Starting to fetch insider transactions...');
    const allTransactions: InsiderTransaction[] = [];
    const symbols: string[] = []; // To collect all symbols

    // Fetch data from the proxy which now loads 10 pages
    const response = await fetch(`/api/insider`);
    
    if (!response.ok) {
      throw new Error(`Upstream server responded with status: ${response.status}`);
    }
    
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // Find all tables in the document
    const tables = doc.querySelectorAll('table');
    console.log('Number of tables found:', tables.length);
    
    // Iterate through each table found
    tables.forEach((table) => {
      const rows = table.querySelectorAll('tr:not(:first-child)');
      console.log('Found rows in table:', rows.length);
      
      const pageTransactions = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        const issuer = cells[1]?.textContent?.trim() || '';
        const symbol = findCompanySymbol(issuer); // Use the new function to find the symbol
        if (symbol) {
          symbols.push(symbol); // Collect symbols for stock price fetching
        }
        
        return {
          publishDate: cells[0]?.textContent?.trim() || '',
          issuer,
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
        };
      });
      
      console.log('Parsed transactions in table:', pageTransactions.length);
      allTransactions.push(...pageTransactions);
    });
    
    console.log('Total transactions parsed:', allTransactions.length);
    
    // Log all collected symbols before fetching stock prices
    console.log('Symbols to be fetched:', symbols);

    // Fetch stock prices for all collected symbols
    const stockPrices = await fetchStockPrices(symbols);

    console.log('Fetched stock prices:', stockPrices);
    
    // Add stock prices to transactions
    return allTransactions.map(transaction => {
      const symbol = findCompanySymbol(transaction.issuer); // Find the symbol based on the issuer
      const stockData = symbol ? stockPrices.get(symbol) : undefined; // Get stock data using the found symbol

      // Calculate Change %
      const changePercent = stockData && transaction.price 
        ? ((stockData.currentPrice - transaction.price) / transaction.price) * 100
        : null; // Set to null if stockData or transaction.price is not available

      if (stockData) {
        return {
          ...transaction,
          currentPrice: stockData.currentPrice,
          priceChange: changePercent // Add the calculated change percentage
        };
      }
      return {
        ...transaction,
        currentPrice: null, // or a default value
        priceChange: null // or a default value
      };
    });
    
  } catch (error) {
    console.error('Error fetching insider transactions:', error);
    throw error;
  }
}

// Function to find the company symbol based on issuer name
function findCompanySymbol(issuer: string): string | undefined {
  const normalizedIssuer = issuer.toLowerCase();
  for (const [companyName, symbol] of Object.entries(COMPANY_SYMBOLS)) {
    if (normalizedIssuer.includes(companyName.toLowerCase())) {
      return symbol; // Return the symbol if a match is found
    }
  }
  return undefined; // Return undefined if no match is found
} 