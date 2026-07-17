import express from 'express';
import { body } from 'express-validator';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientStats
} from '../controllers/clientController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createClientValidation = [
  body('name').trim().notEmpty().withMessage('Le nom du client est requis'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('paymentTerms').optional().isInt({ min: 0 }).withMessage('Délai de paiement invalide'),
  body('creditLimit').optional().isFloat({ min: 0 }).withMessage('Limite de crédit invalide')
];

const updateClientValidation = [
  body('name').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('paymentTerms').optional().isInt({ min: 0 }).withMessage('Délai de paiement invalide'),
  body('creditLimit').optional().isFloat({ min: 0 }).withMessage('Limite de crédit invalide'),
  body('isActive').optional().isBoolean().withMessage('isActive doit être un booléen')
];

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes
router.get('/', getClients);
router.get('/:id', getClient);
router.get('/:id/stats', getClientStats);

router.post('/', authorize('admin', 'accountant', 'manager'), createClientValidation, handleValidationErrors, createClient);
router.put('/:id', authorize('admin', 'accountant', 'manager'), updateClientValidation, handleValidationErrors, updateClient);
router.delete('/:id', authorize('admin', 'accountant'), deleteClient);

export default router;
