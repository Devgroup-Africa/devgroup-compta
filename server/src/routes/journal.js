import express from 'express';
import { body } from 'express-validator';
import {
  getJournalEntries,
  getJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  validateJournalEntry,
  cancelJournalEntry,
  getGeneralLedger
} from '../controllers/journalController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createJournalEntryValidation = [
  body('description').trim().notEmpty().withMessage('La description est requise'),
  body('entries').isArray({ min: 2 }).withMessage('Au moins 2 lignes d\'écriture sont requises'),
  body('entries.*.account').notEmpty().withMessage('Le compte est requis'),
  body('entries.*.debit').optional().isFloat({ min: 0 }).withMessage('Le débit doit être positif'),
  body('entries.*.credit').optional().isFloat({ min: 0 }).withMessage('Le crédit doit être positif'),
  body('date').optional().isISO8601().withMessage('Date invalide')
];

const updateJournalEntryValidation = [
  body('description').optional().trim().notEmpty().withMessage('La description ne peut pas être vide'),
  body('entries').optional().isArray({ min: 2 }).withMessage('Au moins 2 lignes d\'écriture sont requises'),
  body('entries.*.account').optional().notEmpty().withMessage('Le compte est requis'),
  body('entries.*.debit').optional().isFloat({ min: 0 }).withMessage('Le débit doit être positif'),
  body('entries.*.credit').optional().isFloat({ min: 0 }).withMessage('Le crédit doit être positif'),
  body('date').optional().isISO8601().withMessage('Date invalide')
];

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes
router.get('/', getJournalEntries);
router.get('/general-ledger', getGeneralLedger);
router.get('/:id', getJournalEntry);

router.post('/', authorize('admin', 'accountant'), createJournalEntryValidation, handleValidationErrors, createJournalEntry);
router.put('/:id', authorize('admin', 'accountant'), updateJournalEntryValidation, handleValidationErrors, updateJournalEntry);
router.delete('/:id', authorize('admin', 'accountant'), deleteJournalEntry);

// Actions spéciales
router.post('/:id/validate', authorize('admin', 'accountant'), validateJournalEntry);
router.post('/:id/cancel', authorize('admin', 'accountant'), cancelJournalEntry);

export default router;