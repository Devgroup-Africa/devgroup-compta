import express from 'express';
import {
  getDashboard,
  getCashFlow,
  getCategorySummary
} from '../controllers/treasuryController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes
router.get('/dashboard', getDashboard);
router.get('/cash-flow', getCashFlow);
router.get('/categories', getCategorySummary);

export default router;
