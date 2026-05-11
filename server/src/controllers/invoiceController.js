import { Invoice } from '../models/Invoice.js';
import { Client } from '../models/Client.js';
import { AuditLog } from '../models/AuditLog.js';
import { CompanySettings } from '../models/CompanySettings.js';
import { Transaction } from '../models/Transaction.js';
import { asyncHandler } from '../middleware/validation.js';

export const getInvoices = asyncHandler(async (req, res) => {
  const { status, clientId, startDate, endDate, search } = req.query;
  
  let filter = {};
  
  if (status) filter.status = status;
  if (clientId) filter.client = clientId;
  if (search) {
    filter.$or = [
      { number: { $regex: search, $options: 'i' } },
      { 'items.description': { $regex: search, $options: 'i' } }
    ];
  }
  
  if (startDate || endDate) {
    filter.issueDate = {};
    if (startDate) filter.issueDate.$gte = new Date(startDate);
    if (endDate) filter.issueDate.$lte = new Date(endDate);
  }
  
  const invoices = await Invoice.find(filter)
    .populate('client', 'name company email phone address taxNumber')
    .sort({ issueDate: -1 });
  
  res.json({
    invoices,
    total: invoices.length
  });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('client', 'name company email phone address taxNumber')
    .populate('journalEntry')
    .populate('bankAccount', 'name accountNumber bankName');
  
  if (!invoice) {
    return res.status(404).json({ message: 'Facture non trouvée' });
  }
  
  res.json({ invoice });
});

export const createInvoice = asyncHandler(async (req, res) => {
  const { 
    clientId, 
    items, 
    taxRate, 
    discountRate, 
    issueDate, 
    dueDate, 
    notes, 
    terms,
    object,
    bankAccountId,
    companyInfo,
    paymentInfo
  } = req.body;
  
  // Vérifier que le client existe
  const client = await Client.findById(clientId);
  if (!client) {
    return res.status(404).json({ message: 'Client non trouvé' });
  }
  
  // Récupérer les paramètres de l'entreprise
  const settings = await CompanySettings.getSettings();
  
  // Générer le numéro de facture
  const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
  const invoiceNumber = generateInvoiceNumber(lastInvoice, settings.invoicePrefix);
  
  // Utiliser les valeurs des paramètres si non fournies
  const finalTaxRate = taxRate !== undefined ? taxRate : 0; // TVA à 0 par défaut
  const finalDueDate = dueDate || new Date(Date.now() + settings.paymentTerms * 24 * 60 * 60 * 1000);
  const finalBankAccount = bankAccountId || settings.defaultBankAccount;
  
  // Utiliser les infos de l'entreprise depuis les paramètres si non fournies
  const finalCompanyInfo = companyInfo || {
    name: settings.name,
    logo: settings.logo,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
    registrationNumber: settings.registrationNumber,
    taxNumber: settings.taxId
  };
  
  // Utiliser les infos de paiement depuis les paramètres si non fournies
  const finalPaymentInfo = paymentInfo || {
    mobileMoney: settings.mobileMoneyAccounts || [],
    bankAccounts: settings.bankAccounts || []
  };
  
  const invoice = await Invoice.create({
    number: invoiceNumber,
    client: clientId,
    items: items || [],
    taxRate: finalTaxRate,
    discountRate: discountRate || 0,
    issueDate: issueDate || new Date(),
    dueDate: finalDueDate,
    object: object || '',
    notes: notes || '',
    terms: terms || '',
    bankAccount: finalBankAccount,
    companyInfo: finalCompanyInfo,
    paymentInfo: finalPaymentInfo,
    createdBy: req.user._id
  });
  
  await invoice.populate('client', 'name company email phone address taxNumber');
  await invoice.populate('bankAccount', 'name accountNumber bankName');
  
  res.status(201).json({
    message: 'Facture créée avec succès',
    invoice
  });
});

export const updateInvoice = asyncHandler(async (req, res) => {
  const { items, taxRate, discountRate, dueDate, notes, terms, status } = req.body;
  
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    return res.status(404).json({ message: 'Facture non trouvée' });
  }
  
  // Vérifier si la facture peut être modifiée
  if (invoice.status === 'cancelled') {
    return res.status(400).json({ message: 'Impossible de modifier une facture annulée' });
  }
  
  if (invoice.status === 'paid') {
    return res.status(400).json({ message: 'Impossible de modifier une facture payée' });
  }
  
  // Mettre à jour les champs
  if (items) invoice.items = items;
  if (taxRate !== undefined) invoice.taxRate = taxRate;
  if (discountRate !== undefined) invoice.discountRate = discountRate;
  if (dueDate) invoice.dueDate = dueDate;
  if (notes !== undefined) invoice.notes = notes;
  if (terms !== undefined) invoice.terms = terms;
  if (status) invoice.status = status;
  
  await invoice.save();
  await invoice.populate('client', 'name company email phone address taxNumber');
  
  res.json({
    message: 'Facture mise à jour',
    invoice
  });
});

export const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    return res.status(404).json({ message: 'Facture non trouvée' });
  }
  
  // Vérifier si la facture peut être supprimée - seules les factures en brouillon ou annulées peuvent être supprimées
  if (invoice.status !== 'draft' && invoice.status !== 'cancelled') {
    return res.status(400).json({ 
      message: 'Seules les factures en brouillon ou annulées peuvent être supprimées. Utilisez l\'annulation pour les factures envoyées ou payées.' 
    });
  }
  
  await invoice.deleteOne();
  
  res.json({ message: 'Facture supprimée' });
});

