// Configuration - DOIT ÊTRE EN PREMIER pour charger les variables d'environnement
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/database.js';
import { errorHandler } from './middleware/validation.js';

// Models - Import to register with Mongoose
import './models/User.js';
import './models/Account.js';
import './models/Client.js';
import './models/Supplier.js';
import './models/Invoice.js';
import './models/Payment.js';
import './models/JournalEntry.js';
import './models/Transaction.js';
import './models/BankAccount.js';
import './models/CompanySettings.js';
import './models/Purchase.js';

// Routes
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import clientRoutes from './routes/clients.js';
import supplierRoutes from './routes/suppliers.js';
import invoiceRoutes from './routes/invoices.js';
import journalRoutes from './routes/journal.js';
import bankAccountRoutes from './routes/bankAccounts.js';
import transactionRoutes from './routes/transactions.js';
import treasuryRoutes from './routes/treasury.js';
import companySettingsRoutes from './routes/companySettings.js';
import purchaseRoutes from './routes/purchases.js';
import aiRoutes from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connexion à la base de données
connectDB();

// Middleware de sécurité
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/treasury', treasuryRoutes);
app.use('/api/company-settings', companySettingsRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/ai', aiRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestionnaire d'erreurs global
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(` Serveur démarré sur le port ${PORT}`);
  console.log(` Environnement: ${process.env.NODE_ENV}`);
  console.log(` API disponible sur: http://localhost:${PORT}/api`);
});

export default app;
