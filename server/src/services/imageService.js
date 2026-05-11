import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoiceJPEG = async (invoice) => {
  let browser;
  
  try {
    // Convert Mongoose document to plain object
    const invoiceData = invoice.toObject ? invoice.toObject() : invoice;
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport for better quality
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2
    });
    
    // Convert logo to base64
    const logoPath = path.join(__dirname, '../../../public/logo devgroup-1.png');
    let logoBase64 = '';
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }
    
    // Generate HTML content matching InvoiceTemplate
    const html = generateInvoiceHTML(invoiceData, logoBase64);
    
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });
    
    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 100,
      fullPage: true
    });
    
    return screenshot;
  } catch (error) {
    console.error('Error generating JPEG:', error);
    throw new Error(`Erreur lors de la génération du JPEG: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

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

function generateInvoiceHTML(invoice, logoBase64) {
  const client = invoice.client || {};
  const companyInfo = invoice.companyInfo || {};
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      background: white;
      padding: 35px;
      color: #1f2937;
    }
    
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    .logo {
      height: 22px;
      width: auto;
    }
    
    .company-name {
      font-size: 20px;
      font-weight: bold;
      color: #1e3a5f;
    }
    
    .blue-line {
      height: 2px;
      background: #1e40af;
      margin: 10px 0 18px 0;
    }
    
    .title {
      text-align: center;
      font-size: 48px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 18px;
      letter-spacing: 2px;
    }
    
    .thin-line {
      height: 1.5px;
      background: #1e40af;
      margin-bottom: 18px;
    }
    
    .two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 18px;
    }
    
    .box {
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 12px;
      min-height: 85px;
    }
    
    .box.emitter {
      background: #e8f1ff;
    }
    
    .box-title {
      font-size: 13px;
      font-weight: bold;
      color: #1e3a5f;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .box-name {
      font-size: 17px;
      font-weight: bold;
      color: #1e3a5f;
      margin-bottom: 8px;
    }
    
    .box.client .box-name {
      color: #111827;
    }
    
    .box-text {
      font-size: 13px;
      color: #4b5563;
      line-height: 1.5;
      margin-bottom: 3px;
    }
    
    .box-text.red {
      color: #dc2626;
      font-weight: bold;
    }
    
    .meta-box {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 3px;
      padding: 6px 10px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
      min-height: 20px;
    }
    
    .meta-label {
      font-weight: bold;
      color: #374151;
    }
    
    .meta-value {
      color: #111827;
    }
    
    .meta-value.blue {
      color: #1e3a5f;
      font-weight: bold;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 18px 0 10px 0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    th {
      background: #1e3a5f;
      color: white;
      font-size: 13px;
      font-weight: bold;
      padding: 8px;
      text-align: left;
      border: 1px solid #1e3a5f;
    }
    
    th.center {
      text-align: center;
    }
    
    th.right {
      text-align: right;
    }
    
    td {
      font-size: 13px;
      padding: 8px;
      border: 1px solid #d1d5db;
      color: #374151;
    }
    
    tr:nth-child(even) td {
      background: #f9fafb;
    }
    
    td.center {
      text-align: center;
    }
    
    td.right {
      text-align: right;
    }
    
    td.bold {
      font-weight: bold;
      color: #111827;
    }
    
    .description-detail {
      font-size: 11px;
      color: #6b7280;
      margin-top: 2px;
      line-height: 1.4;
    }
    
    .totals {
      margin-left: auto;
      width: 220px;
      margin-top: 10px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 10px;
      border: 1px solid #d1d5db;
      font-size: 13px;
    }
    
    .total-row:first-child {
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
    }
    
    .total-row.red {
      color: #dc2626;
    }
    
    .total-row.final {
      background: #1e3a5f;
      color: white;
      font-weight: bold;
      font-size: 15px;
      padding: 8px 10px;
      border-radius: 3px;
      margin-top: 2px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #1e3a5f;
      margin: 15px 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .payment-item {
      margin-bottom: 12px;
    }
    
    .payment-title {
      font-size: 13px;
      font-weight: bold;
      color: #111827;
      margin-bottom: 4px;
    }
    
    .payment-text {
      font-size: 12px;
      color: #4b5563;
      line-height: 1.5;
    }
    
    .conditions-text {
      font-size: 13px;
      color: #4b5563;
      line-height: 1.5;
      margin-top: 5px;
    }
    
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }
    
    .signature-box {
      font-size: 13px;
      font-weight: bold;
      color: #111827;
    }
    
    .signature-line {
      border-top: 0.5px solid #9ca3af;
      margin-top: 30px;
      padding-top: 8px;
      font-size: 11px;
      color: #9ca3af;
      font-weight: normal;
    }
    
    .footer-message {
      text-align: center;
      font-size: 15px;
      color: #1e3a5f;
      margin: 15px 0 10px 0;
      font-style: italic;
    }
    
    .footer-bar {
      background: #1e3a5f;
      color: white;
      padding: 8px 12px;
      text-align: center;
      font-size: 11px;
      display: flex;
      justify-content: center;
      gap: 15px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Logo" />` : ''}
    <div class="company-name">${companyInfo.name || 'DevGroup Africa'}</div>
  </div>
  
  <div class="blue-line"></div>
  
  <!-- Title -->
  <div class="title">FACTURE</div>
  
  <div class="thin-line"></div>
  
  <!-- Emitter + Client -->
  <div class="two-columns">
    <div class="box emitter">
      <div class="box-title">ÉMETTEUR</div>
      <div class="box-name">${companyInfo.name || 'DevGroup Africa'}</div>
      ${companyInfo.address ? `<div class="box-text">${companyInfo.address}</div>` : ''}
      ${companyInfo.email ? `<div class="box-text">${companyInfo.email}</div>` : ''}
      ${companyInfo.phone ? `<div class="box-text">${companyInfo.phone}</div>` : ''}
    </div>
    
    <div class="box client">
      <div class="box-title">CLIENT</div>
      <div class="box-name">${client.name || ''}</div>
      ${client.company ? `<div class="box-text">Entreprise: ${client.company}</div>` : ''}
      ${client.phone ? `<div class="box-text red">Numéro: ${client.phone}</div>` : ''}
      ${client.email ? `<div class="box-text">${client.email}</div>` : ''}
    </div>
  </div>
  
  <!-- Meta Info -->
  <div class="two-columns">
    <div>
      <div class="meta-box">
        <span class="meta-label">N° Facture :</span>
        <span class="meta-value blue">${invoice.number}</span>
      </div>
      <div class="meta-box">
        <span class="meta-label">Objet :</span>
        <span class="meta-value">${invoice.object || '—'}</span>
      </div>
    </div>
    <div>
      <div class="meta-box">
        <span class="meta-label">Date d'émission :</span>
        <span class="meta-value">${formatDate(invoice.issueDate)}</span>
      </div>
      <div class="meta-box">
        <span class="meta-label">Date d'échéance :</span>
        <span class="meta-value">${formatDate(invoice.dueDate)}</span>
      </div>
    </div>
  </div>
  
  <!-- Items Table -->
  <table>
    <thead>
      <tr>
        <th class="center" style="width: 25px;">#</th>
        <th style="width: 95px;">Service / produit</th>
        <th style="width: 155px;">Description du service / produit</th>
        <th class="center" style="width: 50px;">Quantité</th>
        <th class="right" style="width: 65px;">Prix unitaire</th>
        <th class="right" style="width: 65px;">Montant</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map((item, idx) => `
        <tr>
          <td class="center">${idx + 1}</td>
          <td class="bold">${item.description}</td>
          <td>
            ${item.detailedDescription ? 
              item.detailedDescription.split('\n').slice(0, 2).map(line => `<div class="description-detail">${line}</div>`).join('') +
              (item.detailedDescription.split('\n').length > 2 ? '<div class="description-detail">...</div>' : '')
              : '<span style="color: #9ca3af;">-</span>'}
          </td>
          <td class="center">${item.quantity}</td>
          <td class="right">${formatCurrency(item.unitPrice).replace(' FCFA', '')}</td>
          <td class="right bold">${formatCurrency(item.total).replace(' FCFA', '')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <!-- Totals -->
  <div class="totals">
    <div class="total-row">
      <span>Sous total HT</span>
      <span><strong>${formatCurrency(invoice.subtotal)}</strong></span>
    </div>
    ${invoice.discountRate > 0 ? `
      <div class="total-row red">
        <span>Remise (${invoice.discountRate}%)</span>
        <span><strong>-${formatCurrency(invoice.discountAmount)}</strong></span>
      </div>
    ` : ''}
    <div class="total-row">
      <span>TVA (${invoice.taxRate}%)</span>
      <span><strong>${formatCurrency(invoice.taxAmount)}</strong></span>
    </div>
    <div class="total-row final">
      <span>TOTAL TTC</span>
      <span>${formatCurrency(invoice.total)}</span>
    </div>
  </div>
  
  <div class="thin-line" style="margin-top: 15px;"></div>
  
  <!-- Payment Info -->
  ${(invoice.paymentInfo?.mobileMoney?.length || invoice.paymentInfo?.bankAccounts?.length) ? `
    <div class="section-title">INFORMATIONS DE PAIEMENT</div>
    ${invoice.paymentInfo.mobileMoney?.map(mm => `
      <div class="payment-item">
        <div class="payment-title">${mm.provider} :</div>
        <div class="payment-text">${mm.provider} : ${mm.number}</div>
        <div class="payment-text">Au nom de : ${mm.name}</div>
      </div>
    `).join('') || ''}
    ${invoice.paymentInfo.bankAccounts?.map(bank => `
      <div class="payment-item">
        <div class="payment-title">${bank.bankName} :</div>
        <div class="payment-text">${bank.bankName} : ${bank.accountNumber}</div>
        <div class="payment-text">Au nom de : ${bank.accountName}</div>
      </div>
    `).join('') || ''}
  ` : ''}
  
  <!-- Terms -->
  ${invoice.terms ? `
    <div class="section-title">Conditions de paiement :</div>
    <div class="conditions-text">${invoice.terms}</div>
  ` : ''}
  
  <!-- Signatures -->
  <div class="signatures">
    <div class="signature-box">
      Signature / Cachet DevGroup Africa
      <div class="signature-line">Nom & Qualité : ___________________________</div>
    </div>
    <div class="signature-box">
      Bon pour accord — Client
      <div class="signature-line">Nom & Qualité : ___________________________</div>
    </div>
  </div>
  
  <!-- Footer -->
  <div class="footer-message">Merci pour votre confiance !</div>
  <div class="footer-bar">
    ${companyInfo.email ? `<span>✉ ${companyInfo.email}</span>` : ''}
    ${companyInfo.phone ? `<span>✆ ${companyInfo.phone}</span>` : ''}
    ${companyInfo.city ? `<span>📍 ${companyInfo.city}</span>` : ''}
  </div>
</body>
</html>
  `;
}
