import express from 'express';
import { body } from 'express-validator';
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountBalance,
  getTrialBalance
} from '../controllers/accountController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createAccountValidation = [
  body('code').trim().notEmpty().withMessage('Code compte requis'),
  body('name').trim().notEmpty().withMessage('Nom du compte requis'),
  body('type').isIn(['asset', 'liability', 'equity', 'expense', 'revenue']).withMessage('Type de compte invalide')
];

const updateAccountValidation = [
  body('name').optional().trim().notEmpty().withMessage('Nom du compte ne peut pas être vide'),
  body('isActive').optional().isBoolean().withMessage('isActive doit être un booléen')
];

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes
router.get('/', getAccounts);
router.get('/trial-balance', authorize('admin', 'accountant'), getTrialBalance);
router.get('/:id', getAccount);
router.get('/:id/balance', getAccountBalance);

router.post('/', authorize('admin', 'accountant'), createAccountValidation, handleValidationErrors, createAccount);
router.put('/:id', authorize('admin', 'accountant'), updateAccountValidation, handleValidationErrors, updateAccount);
router.delete('/:id', authorize('admin'), deleteAccount);

export default router;