import { Transaction } from '../models/Transaction.js';
import { BankAccount } from '../models/BankAccount.js';
import { JournalEntry } from '../models/JournalEntry.js';
import { asyncHandler } from '../middleware/validation.js';
import mongoose from 'mongoose';

export const getAllTransactions = asyncHandler(async (req, res) => {
  const { 
    type, 
    category, 
    bankAccount, 
    startDate, 
    endDate, 
    search,
    page = 1, 
    limit = 50 
  } = req.query;
  
  let filter = {};
  
  if (type) {
    filter.type = type;
  }
  
  if (category) {
    filter.category = category;
  }
  
  if (bankAccount) {
    filter.bankAccount = bankAccount;
  }
  
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  
  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: 'i' } },
      { reference: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const transactions = await Transaction.find(filter)
    .populate('bankAccount', 'name bank accountNumber')
    .populate('account', 'code name')
    .populate('createdBy', 'name email')
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Transaction.countDocuments(filter);
  
  res.json({
    transactions,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit))
  });
});

export const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('bankAccount', 'name bank accountNumber currentBalance')
    .populate('account', 'code name type')
    .populate('journalEntry')
    .populate('createdBy', 'name email')
    .populate({
      path: 'invoice',
      select: 'invoiceNumber client',
      populate: {
        path: 'client',
        select: 'name'
      }
    })
    .populate({
      path: 'purchase',
      select: 'purchaseNumber supplier',
      populate: {
        path: 'supplier',
        select: 'name'
      }
    });
  
  if (!transaction) {
    return res.status(404).json({ message: 'Transaction non trouvée' });
  }
  
  res.json({ transaction });
});

export const createTransaction = asyncHandler(async (req, res) => {
  const { 
    type, 
    amount, 
    description, 
    category, 
    date, 
    reference, 
    bankAccount, 
    account, 
    notes 
  } = req.body;
  
  // Vérifier que le compte bancaire existe
  if (bankAccount) {
    const bankAcc = await BankAccount.findById(bankAccount);
    if (!bankAcc) {
      return res.status(404).json({ message: 'Compte bancaire non trouvé' });
    }
    if (!bankAcc.isActive) {
      return res.status(400).json({ message: 'Le compte bancaire est inactif' });
    }
  }
  
  const transaction = await Transaction.create({
    type,
    amount,
    description,
    category,
    date: date || new Date(),
    reference,
    bankAccount,
    account,
    notes,
    createdBy: req.user._id,
    status: 'confirmed'
  });
  
  // Le hook post-save génère automatiquement l'écriture comptable
  // et met à jour le solde du compte bancaire
  
  // Recharger avec les relations
  await transaction.populate('bankAccount account createdBy');
  
  // Recalculer le solde du compte bancaire
  if (bankAccount) {
    const bankAcc = await BankAccount.findById(bankAccount);
    await bankAcc.calculateBalance();
  }
  
  res.status(201).json({
    message: 'Transaction créée avec succès',
    transaction
  });
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const { 
    type, 
    amount, 
    description, 
    category, 
    date, 
    reference, 
    bankAccount, 
    account, 
    notes,
    status 
  } = req.body;
  
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    return res.status(404).json({ message: 'Transaction non trouvée' });
  }
  
  // Vérifier les permissions
  if (transaction.createdBy.toString() !== req.user._id.toString() && 
      !['admin', 'accountant'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Vous n\'avez pas la permission de modifier cette transaction' 
    });
  }
  
  // Si la transaction a une écriture comptable, empêcher la modification
  if (transaction.journalEntry && transaction.status === 'confirmed') {
    return res.status(400).json({ 
      message: 'Impossible de modifier une transaction confirmée avec écriture comptable' 
    });
  }
  
  const oldBankAccount = transaction.bankAccount;
  
  // Mettre à jour les champs
  if (type) transaction.type = type;
  if (amount !== undefined) transaction.amount = amount;
  if (description) transaction.description = description;
  if (category) transaction.category = category;
  if (date) transaction.date = date;
  if (reference !== undefined) transaction.reference = reference;
  if (bankAccount !== undefined) transaction.bankAccount = bankAccount;
  if (account) transaction.account = account;
  if (notes !== undefined) transaction.notes = notes;
  if (status) transaction.status = status;
  
  await transaction.save();
  
  // Recalculer les soldes des comptes bancaires affectés
  if (oldBankAccount) {
    const oldAcc = await BankAccount.findById(oldBankAccount);
    if (oldAcc) await oldAcc.calculateBalance();
  }
  if (bankAccount && bankAccount !== oldBankAccount?.toString()) {
    const newAcc = await BankAccount.findById(bankAccount);
    if (newAcc) await newAcc.calculateBalance();
  }
  
  await transaction.populate('bankAccount account createdBy');
  
  res.json({
    message: 'Transaction mise à jour',
    transaction
  });
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    return res.status(404).json({ message: 'Transaction non trouvée' });
  }
  
  // Vérifier les permissions
  if (transaction.createdBy.toString() !== req.user._id.toString() && 
      !['admin', 'accountant'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Vous n\'avez pas la permission de supprimer cette transaction' 
    });
  }
  
  const bankAccountId = transaction.bankAccount;
  
  // Supprimer l'écriture comptable associée
  if (transaction.journalEntry) {
    await JournalEntry.findByIdAndDelete(transaction.journalEntry);
  }
  
  // Supprimer le fichier joint si présent
  if (transaction.attachment && transaction.attachment.path) {
    // TODO: Implémenter la suppression du fichier physique
  }
  
  await transaction.deleteOne();
  
  // Recalculer le solde du compte bancaire
  if (bankAccountId) {
    const bankAcc = await BankAccount.findById(bankAccountId);
    if (bankAcc) await bankAcc.calculateBalance();
  }
  
  res.json({ message: 'Transaction supprimée' });
});

