import { BankAccount } from '../models/BankAccount.js';
import { Transaction } from '../models/Transaction.js';
import { asyncHandler } from '../middleware/validation.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllBankAccounts = asyncHandler(async (req, res) => {
  const { isActive, type, page = 1, limit = 50 } = req.query;
  
  let filter = {};
  
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }
  
  if (type) {
    filter.type = type;
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const accounts = await BankAccount.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await BankAccount.countDocuments(filter);
  
  res.json({
    bankAccounts: accounts,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit))
  });
});

export const getBankAccountById = asyncHandler(async (req, res) => {
  const account = await BankAccount.findById(req.params.id);
  
  if (!account) {
    return res.status(404).json({ message: 'Compte bancaire non trouvé' });
  }
  
  // Charger l'historique des transactions
  const transactions = await Transaction.find({ bankAccount: account._id })
    .populate('account', 'code name')
    .populate('createdBy', 'name email')
    .sort({ date: -1 })
    .limit(50);
  
  // Recalculer le solde
  await account.calculateBalance();
  
  res.json({ 
    bankAccount: account,
    transactions
  });
});

export const createBankAccount = asyncHandler(async (req, res) => {
  const { 
    name, 
    bank, 
    accountNumber, 
    iban, 
    swift, 
    currency, 
    type, 
    initialBalance, 
    accountCode, 
    description 
  } = req.body;
  
  // Vérifier si le numéro de compte existe déjà
  const existingAccount = await BankAccount.findOne({ accountNumber });
  if (existingAccount) {
    return res.status(400).json({ 
      message: 'Un compte avec ce numéro existe déjà' 
    });
  }
  
  const account = await BankAccount.create({
    name,
    bank,
    accountNumber,
    iban,
    swift,
    currency: currency || 'XAF',
    type: type || 'checking',
    initialBalance: initialBalance || 0,
    currentBalance: initialBalance || 0,
    accountCode: accountCode || '512',
    description
  });
  
  res.status(201).json({
    message: 'Compte bancaire créé avec succès',
    bankAccount: account
  });
});

export const updateBankAccount = asyncHandler(async (req, res) => {
  const { 
    name, 
    bank, 
    accountNumber, 
    iban, 
    swift, 
    currency, 
    type, 
    accountCode, 
    description,
    isActive 
  } = req.body;
  
  const account = await BankAccount.findById(req.params.id);
  if (!account) {
    return res.status(404).json({ message: 'Compte bancaire non trouvé' });
  }
  
  // Vérifier si le numéro de compte existe déjà (sauf pour ce compte)
  if (accountNumber && accountNumber !== account.accountNumber) {
    const existingAccount = await BankAccount.findOne({ 
      accountNumber, 
      _id: { $ne: account._id } 
    });
    if (existingAccount) {
      return res.status(400).json({ 
        message: 'Un compte avec ce numéro existe déjà' 
      });
    }
  }
  
  // Mettre à jour les champs (ne pas modifier initialBalance ni currentBalance)
  if (name) account.name = name;
  if (bank) account.bank = bank;
  if (accountNumber) account.accountNumber = accountNumber;
  if (iban !== undefined) account.iban = iban;
  if (swift !== undefined) account.swift = swift;
  if (currency) account.currency = currency;
  if (type) account.type = type;
  if (accountCode) account.accountCode = accountCode;
  if (description !== undefined) account.description = description;
  if (isActive !== undefined) account.isActive = isActive;
  
  await account.save();
  
  res.json({
    message: 'Compte bancaire mis à jour',
    bankAccount: account
  });
});

export const deleteBankAccount = asyncHandler(async (req, res) => {
  const account = await BankAccount.findById(req.params.id);
  if (!account) {
    return res.status(404).json({ message: 'Compte bancaire non trouvé' });
  }
  
  // Vérifier s'il y a des transactions liées
  const transactionsCount = await Transaction.countDocuments({ 
    bankAccount: account._id 
  });
  
  if (transactionsCount > 0) {
    return res.status(400).json({ 
      message: `Impossible de supprimer ce compte car il contient ${transactionsCount} transaction(s). Veuillez d'abord supprimer ou réaffecter les transactions.` 
    });
  }
  
  await account.deleteOne();
  
  res.json({ message: 'Compte bancaire supprimé avec succès' });
});

export const recalculateBalance = asyncHandler(async (req, res) => {
  const account = await BankAccount.findById(req.params.id);
  if (!account) {
    return res.status(404).json({ message: 'Compte bancaire non trouvé' });
  }
  
  const newBalance = await account.calculateBalance();
  
  res.json({
    message: 'Solde recalculé',
    bankAccount: account,
    newBalance
  });
});