export const generateJournalEntry = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    return res.status(404).json({ message: 'Facture non trouvée' });
  }
  
  if (invoice.journalEntry) {
    return res.status(400).json({ message: 'Écriture comptable déjà générée' });
  }
  
  const journalEntry = await invoice.generateJournalEntry();
  
  res.json({
    message: 'Écriture comptable générée',
    journalEntry
  });
});

export const sendInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    return res.status(404).json({ message: 'Facture non trouvée' });
  }
  
  if (invoice.status !== 'draft') {
    return res.status(400).json({ message: 'Seules les factures en brouillon peuvent être envoyées' });
  }
  
  invoice.status = 'sent';
  await invoice.save();
  
  res.json({
    message: 'Facture envoyée',
    invoice
  });
});

export const markInvoiceAsPaid = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('bankAccount');
  if (!invoice) {
    return res.status(404).json({ message: 'Facture non trouvée' });
  }
  
  if (invoice.status === 'paid') {
    return res.status(400).json({ message: 'Cette facture est déjà marquée comme payée' });
  }
  
  // Marquer la facture comme payée
  invoice.paidAmount = invoice.total;
  invoice.status = 'paid';
  await invoice.save();
  
  console.log('Facture marquée comme payée. BankAccount:', invoice.bankAccount);
  
  // Créer automatiquement une transaction si un compte bancaire est associé
  if (invoice.bankAccount) {
    try {
      console.log('Création de la transaction pour le compte:', invoice.bankAccount._id);
      
      const transaction = await Transaction.create({
        type: 'income',
        amount: invoice.total,
        date: new Date(),
        description: `Paiement facture ${invoice.number}`,
        category: 'Ventes',
        bankAccount: invoice.bankAccount._id,
        invoice: invoice._id,
        createdBy: req.user._id,
        status: 'confirmed'
      });
      
      console.log('Transaction créée avec succès:', transaction._id);
      
      // Mettre à jour le solde du compte bancaire
      await invoice.bankAccount.calculateBalance();
      await invoice.bankAccount.save();
      
      console.log('Solde du compte mis à jour:', invoice.bankAccount.currentBalance);
    } catch (transactionError) {
      console.error('Erreur lors de la création de la transaction:', transactionError);
      // Ne pas bloquer le marquage comme payé si la transaction échoue
    }
  } else {
    console.log('Aucun compte bancaire associé à cette facture');
  }
  
  await invoice.populate('client', 'name company email phone address taxNumber');
  
  res.json({
    message: 'Facture marquée comme payée',
    invoice
  });
});

export const cancelInvoice = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  // Validate invoice existence
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    return res.status(404).json({ message: 'Facture non trouvée' });
  }
  
  // Validate business rules - cannot cancel draft invoices
  if (invoice.status === 'draft') {
    return res.status(400).json({ 
      message: 'Impossible d\'annuler une facture en brouillon. Utilisez la suppression à la place.' 
    });
  }
  
  // Validate business rules - cannot cancel already cancelled invoices
  if (invoice.status === 'cancelled') {
    return res.status(400).json({ 
      message: 'Cette facture est déjà annulée' 
    });
  }
  
  // Update invoice with cancelled status and metadata
  invoice.status = 'cancelled';
  invoice.cancelledBy = req.user._id;
  invoice.cancelledAt = new Date();
  if (reason) {
    invoice.cancellationReason = reason;
  }
  
  await invoice.save();
  await invoice.populate('client', 'name company email phone address taxNumber');
  
  // Create audit log entry
  try {
    await AuditLog.create({
      category: 'INVOICE_CANCELLED',
      userId: req.user._id,
      invoiceNumber: invoice.number,
      reason: reason || '',
      metadata: {
        invoiceId: invoice._id,
        invoiceTotal: invoice.total,
        invoiceStatus: invoice.status,
        cancelledAt: invoice.cancelledAt
      }
    });
  } catch (auditError) {
    // Log error but don't block the cancellation response
    console.error('Failed to create audit log:', auditError);
  }
  
  // Check for high-value cancellation alert
  const highValueThreshold = parseFloat(process.env.HIGH_VALUE_CANCELLATION_THRESHOLD || '10000');
  if (invoice.total >= highValueThreshold) {
    // Trigger alert notification
    console.warn(`HIGH VALUE CANCELLATION ALERT: Invoice ${invoice.number} with total ${invoice.total} cancelled by user ${req.user._id}`);
    // In a production system, this would trigger email/SMS/Slack notifications
  }
  
  res.json({
    message: 'Facture annulée avec succès',
    invoice
  });
});

// Fonction utilitaire pour générer le numéro de facture
function generateInvoiceNumber(lastInvoice, prefix = 'FA') {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  
  if (!lastInvoice) {
    return `${prefix}-${currentYear}${currentMonth}-001`;
  }
  
  const lastNumber = lastInvoice.number;
  const lastYearMonth = lastNumber.substring(prefix.length + 1, prefix.length + 7); // FA-202403
  const currentYearMonth = `${currentYear}${currentMonth}`;
  
  if (lastYearMonth === currentYearMonth) {
    // Même mois, incrémenter le numéro
    const lastSequence = parseInt(lastNumber.substring(prefix.length + 8));
    const newSequence = String(lastSequence + 1).padStart(3, '0');
    return `${prefix}-${currentYearMonth}-${newSequence}`;
  } else {
    // Nouveau mois, recommencer à 001
    return `${prefix}-${currentYearMonth}-001`;
  }
}