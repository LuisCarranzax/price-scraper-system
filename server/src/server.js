import express from 'express';
import cors from 'cors';
import searchRoutes from './routes/searchRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rutas de API
app.use('/api', searchRoutes);

// Endpoint de estado
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Price Scraper Node Gateway' });
});

app.listen(PORT, () => {
  console.log(`Node Gateway corriendo en http://localhost:${PORT}`);
});

export default app;