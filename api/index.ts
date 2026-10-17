import express, { Request, Response } from 'express';
import apiRouter from '../server/routes.ts';

const app = express();

// Standard CORS configuration for Vercel Serverless deployments and preview branches
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// JSON & URL-encoded request body parsing with generous limits
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Health check endpoints for uptime monitoring
app.get(['/api/health', '/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    server: 'Zero Craftlabb Vercel Serverless Function',
    time: new Date().toISOString(),
  });
});

// Root API information endpoint
app.get(['/api', '/'], (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    app: 'Zero Craftlabb API',
    endpoints: [
      '/api/products',
      '/api/categories',
      '/api/orders',
      '/api/settings',
      '/api/health',
    ],
  });
});

// Mount the API router at both '/api' and '/'
// This guarantees that whether Vercel rewrites /api/products -> /api/products or /products,
// the route handler will always match cleanly without 404s!
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
