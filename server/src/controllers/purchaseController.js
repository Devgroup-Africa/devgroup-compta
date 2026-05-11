import { Purchase } from '../models/Purchase.js';
import { Supplier } from '../models/Supplier.js';
import { BankAccount } from '../models/BankAccount.js';
import { Transaction } from '../models/Transaction.js';
import { AuditLog } from '../models/AuditLog.js';

// Créer une facture fournisseur
export const createPurchase = async (req, res) => {
  try {
    const purchase = new Purchase({
      ...req.body,
      createdBy: req.user._id
    });

    await purchase.save();
    await purchase.populate('supplier bankAccount');

    // Audit log
    await AuditLog.create({
      category: 'purchase',
      userId: req.user._id,
      reason: `Facture fournisseur ${purchase.purchaseNumber} créée`,
      metadata: {
        purchaseId: purchase._id,
        purchaseNumber: purchase.purchaseNumber,
        supplier: purchase.supplier.name,
        total: purchase.total
      }
    });

    res.status(201).json(purchase);
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(400).json({ message: error.message });
  }
};

// Obtenir toutes les factures fournisseurs
export const getPurchases = async (req, res) => {
  try {
    const { status, supplier, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (supplier) filter.supplier = supplier;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(filter)
      .populate('supplier', 'name company email phone')
      .populate('bankAccount', 'name bank accountNumber')
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtenir une facture fournisseur par ID
export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier')
      .populate('bankAccount')
      .populate('transaction')
      .populate('createdBy', 'name email')
      .populate('cancelledBy', 'name email');

    if (!purchase) {
      return res.status(404).json({ message: 'Facture fournisseur non trouvée' });
    }

    res.json(purchase);
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une facture fournisseur
export const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: 'Facture fournisseur non trouvée' });
    }

    // Ne pas permettre la modification si payée ou annulée
    if (purchase.status === 'paid') {
      return res.status(400).json({ message: 'Impossible de modifier une facture payée' });
    }

    if (purchase.status === 'cancelled') {
      return res.status(400).json({ message: 'Impossible de modifier une facture annulée' });
    }

    Object.assign(purchase, req.body);
    await purchase.save();
    await purchase.populate('supplier bankAccount');

    // Audit log
    await AuditLog.create({
      category: 'purchase',
      userId: req.user._id,
      reason: `Facture fournisseur ${purchase.purchaseNumber} modifiée`,
      metadata: {
        purchaseId: purchase._id,
        purchaseNumber: purchase.purchaseNumber
      }
    });

    res.json(purchase);
  } catch (error) {
    console.error('Error updating purchase:', error);
    res.status(400).json({ message: error.message });
  }
};

// Marquer une facture fournisseur comme payée
export const markPurchaseAsPaid = async (req, res) => {
  try {
    const { paymentDate, paymentMethod } = req.body;
    const purchase = await Purchase.findById(req.params.id).populate('supplier bankAccount');

    if (!purchase) {
      return res.status(404).json({ message: 'Facture fournisseur non trouvée' });
    }

    if (purchase.status === 'paid') {
      return res.status(400).json({ message: 'Cette facture est déjà payée' });
    }

    if (purchase.status === 'cancelled') {
      return res.status(400).json({ message: 'Impossible de payer une facture annulée' });
    }

    if (!purchase.bankAccount) {
      return res.status(400).json({ message: 'Aucun compte bancaire associé à cette facture' });
    }

    // Créer la transaction de sortie
    const transaction = new Transaction({
      type: 'expense',
      category: 'Fournisseurs',
      amount: purchase.total,
      description: `Paiement facture ${purchase.purchaseNumber} - ${purchase.supplier.name}`,
      date: paymentDate || new Date(),
      status: 'confirmed',
      bankAccount: purchase.bankAccount._id,
      purchase: purchase._id,
      paymentMethod: paymentMethod || 'Virement',
      createdBy: req.user._id
    });

    await transaction.save();

    // Mettre à jour le solde du compte bancaire
    const bankAccount = await BankAccount.findById(purchase.bankAccount._id);
    await bankAccount.calculateBalance();

    // Mettre à jour la facture
    purchase.status = 'paid';
    purchase.paymentDate = paymentDate || new Date();
    purchase.paymentMethod = paymentMethod;
    purchase.transaction = transaction._id;
    await purchase.save();

    // Mettre à jour les statistiques du fournisseur
    const supplier = await Supplier.findById(purchase.supplier._id);
    supplier.totalPaid = (supplier.totalPaid || 0) + purchase.total;
    await supplier.save();

    // Audit log
    await AuditLog.create({
      category: 'purchase',
      userId: req.user._id,
      reason: `Facture fournisseur ${purchase.purchaseNumber} marquée comme payée`,
      metadata: {
        purchaseId: purchase._id,
        purchaseNumber: purchase.purchaseNumber,
        amount: purchase.total,
        bankAccount: bankAccount.name
      }
    });

    await purchase.populate('supplier bankAccount transaction');
    res.json(purchase);
  } catch (error) {
    console.error('Error marking purchase as paid:', error);
    res.status(500).json({ message: error.message });
  }
};

