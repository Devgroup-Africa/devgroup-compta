import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Normalize invoice data ───────────────────────────────────────────────────
function normalizeInvoiceData(invoice) {
  return {
    ...invoice,
    items: (invoice.items || []).map(item => ({
      ...item,
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      total: Number(item.total) || 0,
      description: String(item.description || ''),
      detailedDescription: String(item.detailedDescription || '')
    })),
    subtotal: Number(invoice.subtotal) || 0,
    taxAmount: Number(invoice.taxAmount) || 0,
    discountAmount: Number(invoice.discountAmount) || 0,
    total: Number(invoice.total) || 0,
    paidAmount: Number(invoice.paidAmount) || 0,
    taxRate: Number(invoice.taxRate) || 0,
    discountRate: Number(invoice.discountRate) || 0
  };
}

function formatCurrency(amount) {
  const num = Math.round(amount ?? 0);
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export const generateInvoicePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const normalizedInvoice = normalizeInvoiceData(invoice);
      
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0
      });
      
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 35;
      const contentWidth = pageWidth - margin * 2;

      let y = margin;

      // ── HEADER: Logo + Company Name ──
      const logoPath = path.join(__dirname, '../../../public/logo devgroup-1.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, margin, y, { height: 22 });
      }
      
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e3a5f')
         .text(normalizedInvoice.companyInfo?.name || 'DevGroup Africa', margin + 32, y + 2);

      y += 32;

      // ── THIN BLUE LINE ──
      doc.moveTo(margin, y)
         .lineTo(pageWidth - margin, y)
         .strokeColor('#1e40af')
         .lineWidth(2)
         .stroke();

      y += 18;

      // ── FACTURE TITLE ──
      doc.fontSize(28).font('Helvetica-Bold').fillColor('#1e40af')
         .text('FACTURE', margin, y, { align: 'center', width: contentWidth });

      y += 32;

      // ── THIN BLUE LINE ──
      doc.moveTo(margin, y)
         .lineTo(pageWidth - margin, y)
         .strokeColor('#1e40af')
         .lineWidth(1.5)
         .stroke();

      y += 18;

      // ── ÉMETTEUR + CLIENT ──
      const colWidth = (contentWidth - 20) / 2;

      // Émetteur box with rounded corners
      doc.rect(margin, y, colWidth, 75)
         .fillAndStroke('#e8f1ff', '#d1d5db');
      
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#1e3a5f')
         .text('ÉMETTEUR', margin + 10, y + 8);
      
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e3a5f')
         .text(normalizedInvoice.companyInfo?.name || 'DevGroup Africa', margin + 10, y + 20);
      
      doc.fontSize(7).font('Helvetica').fillColor('#4b5563');
      let emitterY = y + 35;
      if (normalizedInvoice.companyInfo?.address) {
        doc.text(normalizedInvoice.companyInfo.address, margin + 10, emitterY);
        emitterY += 8;
      }
      if (normalizedInvoice.companyInfo?.email) {
        doc.text(normalizedInvoice.companyInfo.email, margin + 10, emitterY);
        emitterY += 8;
      }
      if (normalizedInvoice.companyInfo?.phone) {
        doc.text(normalizedInvoice.companyInfo.phone, margin + 10, emitterY);
      }

      // Client box
      doc.rect(margin + colWidth + 20, y, colWidth, 75)
         .stroke('#d1d5db');
      
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#1e3a5f')
         .text('CLIENT', margin + colWidth + 30, y + 8);
      
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827')
         .text(normalizedInvoice.client?.name || '', margin + colWidth + 30, y + 20, { width: colWidth - 20 });
      
      doc.fontSize(7).font('Helvetica').fillColor('#4b5563');
      let clientY = y + 35;
      
      if (normalizedInvoice.client?.company) {
        doc.text(`Entreprise: ${normalizedInvoice.client.company}`, margin + colWidth + 30, clientY);
        clientY += 8;
      }
      
      if (normalizedInvoice.client?.phone) {
        doc.fillColor('#dc2626').font('Helvetica-Bold');
        doc.text(`Numéro: ${normalizedInvoice.client.phone}`, margin + colWidth + 30, clientY);
        clientY += 8;
      }
      
      if (normalizedInvoice.client?.email) {
        doc.fillColor('#4b5563').font('Helvetica');
        doc.text(normalizedInvoice.client.email, margin + colWidth + 30, clientY);
      }

      y += 85;

      // ── META INFOS ──
      const metaBoxHeight = 16;
      const metaLabelWidth = 80;
      
      // Left column: N° Facture
      doc.rect(margin, y, colWidth, metaBoxHeight)
         .fillAndStroke('#f3f4f6', '#d1d5db');
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#374151')
         .text('N° Facture :', margin + 8, y + 3);
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#1e3a5f')
         .text(normalizedInvoice.number, margin + metaLabelWidth, y + 3);

      y += 18;

      // Left column: Objet
      doc.rect(margin, y, colWidth, metaBoxHeight)
         .fillAndStroke('#f3f4f6', '#d1d5db');
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#374151')
         .text('Objet :', margin + 8, y + 3);
      doc.fontSize(7).font('Helvetica').fillColor('#111827')
         .text(normalizedInvoice.object || '—', margin + metaLabelWidth, y + 3);

      // Right column: Date d'émission
      y -= 18;
      doc.rect(margin + colWidth + 20, y, colWidth, metaBoxHeight)
         .fillAndStroke('#f3f4f6', '#d1d5db');
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#374151')
         .text("Date d'émission :", margin + colWidth + 28, y + 3);
      doc.fontSize(7).font('Helvetica').fillColor('#111827')
         .text(formatDate(normalizedInvoice.issueDate), margin + colWidth + 110, y + 3);

      y += 18;

      // Right column: Date d'échéance
      doc.rect(margin + colWidth + 20, y, colWidth, metaBoxHeight)
         .fillAndStroke('#f3f4f6', '#d1d5db');
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#374151')
         .text("Date d'échéance :", margin + colWidth + 28, y + 3);
      doc.fontSize(7).font('Helvetica').fillColor('#111827')
         .text(formatDate(normalizedInvoice.dueDate), margin + colWidth + 110, y + 3);

      y += 22;

      // ── ITEMS TABLE ──
      const tableTop = y;
      const headerHeight = 20;
      const colWidths = [25, 95, 155, 50, 65, 65];

      // Header background
      doc.rect(margin, tableTop, contentWidth, headerHeight)
         .fillAndStroke('#1e3a5f', '#1e3a5f');

      doc.fontSize(7).font('Helvetica-Bold').fillColor('white');
      let colX = margin;
      const headers = ['#', 'Service / produit', 'Description du service / produit', 'Quantité', 'Prix unitaire', 'Montant'];
      
      headers.forEach((header, i) => {
        const align = i === 0 || i === 3 ? 'center' : i >= 4 ? 'right' : 'left';
        const padding = i === 0 ? 3 : 5;
        doc.text(header, colX + padding, tableTop + 5, { width: colWidths[i] - padding * 2, align });
        colX += colWidths[i];
      });

      y = tableTop + headerHeight;

      // Items
      normalizedInvoice.items.forEach((item, idx) => {
        const hasDetailedDesc = item.detailedDescription && item.detailedDescription.trim().length > 0;
        const itemRowHeight = hasDetailedDesc ? 32 : 18;
        
        // Alternate row background
        if (idx % 2 === 0) {
          doc.rect(margin, y, contentWidth, itemRowHeight)
             .fill('#f9fafb');
        }

        // Row border
        doc.rect(margin, y, contentWidth, itemRowHeight)
           .stroke('#d1d5db');

        doc.fontSize(7).font('Helvetica').fillColor('#374151');
        
        // Index
        doc.text(String(idx + 1), margin + 3, y + 3, { width: colWidths[0] - 6, align: 'center' });
        
        // Service/produit
        doc.font('Helvetica-Bold').text(item.description, margin + colWidths[0] + 5, y + 3, { width: colWidths[1] - 10 });
        
        // Description détaillée
        if (hasDetailedDesc) {
          doc.fontSize(6).font('Helvetica').fillColor('#6b7280');
          const lines = item.detailedDescription.split('\n').slice(0, 2);
          lines.forEach((line, i) => {
            doc.text(line, margin + colWidths[0] + colWidths[1] + 5, y + 3 + (i * 7), { width: colWidths[2] - 10 });
          });
          if (item.detailedDescription.split('\n').length > 2) {
            doc.text('...', margin + colWidths[0] + colWidths[1] + 5, y + 17, { width: colWidths[2] - 10 });
          }
        } else {
          doc.fontSize(6).fillColor('#9ca3af').text('-', margin + colWidths[0] + colWidths[1] + 5, y + 3, { width: colWidths[2] - 10 });
        }

        // Quantity
        doc.fontSize(7).font('Helvetica').fillColor('#374151');
        doc.text(String(item.quantity), margin + colWidths[0] + colWidths[1] + colWidths[2] + 3, y + 3, 
                 { width: colWidths[3] - 6, align: 'center' });
        
        // Unit price
        doc.text(formatCurrency(item.unitPrice).replace(' FCFA', ''), 
                 margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 3, y + 3,
                 { width: colWidths[4] - 6, align: 'right' });
        
        // Total
        doc.font('Helvetica-Bold').fillColor('#111827');
        doc.text(formatCurrency(item.total).replace(' FCFA', ''),
                 margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 3, y + 3,
                 { width: colWidths[5] - 6, align: 'right' });

        y += itemRowHeight;
      });

      y += 8;

      // ── TOTALS ──
      const totalsX = margin + contentWidth - 200;
      const totalsWidth = 190;

      // Subtotal
      doc.rect(totalsX, y, totalsWidth, 16)
         .stroke('#d1d5db');
      doc.fontSize(7).font('Helvetica').fillColor('#374151')
         .text('Sous total HT', totalsX + 8, y + 2);
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#111827')
         .text(formatCurrency(normalizedInvoice.subtotal), totalsX + 8, y + 2, { width: totalsWidth - 16, align: 'right' });

      y += 16;

      // Discount
      if (normalizedInvoice.discountRate > 0) {
        doc.rect(totalsX, y, totalsWidth, 16)
           .stroke('#d1d5db');
        doc.fontSize(7).font('Helvetica').fillColor('#dc2626')
           .text(`Remise (${normalizedInvoice.discountRate}%)`, totalsX + 8, y + 2);
        doc.fontSize(7).font('Helvetica-Bold').fillColor('#dc2626')
           .text(`-${formatCurrency(normalizedInvoice.discountAmount)}`, totalsX + 8, y + 2, { width: totalsWidth - 16, align: 'right' });
        y += 16;
      }

      // Tax
      doc.rect(totalsX, y, totalsWidth, 16)
         .stroke('#d1d5db');
      doc.fontSize(7).font('Helvetica').fillColor('#374151')
         .text(`TVA (${normalizedInvoice.taxRate}%)`, totalsX + 8, y + 2);
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#111827')
         .text(formatCurrency(normalizedInvoice.taxAmount), totalsX + 8, y + 2, { width: totalsWidth - 16, align: 'right' });

      y += 16;

      // Total TTC
      doc.rect(totalsX, y, totalsWidth, 22)
         .fillAndStroke('#1e3a5f', '#1e3a5f');
      doc.fontSize(8).font('Helvetica-Bold').fillColor('white')
         .text('TOTAL TTC', totalsX + 8, y + 3);
      doc.fontSize(11).font('Helvetica-Bold').fillColor('white')
         .text(formatCurrency(normalizedInvoice.total), totalsX + 8, y + 3, { width: totalsWidth - 16, align: 'right' });

      y += 30;

      // ── THIN BLUE LINE ──
      doc.moveTo(margin, y)
         .lineTo(pageWidth - margin, y)
         .strokeColor('#1e40af')
         .lineWidth(1.5)
         .stroke();

      y += 12;

      // ── PAYMENT INFO ──
      if (normalizedInvoice.paymentInfo?.mobileMoney?.length || normalizedInvoice.paymentInfo?.bankAccounts?.length) {
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#1e3a5f')
           .text('INFORMATIONS DE PAIEMENT', margin, y);

        y += 10;

        doc.fontSize(7).font('Helvetica-Bold').fillColor('#111827');
        normalizedInvoice.paymentInfo?.mobileMoney?.forEach((mm) => {
          doc.text(`${mm.provider} :`, margin, y);
          doc.font('Helvetica').fillColor('#4b5563').fontSize(6);
          doc.text(`${mm.provider} : ${mm.number}`, margin + 12, y + 7);
          doc.text(`Au nom de : ${mm.name}`, margin + 12, y + 12);
          y += 18;
        });

        doc.fontSize(7).font('Helvetica-Bold').fillColor('#111827');
        normalizedInvoice.paymentInfo?.bankAccounts?.forEach((bank) => {
          doc.text(`${bank.bankName} :`, margin, y);
          doc.font('Helvetica').fillColor('#4b5563').fontSize(6);
          doc.text(`${bank.bankName} : ${bank.accountNumber}`, margin + 12, y + 7);
          doc.text(`Au nom de : ${bank.accountName}`, margin + 12, y + 12);
          y += 18;
        });

        y += 3;
      }

      // ── CONDITIONS ──
      if (normalizedInvoice.terms) {
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#1e3a5f')
           .text('Conditions de paiement :', margin, y);
        doc.fontSize(7).font('Helvetica').fillColor('#4b5563')
           .text(normalizedInvoice.terms, margin, y + 8, { width: contentWidth });
        y += 28;
      }

      y += 8;

      // ── SIGNATURES ──
      const sigWidth = (contentWidth - 20) / 2;
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#111827')
         .text('Signature / Cachet DevGroup Africa', margin, y);
      doc.text('Bon pour accord — Client', margin + sigWidth + 20, y);

      y += 28;
      doc.moveTo(margin, y)
         .lineTo(margin + sigWidth, y)
         .strokeColor('#9ca3af')
         .lineWidth(0.5)
         .stroke();

      doc.moveTo(margin + sigWidth + 20, y)
         .lineTo(margin + sigWidth + 20 + sigWidth, y)
         .strokeColor('#9ca3af')
         .lineWidth(0.5)
         .stroke();

      y += 6;
      doc.fontSize(6).font('Helvetica').fillColor('#9ca3af')
         .text('Nom & Qualité : ___________________________', margin, y);
      doc.text('Nom & Qualité : ___________________________', margin + sigWidth + 20, y);

      y += 18;

      // ── FOOTER ──
      doc.fontSize(9).font('Helvetica').fillColor('#1e3a5f')
         .text('Merci pour votre confiance !', margin, y, { align: 'center', width: contentWidth });

      y += 12;

      // Footer info bar with rounded corners
      doc.rect(margin, y, contentWidth, 18)
         .fillAndStroke('#1e3a5f', '#1e3a5f');

      doc.fontSize(6).font('Helvetica').fillColor('white');
      let footerX = margin + 12;
      
      if (normalizedInvoice.companyInfo?.email) {
        doc.text(`✉ ${normalizedInvoice.companyInfo.email}`, footerX, y + 4);
        footerX += 140;
      }
      if (normalizedInvoice.companyInfo?.phone) {
        doc.text(`✆ ${normalizedInvoice.companyInfo.phone}`, footerX, y + 4);
        footerX += 110;
      }
      if (normalizedInvoice.companyInfo?.city) {
        doc.text(`📍 ${normalizedInvoice.companyInfo.city}`, footerX, y + 4);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