export const exportBankAccountStatement = asyncHandler(async (req, res) => {
  const { format = 'excel' } = req.query;
  const account = await BankAccount.findById(req.params.id);
  
  if (!account) {
    return res.status(404).json({ message: 'Compte bancaire non trouvé' });
  }
  
  // Charger toutes les transactions du compte
  const transactions = await Transaction.find({ bankAccount: account._id })
    .populate('account', 'code name')
    .populate('invoice', 'number')
    .populate('createdBy', 'name email')
    .sort({ date: 1 });
  
  if (format === 'excel') {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relevé de compte');
    
    // Styles
    const titleStyle = {
      font: { size: 20, bold: true, color: { argb: 'FF1E40AF' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
    
    const subtitleStyle = {
      font: { size: 12, bold: true, color: { argb: 'FF4B5563' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
    
    const headerStyle = {
      font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
    
    const infoLabelStyle = {
      font: { bold: true, size: 10, color: { argb: 'FF1E40AF' } },
      alignment: { horizontal: 'right' }
    };
    
    const infoValueStyle = {
      font: { size: 10, bold: true },
      alignment: { horizontal: 'left' }
    };
    
    // Logo (si disponible)
    const logoPath = path.join(__dirname, '../../../public/logo devgroup-1.png');
    if (fs.existsSync(logoPath)) {
      const imageId = workbook.addImage({
        filename: logoPath,
        extension: 'png',
      });
      worksheet.addImage(imageId, {
        tl: { col: 0.2, row: 0.2 },
        ext: { width: 60, height: 60 }
      });
    }
    
    // En-tête du document
    worksheet.mergeCells('B1:F1');
    worksheet.getCell('B1').value = 'RELEVÉ DE COMPTE';
    worksheet.getCell('B1').style = titleStyle;
    worksheet.getRow(1).height = 35;
    
    worksheet.mergeCells('B2:F2');
    worksheet.getCell('B2').value = 'Factures';
    worksheet.getCell('B2').style = subtitleStyle;
    worksheet.getRow(2).height = 20;
    
    worksheet.mergeCells('B3:F3');
    worksheet.getCell('B3').value = `DevGroup Africa Compta - ${account.accountNumber}`;
    worksheet.getCell('B3').font = { size: 10, color: { argb: 'FF6B7280' } };
    worksheet.getCell('B3').alignment = { horizontal: 'center' };
    worksheet.getRow(3).height = 18;
    
    // Informations du compte
    worksheet.addRow([]);
    
    const infoRow1 = worksheet.addRow(['', 'Date d\'édition:', new Date().toLocaleDateString('fr-FR'), '', 'Solde initial:', `${Math.round(account.initialBalance).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} XAF`]);
    infoRow1.getCell(2).style = infoLabelStyle;
    infoRow1.getCell(3).style = infoValueStyle;
    infoRow1.getCell(5).style = infoLabelStyle;
    infoRow1.getCell(6).style = infoValueStyle;
    infoRow1.getCell(6).font = { bold: true, size: 11, color: { argb: 'FF1E40AF' } };
    
    const infoRow2 = worksheet.addRow(['', 'Type de compte:', account.type === 'checking' ? 'Compte courant' : account.type === 'savings' ? 'Compte épargne' : 'Autre', '', 'Solde actuel:', `${Math.round(account.currentBalance).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} XAF`]);
    infoRow2.getCell(2).style = infoLabelStyle;
    infoRow2.getCell(3).style = infoValueStyle;
    infoRow2.getCell(5).style = infoLabelStyle;
    infoRow2.getCell(6).style = infoValueStyle;
    infoRow2.getCell(6).font = { bold: true, size: 12, color: { argb: 'FF16A34A' } };
    
    worksheet.addRow([]);
    
    // En-têtes des colonnes
    const headerRow = worksheet.addRow(['', 'Date', 'Description', 'Référence', 'Débit', 'Crédit', 'Solde']);
    headerRow.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.style = headerStyle;
      }
    });
    headerRow.height = 25;
    
    // Données des transactions
    let runningBalance = account.initialBalance;
    transactions.forEach((transaction, index) => {
      if (transaction.type === 'income') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }
      
      const debitValue = transaction.type === 'expense' ? transaction.amount : '';
      const creditValue = transaction.type === 'income' ? transaction.amount : '';
      
      const row = worksheet.addRow([
        '',
        new Date(transaction.date).toLocaleDateString('fr-FR'),
        transaction.description,
        transaction.reference || '-',
        debitValue,
        creditValue,
        runningBalance
      ]);
      
      // Alterner les couleurs de fond (sans bordures visibles)
      if (index % 2 === 0) {
        row.eachCell((cell, colNumber) => {
          if (colNumber > 1) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF9FAFB' }
            };
          }
        });
      }
      
      // Formater les montants
      if (transaction.type === 'expense' && debitValue) {
        row.getCell(5).value = `${Math.round(debitValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
        row.getCell(5).font = { color: { argb: 'FFDC2626' }, bold: true };
        row.getCell(5).alignment = { horizontal: 'right' };
      }
      if (transaction.type === 'income' && creditValue) {
        row.getCell(6).value = `${Math.round(creditValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
        row.getCell(6).font = { color: { argb: 'FF16A34A' }, bold: true };
        row.getCell(6).alignment = { horizontal: 'right' };
      }
      row.getCell(7).value = `${Math.round(runningBalance).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
      row.getCell(7).font = { bold: true };
      row.getCell(7).alignment = { horizontal: 'right' };
    });
    
    worksheet.addRow([]);
    
    // Résumé
    const totalDebits = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalCredits = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    
    const summaryRow1 = worksheet.addRow(['', '', '', '', 'Total des débits:', `${Math.round(totalDebits).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`, '']);
    summaryRow1.getCell(5).font = { bold: true };
    summaryRow1.getCell(6).font = { bold: true, color: { argb: 'FFDC2626' } };
    summaryRow1.getCell(6).alignment = { horizontal: 'right' };
    
    const summaryRow2 = worksheet.addRow(['', '', '', '', 'Total des crédits:', `${Math.round(totalCredits).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`, '']);
    summaryRow2.getCell(5).font = { bold: true };
    summaryRow2.getCell(6).font = { bold: true, color: { argb: 'FF16A34A' } };
    summaryRow2.getCell(6).alignment = { horizontal: 'right' };
    
    const summaryRow3 = worksheet.addRow(['', '', '', '', 'Nombre de transactions:', transactions.length, '']);
    summaryRow3.getCell(5).font = { bold: true };
    summaryRow3.getCell(6).font = { bold: true };
    summaryRow3.getCell(6).alignment = { horizontal: 'right' };
    
    // Ajuster la largeur des colonnes
    worksheet.columns = [
      { width: 2 },   // Colonne vide pour marge
      { width: 12 },  // Date
      { width: 40 },  // Description
      { width: 18 },  // Référence
      { width: 18 },  // Débit
      { width: 18 },  // Crédit
      { width: 18 }   // Solde
    ];
    
    // Footer
    worksheet.addRow([]);
    const footerRow = worksheet.addRow(['', 'Document généré automatiquement par DevGroup Africa Compta']);
    worksheet.mergeCells(footerRow.number, 2, footerRow.number, 7);
    footerRow.getCell(2).font = { italic: true, size: 9, color: { argb: 'FF6B7280' } };
    footerRow.getCell(2).alignment = { horizontal: 'center' };
    
    // Générer le fichier
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=releve-${account.accountNumber}-${Date.now()}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } else if (format === 'pdf') {
    const { generateBankStatementPDF } = await import('../services/pdfService.js');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=releve-${account.accountNumber}-${Date.now()}.pdf`);
    
    const pdfBuffer = await generateBankStatementPDF(account, transactions);
    res.send(pdfBuffer);
  } else if (format === 'word') {
    const { generateBankStatementWord } = await import('../services/wordService.js');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=releve-${account.accountNumber}-${Date.now()}.docx`);
    
    const wordBuffer = await generateBankStatementWord(account, transactions);
    res.send(wordBuffer);
  } else {
    return res.status(400).json({ message: 'Format non supporté. Utilisez excel, pdf ou word.' });
  }
});

export const exportTransactionsList = asyncHandler(async (req, res) => {
  const { format = 'excel', startDate, endDate } = req.query;
  const account = await BankAccount.findById(req.params.id);
  
  if (!account) {
    return res.status(404).json({ message: 'Compte bancaire non trouvé' });
  }
  
  // Filtrer les transactions par date si spécifié
  let filter = { bankAccount: account._id };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  
  const transactions = await Transaction.find(filter)
    .populate('account', 'code name')
    .populate('invoice', 'number')
    .populate('createdBy', 'name email')
    .sort({ date: -1 });
  
  if (format === 'excel') {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');
    
    // En-tête
    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = `LISTE DES TRANSACTIONS - ${account.name}`;
    worksheet.getCell('A1').font = { size: 14, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    worksheet.addRow([]);
    
    // En-têtes des colonnes
    const headerRow = worksheet.addRow([
      'Date',
      'Type',
      'Description',
      'Catégorie',
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
      { width: 15 },
      { width: 15 },
      { width: 12 },
      { width: 20 }
    ];
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-${account.accountNumber}-${Date.now()}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } else {
    return res.status(400).json({ message: 'Format non supporté. Utilisez excel.' });
  }
});
