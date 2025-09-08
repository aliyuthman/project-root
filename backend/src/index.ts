import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import dataPlansRouter from './routes/dataPlans';
import transactionsRouter from './routes/transactions';
import paymentsRouter from './routes/payments';
import webhooksRouter from './routes/webhooks';
import healthRouter from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/data-plans', dataPlansRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/webhooks', webhooksRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;