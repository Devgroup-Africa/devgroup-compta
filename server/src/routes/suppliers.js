import express from 'express';
import { body } from 'express-validator';
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierStats
} from '../controllers/supplierController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createSupplierValidation = [
  body('name').trim().notEmpty().withMessage('Le nom du fournisseur est requis'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('paymentTerms').optional().isInt({ min: 1 }).withMessage('Délai de paiement invalide')
];

const updateSupplierValidation = [
  body('name').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('paymentTerms').optional().isInt({ min: 1 }).withMessage('Délai de paiement invalide'),
  body('isActive').optional().isBoolean().withMessage('isActive doit être un booléen')
];

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes
router.get('/', getSuppliers);
router.get('/:id', getSupplier);
router.get('/:id/stats', getSupplierStats);

router.post('/', authorize('admin', 'accountant', 'manager'), createSupplierValidation, handleValidationErrors, createSupplier);
router.put('/:id', authorize('admin', 'accountant', 'manager'), updateSupplierValidation, handleValidationErrors, updateSupplier);
router.delete('/:id', authorize('admin', 'accountant'), deleteSupplier);

export default router;