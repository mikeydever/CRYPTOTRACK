import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.route';
import transactionRoutes from './routes/transaction.route';
import portfolioRoutes from './routes/portfolio.route';
import alertRoutes from './routes/alert.route';

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/', (req, res) => {
  res.send('Hello from CryptoTrack Server!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
