import express from 'express';
import { body } from 'express-validator';
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  cancelInvoice,
  generateJournalEntry,
  sendInvoice,
  markInvoiceAsPaid
} from '../controllers/invoiceController.js';
import {
  exportInvoicePDF,
  exportInvoiceWord,
  exportInvoiceExcel,
  exportInvoiceJPEG,
  sendInvoiceByEmail,
  getInvoicePreview
} from '../controllers/invoiceExportController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createInvoiceValidation = [
  body('clientId').notEmpty().withMessage('Le client est requis'),
  body('items').isArray({ min: 1 }).withMessage('Au moins un article est requis'),
  body('items.*.description').trim().notEmpty().withMessage('Description de l\'article requise'),
  body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantité invalide'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Prix unitaire invalide'),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Taux de TVA invalide'),
  body('discountRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Taux de remise invalide')
];

const updateInvoiceValidation = [
  body('items').optional().isArray({ min: 1 }).withMessage('Au moins un article est requis'),
  body('items.*.description').optional().trim().notEmpty().withMessage('Description de l\'article requise'),
  body('items.*.quantity').optional().isFloat({ min: 0.01 }).withMessage('Quantité invalide'),
  body('items.*.unitPrice').optional().isFloat({ min: 0 }).withMessage('Prix unitaire invalide'),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Taux de TVA invalide'),
  body('discountRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Taux de remise invalide'),
  body('status').optional().isIn(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']).withMessage('Statut invalide')
];

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes
router.get('/', getInvoices);
router.get('/:id', getInvoice);

router.post('/', authorize('admin', 'accountant', 'manager'), createInvoiceValidation, handleValidationErrors, createInvoice);
router.put('/:id', authorize('admin', 'accountant', 'manager'), updateInvoiceValidation, handleValidationErrors, updateInvoice);
router.delete('/:id', authorize('admin', 'accountant'), deleteInvoice);
router.post('/:id/cancel', authorize('admin', 'accountant', 'manager'), cancelInvoice);

// Actions spéciales
router.post('/:id/generate-journal', authorize('admin', 'accountant'), generateJournalEntry);
router.post('/:id/send', authorize('admin', 'accountant', 'manager'), sendInvoice);
router.post('/:id/mark-paid', authorize('admin', 'accountant', 'manager'), markInvoiceAsPaid);

// Export et envoi
router.get('/:id/preview', getInvoicePreview);
router.get('/:id/export/pdf', exportInvoicePDF);
router.get('/:id/export/word', exportInvoiceWord);
router.get('/:id/export/excel', exportInvoiceExcel);
router.get('/:id/export/jpeg', exportInvoiceJPEG);
router.post('/:id/send-email', authorize('admin', 'accountant', 'manager'), sendInvoiceByEmail);

export default router;