// Annuler une facture fournisseur
export const cancelPurchase = async (req, res) => {
  try {
    const { reason } = req.body;
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: 'Facture fournisseur non trouvée' });
    }

    if (purchase.status === 'cancelled') {
      return res.status(400).json({ message: 'Cette facture est déjà annulée' });
    }

    if (purchase.status === 'paid') {
      return res.status(400).json({ 
        message: 'Impossible d\'annuler une facture payée. Créez une note de crédit à la place.' 
      });
    }

    purchase.status = 'cancelled';
    purchase.cancelledAt = new Date();
    purchase.cancelledBy = req.user._id;
    purchase.cancellationReason = reason;
    await purchase.save();

    // Audit log
    await AuditLog.create({
      category: 'purchase',
      userId: req.user._id,
      reason: `Facture fournisseur ${purchase.purchaseNumber} annulée: ${reason}`,
      metadata: {
        purchaseId: purchase._id,
        purchaseNumber: purchase.purchaseNumber,
        cancellationReason: reason
      }
    });

    await purchase.populate('supplier bankAccount cancelledBy');
    res.json(purchase);
  } catch (error) {
    console.error('Error cancelling purchase:', error);
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une facture fournisseur (seulement si brouillon)
export const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: 'Facture fournisseur non trouvée' });
    }

    if (purchase.status !== 'draft') {
      return res.status(400).json({ 
        message: 'Seules les factures en brouillon peuvent être supprimées' 
      });
    }

    await purchase.deleteOne();

    // Audit log
    await AuditLog.create({
      category: 'purchase',
      userId: req.user._id,
      reason: `Facture fournisseur ${purchase.purchaseNumber} supprimée`,
      metadata: {
        purchaseId: purchase._id,
        purchaseNumber: purchase.purchaseNumber
      }
    });

    res.json({ message: 'Facture fournisseur supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({ message: error.message });
  }
};

