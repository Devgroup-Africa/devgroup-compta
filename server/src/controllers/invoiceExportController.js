import { Invoice } from '../models/Invoice.js';
import { Client } from '../models/Client.js';
import { asyncHandler } from '../middleware/validation.js';
import { generateInvoicePDF } from '../services/pdfService.js';
import { generateInvoiceWord } from '../services/wordService.js';
import { generateInvoiceExcel } from '../services/excelService.js';
import { generateInvoiceJPEG } from '../services/imageService.js';
import { sendInvoiceEmail } from '../services/emailService.js';

// Export invoice as PDF
export const exportInvoicePDF = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('client', 'name company email phone address taxNumber')
    .populate('createdBy', 'name email');
  
  if (!invoice) {
    return res.status(404).json({ message: 'Facture non trouvée' });
  }
  
  const pdfBuffer = await generateInvoicePDF(invoice);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Facture_${invoice.number}.pdf`);
  res.send(pdfBuffer);
});

// Export invoice as Word
export const exportInvoiceWord = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('client', 'name company email phone address taxNumber')
    .populate('createdBy', 'name email');
  
  if (!invoice) {
    return res.status(404).json({ message: 'Facture non trouvée' });
  }
  
  const wordBuffer = await generateInvoiceWord(invoice);
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename=Facture_${invoice.number}.docx`);
  res.send(wordBuffer);
});

// Export invoice as Excel
export const exportInvoiceExcel = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('client', 'name company email phone address taxNumber')
    .populate('createdBy', 'name email');
  
  if (!invoice) {
    return res.status(404).json({ message: 'Facture non trouvée' });
  }
  
  const excelBuffer = await generateInvoiceExcel(invoice);
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=Facture_${invoice.number}.xlsx`);
  res.send(excelBuffer);
});

// Export invoice as JPEG
export const exportInvoiceJPEG = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('client', 'name company email phone address taxNumber')
    .populate('createdBy', 'name email');
  
  if (!invoice) {
    return res.status(404).json({ message: 'Facture non trouvée' });
  }
  
  const jpegBuffer = await generateInvoiceJPEG(invoice);
  
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Disposition', `attachment; filename=Facture_${invoice.number}.jpg`);
  res.send(jpegBuffer);
});
// Send invoice by email
export const sendInvoiceByEmail = asyncHandler(async (req, res) => {
  const { recipientEmail, subject, message } = req.body;
  
  const invoice = await Invoice.findById(req.params.id)
    .populate('client', 'name company email phone address taxNumber')
    .populate('createdBy', 'name email');
  
  if (!invoice) {
    return res.status(404).json({ message: 'Facture non trouvée' });
  }
  
  // Générer le PDF à joindre
  const pdfBuffer = await generateInvoicePDF(invoice);
  
  // Envoyer l'email
  const emailRecipient = recipientEmail || invoice.client.email;
  if (!emailRecipient) {
    return res.status(400).json({ message: 'Aucune adresse email fournie' });
  }
  
  await sendInvoiceEmail(invoice, emailRecipient, subject, message, pdfBuffer);
  
  // Mettre à jour le statut de la facture
  if (invoice.status === 'draft') {
    invoice.status = 'sent';
    await invoice.save();
  }
  
  res.json({
    message: `Facture envoyée à ${emailRecipient}`,
    invoice
  });
});

// Get invoice preview data (for frontend rendering)
export const getInvoicePreview = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('client', 'name company email phone address taxNumber')
    .populate('createdBy', 'name email');
  
  if (!invoice) {
    return res.status(404).json({ message: 'Facture non trouvée' });
  }
  
  // Return complete invoice data for preview/export
  res.json({
    invoice: {
      ...invoice.toObject(),
      formattedIssueDate: invoice.issueDate.toLocaleDateString('fr-FR'),
      formattedDueDate: invoice.dueDate.toLocaleDateString('fr-FR'),
      formattedSubtotal: new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'XAF' 
      }).format(invoice.subtotal),
      formattedTaxAmount: new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'XAF' 
      }).format(invoice.taxAmount),
      formattedTotal: new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'XAF' 
      }).format(invoice.total),
      formattedDiscountAmount: new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'XAF' 
      }).format(invoice.discountAmount)
    }
  });
});
