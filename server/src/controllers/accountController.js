import { Account } from '../models/Account.js';
import { JournalEntry } from '../models/JournalEntry.js';
import { asyncHandler } from '../middleware/validation.js';

export const getAccounts = asyncHandler(async (req, res) => {
  const { type, parent, search } = req.query;
  
  let filter = { isActive: true };
  
  if (type) filter.type = type;
  if (parent) filter.parent = parent;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }
  
  const accounts = await Account.find(filter)
    .populate('parent', 'code name')
    .populate('children')
    .sort({ code: 1 });
  
  // Calculer les soldes pour chaque compte
  for (const account of accounts) {
    account.currentBalance = await account.calculateBalance();
  }
  
  res.json({
    accounts,
    total: accounts.length
  });
});

export const getAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id)
    .populate('parent', 'code name')
    .populate('children');
  
  if (!account) {
    return res.status(404).json({ message: 'Compte non trouvé' });
  }
  
  // Calculer le solde
  account.currentBalance = await account.calculateBalance();
  
  res.json({ account });
});

export const createAccount = asyncHandler(async (req, res) => {
  const { code, name, type, parent, description } = req.body;
  
  // Vérifier que le code n'existe pas déjà
  const existingAccount = await Account.findOne({ code });
  if (existingAccount) {
    return res.status(400).json({ message: 'Code compte déjà existant' });
  }
  
  const account = await Account.create({
    code,
    name,
    type,
    parent: parent || null,
    description
  });
  
  await account.populate('parent', 'code name');
  
  res.status(201).json({
    message: 'Compte créé avec succès',
    account
  });
});

export const updateAccount = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;
  
  const account = await Account.findById(req.params.id);
  if (!account) {
    return res.status(404).json({ message: 'Compte non trouvé' });
  }
  
  // Vérifier s'il y a des écritures sur ce compte avant de le désactiver
  if (isActive === false) {
    const entriesCount = await JournalEntry.countDocuments({
      'entries.account': account._id
    });
    
    if (entriesCount > 0) {
      return res.status(400).json({ 
        message: 'Impossible de désactiver un compte avec des écritures' 
      });
    }
  }
  
  if (name) account.name = name;
  if (description !== undefined) account.description = description;
  if (isActive !== undefined) account.isActive = isActive;
  
  await account.save();
  await account.populate('parent', 'code name');
  
  res.json({
    message: 'Compte mis à jour',
    account
  });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);
  if (!account) {
    return res.status(404).json({ message: 'Compte non trouvé' });
  }
  
  // Vérifier s'il y a des écritures sur ce compte
  const entriesCount = await JournalEntry.countDocuments({
    'entries.account': account._id
  });
  
  if (entriesCount > 0) {
    return res.status(400).json({ 
      message: 'Impossible de supprimer un compte avec des écritures' 
    });
  }
  
  // Vérifier s'il y a des sous-comptes
  const childrenCount = await Account.countDocuments({ parent: account._id });
  if (childrenCount > 0) {
    return res.status(400).json({ 
      message: 'Impossible de supprimer un compte avec des sous-comptes' 
    });
  }
  
  await account.deleteOne();
  
  res.json({ message: 'Compte supprimé' });
});

export const getAccountBalance = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);
  if (!account) {
    return res.status(404).json({ message: 'Compte non trouvé' });
  }
  
  const balance = await account.calculateBalance();
  
  res.json({
    accountId: account._id,
    code: account.code,
    name: account.name,
    balance
  });
});

export const getTrialBalance = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter.date = {};
    if (startDate) dateFilter.date.$gte = new Date(startDate);
    if (endDate) dateFilter.date.$lte = new Date(endDate);
  }
  
  // Récupérer tous les comptes actifs
  const accounts = await Account.find({ isActive: true }).sort({ code: 1 });
  
  const trialBalance = [];
  let totalDebit = 0;
  let totalCredit = 0;
  
  for (const account of accounts) {
    // Calculer le solde pour chaque compte
    const result = await JournalEntry.aggregate([
      { $match: { status: 'validated', ...dateFilter } },
      { $unwind: '$entries' },
      { $match: { 'entries.account': account._id } },
      {
        $group: {
          _id: null,
          debit: { $sum: '$entries.debit' },
          credit: { $sum: '$entries.credit' }
        }
      }
    ]);
    
    const debit = result[0]?.debit || 0;
    const credit = result[0]?.credit || 0;
    
    if (debit > 0 || credit > 0) {
      trialBalance.push({
        account: {
          _id: account._id,
          code: account.code,
          name: account.name,
          type: account.type
        },
        debit,
        credit,
        balance: debit - credit
      });
      
      totalDebit += debit;
      totalCredit += credit;
    }
  }
  
  res.json({
    trialBalance,
    totals: {
      debit: totalDebit,
      credit: totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
    },
    period: { startDate, endDate }
  });
});