// Export purchase as PDF
export const exportPurchasePDF = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier')
      .populate('bankAccount')
      .populate('createdBy', 'name email');

    if (!purchase) {
      return res.status(404).json({ message: 'Facture fournisseur non trouvée' });
    }

    // Get company settings
    const { CompanySettings } = await import('../models/CompanySettings.js');
    const companyInfo = await CompanySettings.getSettings();

    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Achat_${purchase.purchaseNumber}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor('#991b1b').text('FACTURE FOURNISSEUR', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).fillColor('#000');

    // Company info
    doc.text(`Acheteur: ${companyInfo.name || 'Mon Entreprise'}`, 50, 120);
    if (companyInfo.city) doc.text(companyInfo.city);
    if (companyInfo.email) doc.text(companyInfo.email);
    if (companyInfo.phone) doc.text(companyInfo.phone);

    // Supplier info
    doc.text(`Fournisseur: ${purchase.supplier.name}`, 350, 120);
    if (purchase.supplier.company) doc.text(purchase.supplier.company);
    if (purchase.supplier.phone) doc.text(purchase.supplier.phone);
    if (purchase.supplier.email) doc.text(purchase.supplier.email);

    doc.moveDown(2);

    // Purchase details
    doc.text(`N° Facture: ${purchase.purchaseNumber}`);
    doc.text(`Date: ${new Date(purchase.date).toLocaleDateString('fr-FR')}`);
    if (purchase.dueDate) doc.text(`Échéance: ${new Date(purchase.dueDate).toLocaleDateString('fr-FR')}`);
    if (purchase.bankAccount) doc.text(`Compte: ${purchase.bankAccount.name}`);

    doc.moveDown();

    // Items table
    const tableTop = doc.y;
    doc.fontSize(9).fillColor('#991b1b');
    doc.text('#', 50, tableTop);
    doc.text('Description', 80, tableTop);
    doc.text('Qté', 350, tableTop);
    doc.text('P.U.', 400, tableTop);
    doc.text('Total', 480, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 25;
    doc.fontSize(9).fillColor('#000');

    purchase.items.forEach((item, index) => {
      doc.text(index + 1, 50, y);
      doc.text(item.description, 80, y, { width: 250 });
      doc.text(item.quantity, 350, y);
      doc.text(`${item.unitPrice.toLocaleString()} FCFA`, 400, y);
      doc.text(`${item.total.toLocaleString()} FCFA`, 480, y);
      y += 25;
    });

    doc.moveDown();

    // Totals
    y += 20;
    doc.text(`Sous-total HT: ${purchase.subtotal.toLocaleString()} FCFA`, 350, y);
    y += 20;
    doc.text(`TVA (${purchase.taxRate}%): ${purchase.taxAmount.toLocaleString()} FCFA`, 350, y);
    y += 20;
    doc.fontSize(12).fillColor('#991b1b');
    doc.text(`TOTAL TTC: ${purchase.total.toLocaleString()} FCFA`, 350, y);

    // Notes
    if (purchase.notes) {
      doc.moveDown(2);
      doc.fontSize(10).fillColor('#000');
      doc.text('Notes:', 50);
      doc.fontSize(9).text(purchase.notes, 50, doc.y, { width: 500 });
    }

    // Payment info
    if (purchase.status === 'paid' && purchase.paymentDate) {
      doc.moveDown(2);
      doc.fontSize(10).fillColor('#059669');
      doc.text(`Payée le ${new Date(purchase.paymentDate).toLocaleDateString('fr-FR')}`);
      if (purchase.paymentMethod) doc.text(`Méthode: ${purchase.paymentMethod}`);
    }

    // Footer
    doc.fontSize(8).fillColor('#666').text(
      'Document comptable — À conserver',
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error('Error exporting purchase PDF:', error);
    res.status(500).json({ message: error.message });
  }
};

// Export purchase as Excel
export const exportPurchaseExcel = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier')
      .populate('bankAccount');

    if (!purchase) {
      return res.status(404).json({ message: 'Facture fournisseur non trouvée' });
    }

    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Facture Fournisseur');

    // Header
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = 'FACTURE FOURNISSEUR';
    worksheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF991b1b' } };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Purchase info
    worksheet.addRow([]);
    worksheet.addRow(['N° Facture:', purchase.purchaseNumber]);
    worksheet.addRow(['Date:', new Date(purchase.date).toLocaleDateString('fr-FR')]);
    if (purchase.dueDate) worksheet.addRow(['Échéance:', new Date(purchase.dueDate).toLocaleDateString('fr-FR')]);
    worksheet.addRow(['Fournisseur:', purchase.supplier.name]);
    if (purchase.bankAccount) worksheet.addRow(['Compte:', purchase.bankAccount.name]);
    worksheet.addRow(['Statut:', purchase.status]);

    // Items
    worksheet.addRow([]);
    const headerRow = worksheet.addRow(['#', 'Description', 'Quantité', 'Prix unitaire', 'Total']);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991b1b' } };
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

    purchase.items.forEach((item, index) => {
      worksheet.addRow([
        index + 1,
        item.description,
        item.quantity,
        item.unitPrice,
        item.total
      ]);
    });

    // Totals
    worksheet.addRow([]);
    worksheet.addRow(['', '', '', 'Sous-total HT:', purchase.subtotal]);
    worksheet.addRow(['', '', '', `TVA (${purchase.taxRate}%):`, purchase.taxAmount]);
    const totalRow = worksheet.addRow(['', '', '', 'TOTAL TTC:', purchase.total]);
    totalRow.font = { bold: true, size: 12 };

    // Column widths
    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 40;
    worksheet.getColumn(3).width = 12;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 15;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Achat_${purchase.purchaseNumber}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting purchase Excel:', error);
    res.status(500).json({ message: error.message });
  }
};