export const createTransfer = asyncHandler(async (req, res) => {
  const { 
    sourceAccount, 
    destinationAccount, 
    amount, 
    date, 
    reference, 
    description 
  } = req.body;
  
  // Vérifier que les comptes sont différents
  if (sourceAccount === destinationAccount) {
    return res.status(400).json({ 
      message: 'Les comptes source et destination doivent être différents' 
    });
  }
  
  // Vérifier que les comptes existent
  const sourceAcc = await BankAccount.findById(sourceAccount);
  const destAcc = await BankAccount.findById(destinationAccount);
  
  if (!sourceAcc) {
    return res.status(404).json({ message: 'Compte source non trouvé' });
  }
  if (!destAcc) {
    return res.status(404).json({ message: 'Compte destination non trouvé' });
  }
  
  // Vérifier le solde suffisant
  if (sourceAcc.currentBalance < amount) {
    return res.status(400).json({ 
      message: 'Solde insuffisant sur le compte source' 
    });
  }
  
  // Générer une référence unique pour le virement
  const transferRef = reference || `VIR-${Date.now()}`;
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Créer la transaction de sortie (expense)
    const expenseTransaction = await Transaction.create([{
      type: 'expense',
      amount,
      description: description || `Virement vers ${destAcc.name}`,
      category: 'Virement interne',
      date: date || new Date(),
      reference: transferRef,
      bankAccount: sourceAccount,
      account: await getTransferAccount(),
      notes: `Virement vers compte ${destAcc.accountNumber}`,
      createdBy: req.user._id,
      status: 'confirmed'
    }], { session });
    
    // Créer la transaction d'entrée (income)
    const incomeTransaction = await Transaction.create([{
      type: 'income',
      amount,
      description: description || `Virement depuis ${sourceAcc.name}`,
      category: 'Virement interne',
      date: date || new Date(),
      reference: transferRef,
      bankAccount: destinationAccount,
      account: await getTransferAccount(),
      notes: `Virement depuis compte ${sourceAcc.accountNumber}`,
      createdBy: req.user._id,
      status: 'confirmed'
    }], { session });
    
    // Recalculer les soldes
    await sourceAcc.calculateBalance();
    await destAcc.calculateBalance();
    
    await session.commitTransaction();
    
    res.status(201).json({
      message: 'Virement effectué avec succès',
      transfer: {
        reference: transferRef,
        sourceTransaction: expenseTransaction[0],
        destinationTransaction: incomeTransaction[0],
        sourceAccount: sourceAcc,
        destinationAccount: destAcc
      }
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Fonction helper pour obtenir le compte comptable de virement
async function getTransferAccount() {
  const Account = mongoose.model('Account');
  // Utiliser le compte 580 - Virements internes
  let account = await Account.findOne({ code: '580' });
  if (!account) {
    // Si le compte n'existe pas, utiliser le compte banque par défaut
    account = await Account.findOne({ code: '512' });
  }
  return account._id;
}

export const getDashboard = asyncHandler(async (req, res) => {
  const { period, startDate, endDate } = req.query;
  
  let dateFilter = {};
  
  if (period) {
    const now = new Date();
    switch (period) {
      case 'today':
        dateFilter = {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lte: new Date(now.setHours(23, 59, 59, 999))
        };
        break;
      case 'week':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { $gte: weekStart };
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { $gte: monthStart };
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
        dateFilter = { $gte: quarterStart };
        break;
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        dateFilter = { $gte: yearStart };
        break;
    }
  } else if (startDate || endDate) {
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
  }
  
  // Calculer les KPIs
  const accounts = await BankAccount.find({ isActive: true });
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  
  const transactionFilter = Object.keys(dateFilter).length > 0 
    ? { date: dateFilter, status: 'confirmed' } 
    : { status: 'confirmed' };
  
  const incomeTransactions = await Transaction.aggregate([
    { $match: { ...transactionFilter, type: 'income' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const expenseTransactions = await Transaction.aggregate([
    { $match: { ...transactionFilter, type: 'expense' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const totalIncome = incomeTransactions[0]?.total || 0;
  const totalExpense = expenseTransactions[0]?.total || 0;
  const cashFlow = totalIncome - totalExpense;
  
  // Transactions récentes
  const recentTransactions = await Transaction.find(transactionFilter)
    .populate('bankAccount', 'name')
    .populate('account', 'code name')
    .sort({ date: -1 })
    .limit(10);
  
  res.json({
    kpis: {
      totalBalance,
      totalIncome,
      totalExpense,
      cashFlow
    },
    accounts,
    recentTransactions
  });
});

export const getCashFlow = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ 
      message: 'Les dates de début et de fin sont requises' 
    });
  }
  
  const dateFilter = {
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    status: 'confirmed'
  };
  
  // Grouper par jour
  const cashFlowData = await Transaction.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          type: '$type'
        },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);
  
  res.json({ cashFlowData });
});

export const getCategorySummary = asyncHandler(async (req, res) => {
  const { period, startDate, endDate } = req.query;
  
  let dateFilter = {};
  
  if (period) {
    const now = new Date();
    switch (period) {
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { $gte: monthStart };
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
        dateFilter = { $gte: quarterStart };
        break;
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        dateFilter = { $gte: yearStart };
        break;
    }
  } else if (startDate || endDate) {
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
  }
  
  const filter = Object.keys(dateFilter).length > 0 
    ? { date: dateFilter, status: 'confirmed' } 
    : { status: 'confirmed' };
  
  const categorySummary = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          category: '$category',
          type: '$type'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);
  
  res.json({ categorySummary });
});

export const exportAllTransactions = asyncHandler(async (req, res) => {
  const { format = 'excel', type, category, startDate, endDate } = req.query;
  
  let filter = { status: 'confirmed' };
  
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  
  const transactions = await Transaction.find(filter)
    .populate('bankAccount', 'name accountNumber')
    .populate('account', 'code name')
    .populate('invoice', 'number')
    .populate('createdBy', 'name email')
    .sort({ date: -1 });
  
  if (format === 'excel') {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');
    
    // En-tête
    worksheet.mergeCells('A1:I1');
    worksheet.getCell('A1').value = 'LISTE DES TRANSACTIONS';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    worksheet.mergeCells('A2:I2');
    worksheet.getCell('A2').value = `Période: ${startDate ? new Date(startDate).toLocaleDateString('fr-FR') : 'Début'} - ${endDate ? new Date(endDate).toLocaleDateString('fr-FR') : 'Fin'}`;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };
    
    worksheet.addRow([]);
    
    // Statistiques
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    worksheet.addRow(['Total Entrées:', `${totalIncome.toLocaleString('fr-FR')} FCFA`]);
    worksheet.addRow(['Total Sorties:', `${totalExpense.toLocaleString('fr-FR')} FCFA`]);
    worksheet.addRow(['Solde Net:', `${(totalIncome - totalExpense).toLocaleString('fr-FR')} FCFA`]);
    worksheet.addRow([]);
    
    // En-têtes des colonnes
    const headerRow = worksheet.addRow([
      'Date',
      'Type',
      'Description',
      'Catégorie',
      'Compte bancaire',
      'Référence',
      'Montant',
      'Statut',
      'Créé par'
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Données
    transactions.forEach(transaction => {
      worksheet.addRow([
        new Date(transaction.date).toLocaleDateString('fr-FR'),
        transaction.type === 'income' ? 'Entrée' : 'Sortie',
        transaction.description,
        transaction.category,
        transaction.bankAccount?.name || '-',
        transaction.reference || '-',
        transaction.amount.toLocaleString('fr-FR'),
        transaction.status === 'confirmed' ? 'Confirmée' : transaction.status === 'pending' ? 'En attente' : 'Annulée',
        transaction.createdBy?.name || '-'
      ]);
    });
    
    // Ajuster la largeur des colonnes
    worksheet.columns = [
      { width: 12 },
      { width: 10 },
      { width: 35 },
      { width: 15 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 12 },
      { width: 20 }
    ];
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } else {
    return res.status(400).json({ message: 'Format non supporté. Utilisez excel.' });
  }
});
