import type { VercelRequest } from '@vercel/node';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const allData: string[] = [];
  
  try {
    // Load 10 pages
    for (let page = 1; page <= 10; page++) {
      const url = `https://marknadssok.fi.se/publiceringsklient/?Page=${page}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Upstream server responded with status: ${response.status}`);
      }
      
      const data = await response.text();
      allData.push(data); // Collect data from each page
    }

    // Combine all data into a single response
    const combinedData = allData.join('\n'); // Join pages with a newline or any other delimiter

    return new Response(combinedData, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*', // Allow CORS
      },
    });
  } catch (error) {
    console.error('Error fetching from target URL:', error);
    return new Response('Error fetching data', { status: 500 });
  }
}