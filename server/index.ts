import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get('/api/insider', async (req, res) => {
  try {
    const response = await fetch('https://marknadssok.fi.se/publiceringsklient');
    const html = await response.text();
    res.send(html);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
}); 