// Export all purchases list as Excel
export const exportPurchasesListExcel = async (req, res) => {
  try {
    const { status, supplier, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (supplier) filter.supplier = supplier;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(filter)
      .populate('supplier', 'name company')
      .populate('bankAccount', 'name')
      .sort({ date: -1 });

    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Factures Fournisseurs');

    // Header
    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = 'LISTE DES FACTURES FOURNISSEURS';
    worksheet.getCell('A1').font = { size: 14, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Stats
    const totalAmount = purchases.reduce((sum, p) => sum + p.total, 0);
    const paidAmount = purchases.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.total, 0);
    
    worksheet.addRow([]);
    worksheet.addRow(['Total factures:', purchases.length]);
    worksheet.addRow(['Montant total:', totalAmount + ' FCFA']);
    worksheet.addRow(['Montant payé:', paidAmount + ' FCFA']);
    worksheet.addRow(['Montant en attente:', (totalAmount - paidAmount) + ' FCFA']);

    // Table header
    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
      'N° Facture',
      'Fournisseur',
      'Date',
      'Échéance',
      'Montant',
      'Compte',
      'Statut',
      'Date paiement'
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991b1b' } };
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Data rows
    purchases.forEach(purchase => {
      worksheet.addRow([
        purchase.purchaseNumber,
        purchase.supplier.name,
        new Date(purchase.date).toLocaleDateString('fr-FR'),
        purchase.dueDate ? new Date(purchase.dueDate).toLocaleDateString('fr-FR') : '',
        purchase.total,
        purchase.bankAccount?.name || '',
        purchase.status,
        purchase.paymentDate ? new Date(purchase.paymentDate).toLocaleDateString('fr-FR') : ''
      ]);
    });

    // Column widths
    worksheet.columns.forEach(column => {
      column.width = 15;
    });
    worksheet.getColumn(2).width = 30;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Factures_Fournisseurs.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting purchases list:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get purchase statistics
export const getPurchaseStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(filter);

    const stats = {
      total: purchases.length,
      draft: purchases.filter(p => p.status === 'draft').length,
      pending: purchases.filter(p => p.status === 'pending').length,
      paid: purchases.filter(p => p.status === 'paid').length,
      cancelled: purchases.filter(p => p.status === 'cancelled').length,
      totalAmount: purchases.reduce((sum, p) => sum + p.total, 0),
      paidAmount: purchases.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.total, 0),
      pendingAmount: purchases.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.total, 0),
      averageAmount: purchases.length > 0 ? purchases.reduce((sum, p) => sum + p.total, 0) / purchases.length : 0,
      bySupplier: {}
    };

    // Group by supplier
    purchases.forEach(purchase => {
      const supplierId = purchase.supplier.toString();
      if (!stats.bySupplier[supplierId]) {
        stats.bySupplier[supplierId] = {
          count: 0,
          totalAmount: 0,
          paidAmount: 0
        };
      }
      stats.bySupplier[supplierId].count++;
      stats.bySupplier[supplierId].totalAmount += purchase.total;
      if (purchase.status === 'paid') {
        stats.bySupplier[supplierId].paidAmount += purchase.total;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Error getting purchase stats:', error);
    res.status(500).json({ message: error.message });
  }
};
