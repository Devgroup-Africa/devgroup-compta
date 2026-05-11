import { JournalEntry } from '../models/JournalEntry.js';
import { Account } from '../models/Account.js';
import { asyncHandler } from '../middleware/validation.js';

export const getJournalEntries = asyncHandler(async (req, res) => {
  const { status, startDate, endDate, accountId, search } = req.query;
  
  let filter = {};
  
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { reference: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  
  if (accountId) {
    filter['entries.account'] = accountId;
  }
  
  const journalEntries = await JournalEntry.find(filter)
    .populate('entries.account', 'code name')
    .populate('createdBy', 'name')
    .populate('validatedBy', 'name')
    .sort({ date: -1 });
  
  res.json({
    journalEntries,
    total: journalEntries.length
  });
});

export const getJournalEntry = asyncHandler(async (req, res) => {
  const journalEntry = await JournalEntry.findById(req.params.id)
    .populate('entries.account', 'code name type')
    .populate('createdBy', 'name email')
    .populate('validatedBy', 'name email');
  
  if (!journalEntry) {
    return res.status(404).json({ message: 'Écriture non trouvée' });
  }
  
  res.json({ journalEntry });
});

export const createJournalEntry = asyncHandler(async (req, res) => {
  const { date, reference, description, entries } = req.body;
  
  // Valider que tous les comptes existent
  const accountIds = entries.map(entry => entry.account);
  const accounts = await Account.find({ _id: { $in: accountIds } });
  
  if (accounts.length !== accountIds.length) {
    return res.status(400).json({ message: 'Un ou plusieurs comptes sont invalides' });
  }
  
  // Calculer le total pour validation
  const totalDebit = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  
  const journalEntry = await JournalEntry.create({
    date: date || new Date(),
    reference,
    description,
    entries,
    sourceType: 'manual',
    createdBy: req.user._id
  });
  
  await journalEntry.populate('entries.account', 'code name');
  
  res.status(201).json({
    message: 'Écriture créée avec succès',
    journalEntry
  });
});

export const updateJournalEntry = asyncHandler(async (req, res) => {
  const { date, reference, description, entries } = req.body;
  
  const journalEntry = await JournalEntry.findById(req.params.id);
  if (!journalEntry) {
    return res.status(404).json({ message: 'Écriture non trouvée' });
  }
  
  // Vérifier si l'écriture peut être modifiée
  if (journalEntry.status === 'validated') {
    return res.status(400).json({ message: 'Impossible de modifier une écriture validée' });
  }
  
  // Valider que tous les comptes existent si entries est fourni
  if (entries) {
    const accountIds = entries.map(entry => entry.account);
    const accounts = await Account.find({ _id: { $in: accountIds } });
    
    if (accounts.length !== accountIds.length) {
      return res.status(400).json({ message: 'Un ou plusieurs comptes sont invalides' });
    }
  }
  
  // Mettre à jour les champs
  if (date) journalEntry.date = date;
  if (reference !== undefined) journalEntry.reference = reference;
  if (description) journalEntry.description = description;
  if (entries) journalEntry.entries = entries;
  
  await journalEntry.save();
  await journalEntry.populate('entries.account', 'code name');
  
  res.json({
    message: 'Écriture mise à jour',
    journalEntry
  });
});

export const deleteJournalEntry = asyncHandler(async (req, res) => {
  const journalEntry = await JournalEntry.findById(req.params.id);
  if (!journalEntry) {
    return res.status(404).json({ message: 'Écriture non trouvée' });
  }
  
  // Vérifier si l'écriture peut être supprimée
  if (journalEntry.status === 'validated') {
    return res.status(400).json({ message: 'Impossible de supprimer une écriture validée' });
  }
  
  await journalEntry.deleteOne();
  
  res.json({ message: 'Écriture supprimée' });
});

export const validateJournalEntry = asyncHandler(async (req, res) => {
  const journalEntry = await JournalEntry.findById(req.params.id);
  if (!journalEntry) {
    return res.status(404).json({ message: 'Écriture non trouvée' });
  }
  
  if (journalEntry.status === 'validated') {
    return res.status(400).json({ message: 'Écriture déjà validée' });
  }
  
  await journalEntry.validate(req.user._id);
  await journalEntry.populate('entries.account', 'code name');
  
  res.json({
    message: 'Écriture validée',
    journalEntry
  });
});

export const cancelJournalEntry = asyncHandler(async (req, res) => {
  const journalEntry = await JournalEntry.findById(req.params.id);
  if (!journalEntry) {
    return res.status(404).json({ message: 'Écriture non trouvée' });
  }
  
  await journalEntry.cancel();
  
  res.json({
    message: 'Écriture annulée',
    journalEntry
  });
});

export const getGeneralLedger = asyncHandler(async (req, res) => {
  const { accountId, startDate, endDate } = req.query;
  
  if (!accountId) {
    return res.status(400).json({ message: 'ID du compte requis' });
  }
  
  const account = await Account.findById(accountId);
  if (!account) {
    return res.status(404).json({ message: 'Compte non trouvé' });
  }
  
  let filter = {
    'entries.account': accountId,
    status: 'validated'
  };
  
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  
  const entries = await JournalEntry.find(filter)
    .populate('entries.account', 'code name')
    .sort({ date: 1 });
  
  // Calculer le solde cumulé
  let runningBalance = 0;
  const ledgerEntries = [];
  
  for (const entry of entries) {
    const accountEntry = entry.entries.find(e => e.account._id.toString() === accountId);
    if (accountEntry) {
      const amount = accountEntry.debit - accountEntry.credit;
      
      // Ajuster selon le type de compte
      if (['asset', 'expense'].includes(account.type)) {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }
      
      ledgerEntries.push({
        date: entry.date,
        reference: entry.reference,
        description: entry.description,
        debit: accountEntry.debit,
        credit: accountEntry.credit,
        balance: runningBalance
      });
    }
  }
  
  res.json({
    account: {
      _id: account._id,
      code: account.code,
      name: account.name,
      type: account.type
    },
    entries: ledgerEntries,
    finalBalance: runningBalance
  });
});