import type { VercelRequest } from '@vercel/node';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    const response = await fetch('https://marknadssok.fi.se/publiceringsklient');
    
    if (!response.ok) {
      throw new Error(`Upstream server responded with status: ${response.status}`);
    }
    
    const html = await response.text();
    
    return new Response(html, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Detailed error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}