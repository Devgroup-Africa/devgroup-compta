import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  markPurchaseAsPaid,
  cancelPurchase,
  deletePurchase,
  exportPurchasePDF,
  exportPurchaseExcel,
  exportPurchasesListExcel,
  getPurchaseStats
} from '../controllers/purchaseController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes CRUD
router.post('/', createPurchase);
router.get('/', getPurchases);
router.get('/stats', getPurchaseStats);
router.get('/:id', getPurchaseById);
router.put('/:id', updatePurchase);
router.delete('/:id', deletePurchase);

// Actions spécifiques
router.post('/:id/pay', markPurchaseAsPaid);
router.post('/:id/cancel', cancelPurchase);

// Export routes
router.get('/:id/export/pdf', exportPurchasePDF);
router.get('/:id/export/excel', exportPurchaseExcel);
router.get('/export/list', exportPurchasesListExcel);

export default router;
