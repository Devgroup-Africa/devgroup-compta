import express from 'express';
import { body } from 'express-validator';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createTransfer,
  exportAllTransactions
} from '../controllers/treasuryController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createTransactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Type de transaction invalide'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Le montant doit être supérieur à 0'),
  body('description').trim().notEmpty().withMessage('La description est requise'),
  body('category').trim().notEmpty().withMessage('La catégorie est requise'),
  body('date').optional().isISO8601().withMessage('Date invalide'),
  body('reference').optional().trim(),
  body('bankAccount').optional().isMongoId().withMessage('ID de compte bancaire invalide'),
  body('account').isMongoId().withMessage('ID de compte comptable requis'),
  body('notes').optional().trim()
];

const updateTransactionValidation = [
  body('type').optional().isIn(['income', 'expense']).withMessage('Type de transaction invalide'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Le montant doit être supérieur à 0'),
  body('description').optional().trim().notEmpty().withMessage('La description ne peut pas être vide'),
  body('category').optional().trim().notEmpty().withMessage('La catégorie ne peut pas être vide'),
  body('date').optional().isISO8601().withMessage('Date invalide'),
  body('reference').optional().trim(),
  body('bankAccount').optional().isMongoId().withMessage('ID de compte bancaire invalide'),
  body('account').optional().isMongoId().withMessage('ID de compte comptable invalide'),
  body('notes').optional().trim(),
  body('status').optional().isIn(['pending', 'confirmed', 'cancelled']).withMessage('Statut invalide')
];

const createTransferValidation = [
  body('sourceAccount').isMongoId().withMessage('ID de compte source requis'),
  body('destinationAccount').isMongoId().withMessage('ID de compte destination requis'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Le montant doit être supérieur à 0'),
  body('date').optional().isISO8601().withMessage('Date invalide'),
  body('reference').optional().trim(),
  body('description').optional().trim()
];

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes
router.get('/', getAllTransactions);
router.get('/export', exportAllTransactions);
router.get('/:id', getTransactionById);

router.post('/', authorize('admin', 'accountant', 'manager'), createTransactionValidation, handleValidationErrors, createTransaction);
router.post('/transfer', authorize('admin', 'accountant', 'manager'), createTransferValidation, handleValidationErrors, createTransfer);
router.put('/:id', authorize('admin', 'accountant', 'manager'), updateTransactionValidation, handleValidationErrors, updateTransaction);
router.delete('/:id', authorize('admin', 'accountant'), deleteTransaction);

export default router;
