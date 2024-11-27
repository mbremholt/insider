import { InsiderTransaction } from '@/types/insider';

const BASE_URL = '/api/insider';

export async function fetchInsiderTransactions(): Promise<InsiderTransaction[]> {
  try {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML table
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const rows = doc.querySelectorAll('table tr:not(:first-child)');
    
    return Array.from(rows).map(row => {
      const cells = row.querySelectorAll('td');
      return {
        publishDate: cells[0].textContent?.trim() || '',
        issuer: cells[1].textContent?.trim() || '',
        insider: cells[2].textContent?.trim() || '',
        position: cells[3].textContent?.trim() || '',
        related: cells[4].textContent?.trim() === 'Ja',
        type: cells[5].textContent?.trim() as 'Förvärv' | 'Avyttring',
        instrumentName: cells[6].textContent?.trim() || '',
        instrumentType: cells[7].textContent?.trim() || '',
        isin: cells[8].textContent?.trim() || '',
        transactionDate: cells[9].textContent?.trim() || '',
        volume: parseFloat(cells[10].textContent?.trim()?.replace(/\s/g, '') || '0'),
        volumeUnit: cells[11].textContent?.trim() || '',
        price: parseFloat(cells[12].textContent?.trim()?.replace(/\s/g, '') || '0'),
        currency: cells[13].textContent?.trim() || '',
        details: cells[15].querySelector('a')?.href
      };
    });
  } catch (error) {
    console.error('Error fetching insider transactions:', error);
    return [];
  }
} 