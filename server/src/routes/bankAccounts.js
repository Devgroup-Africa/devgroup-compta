import express from 'express';
import { body } from 'express-validator';
import {
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  recalculateBalance,
  exportBankAccountStatement,
  exportTransactionsList
} from '../controllers/bankAccountController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createBankAccountValidation = [
  body('name').trim().notEmpty().withMessage('Le nom du compte est requis'),
  body('bank').trim().notEmpty().withMessage('Le nom de la banque est requis'),
  body('accountNumber').trim().notEmpty().withMessage('Le numéro de compte est requis'),
  body('iban').optional().trim(),
  body('swift').optional().trim(),
  body('currency').optional().isIn(['XAF', 'EUR', 'USD']).withMessage('Devise invalide'),
  body('type').optional().isIn(['checking', 'savings', 'business']).withMessage('Type de compte invalide'),
  body('initialBalance').optional().isFloat({ min: 0 }).withMessage('Le solde initial doit être positif'),
  body('accountCode').optional().trim(),
  body('description').optional().trim()
];

const updateBankAccountValidation = [
  body('name').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('bank').optional().trim().notEmpty().withMessage('Le nom de la banque ne peut pas être vide'),
  body('accountNumber').optional().trim().notEmpty().withMessage('Le numéro de compte ne peut pas être vide'),
  body('iban').optional().trim(),
  body('swift').optional().trim(),
  body('currency').optional().isIn(['XAF', 'EUR', 'USD']).withMessage('Devise invalide'),
  body('type').optional().isIn(['checking', 'savings', 'business']).withMessage('Type de compte invalide'),
  body('accountCode').optional().trim(),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive doit être un booléen')
];

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes
router.get('/', getAllBankAccounts);
router.get('/:id', getBankAccountById);
router.get('/:id/export/statement', exportBankAccountStatement);
router.get('/:id/export/transactions', exportTransactionsList);
router.post('/:id/recalculate', authorize('admin', 'accountant'), recalculateBalance);

router.post('/', authorize('admin', 'accountant', 'manager'), createBankAccountValidation, handleValidationErrors, createBankAccount);
router.put('/:id', authorize('admin', 'accountant', 'manager'), updateBankAccountValidation, handleValidationErrors, updateBankAccount);
router.delete('/:id', authorize('admin', 'accountant'), deleteBankAccount);

export default router;
