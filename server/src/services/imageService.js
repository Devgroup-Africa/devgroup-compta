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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderDetailedDescription(description) {
  const lines = String(description || '').split(/\r?\n/);

  return lines
    .map((line) => `
      <div class="description-detail detail-line">
        <span class="detail-dash">-</span>
        <span class="detail-text">${escapeHtml(line)}</span>
      </div>
    `)
    .join('');
}

function generateInvoiceHTML(invoice, logoBase64) {
  const client = invoice.client || {};
  const companyInfo = invoice.companyInfo || {};
  const items = invoice.items || [];
  
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
      font-family: "Segoe UI", Arial, sans-serif;
      background: white;
      padding: 32px;
      color: #1f2937;
    }

    .invoice-page {
      max-width: 896px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo {
      height: 40px;
      width: auto;
    }
    
    .company-name {
      font-size: 14px;
      font-weight: 600;
      color: #1e3a8a;
      letter-spacing: 0.04em;
    }
    
    .blue-line {
      height: 1px;
      background: #2563eb;
      margin: 8px 0 24px 0;
    }
    
    .title-row {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 24px 0 32px;
    }

    .title-accent {
      width: 6px;
      height: 40px;
      background: #1d4ed8;
      border-radius: 2px;
      margin-right: 12px;
    }

    .title {
      font-size: 36px;
      line-height: 40px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: 0.18em;
    }
    
    .thin-line {
      height: 1px;
      background: #2563eb;
      margin-bottom: 28px;
    }
    
    .two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
    }
    
    .box {
      padding: 16px;
      min-height: 88px;
    }
    
    .box.emitter {
      background: #eff6ff;
      border-radius: 2px;
    }
    
    .box-title {
      font-size: 13px;
      font-weight: bold;
      color: #1e3a8a;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    
    .box-name {
      font-size: 14px;
      font-weight: bold;
      color: #1e3a8a;
      margin-bottom: 2px;
    }
    
    .box.client .box-name {
      color: #111827;
    }
    
    .box-text {
      font-size: 13px;
      color: #4b5563;
      line-height: 1.35;
    }
    
    .box-text.red {
      color: #dc2626;
      font-weight: bold;
    }
    
    .meta-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 28px;
    }

    .meta-box {
      background: #f3f4f6;
      border-radius: 2px;
      padding: 8px 12px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      min-height: 32px;
    }
    
    .meta-label {
      width: 144px;
      flex: 0 0 auto;
      font-weight: bold;
      color: #374151;
    }

    .meta-columns > div:first-child .meta-label {
      width: 112px;
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
      margin: 0 0 24px 0;
      table-layout: fixed;
    }
    
    th {
      background: #1e3a5f;
      color: white;
      font-size: 13px;
      font-weight: 600;
      padding: 10px;
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
      padding: 10px;
      border: 1px solid #d1d5db;
      color: #374151;
      vertical-align: top;
      overflow-wrap: anywhere;
      word-break: normal;
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

    .service-cell {
      line-height: 1.35;
      white-space: normal;
    }

    .description-cell {
      white-space: normal;
    }
    
    .description-detail {
      font-size: 11px;
      color: #6b7280;
      line-height: 1.35;
      margin-bottom: 2px;
    }

    .detail-line {
      display: flex;
      gap: 4px;
      align-items: flex-start;
    }

    .detail-dash {
      flex: 0 0 auto;
      color: #9ca3af;
    }

    .detail-text {
      flex: 1 1 auto;
      min-width: 0;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    
    .totals {
      margin-left: auto;
      width: 320px;
      margin-bottom: 32px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
      border: 1px solid #e5e7eb;
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
      padding: 12px 16px;
      margin-top: 2px;
    }

    .payment-section {
      margin-bottom: 32px;
    }

    .payment-section .thin-line {
      margin-bottom: 16px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #1e3a8a;
      margin: 0 0 16px 0;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .payment-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
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
      gap: 48px;
      margin-top: 56px;
    }
    
    .signature-box {
      font-size: 13px;
      font-weight: bold;
      color: #111827;
    }
    
    .signature-line {
      border-top: 0.5px solid #9ca3af;
      margin-top: 64px;
      padding-top: 8px;
      font-size: 11px;
      color: #9ca3af;
      font-weight: normal;
    }
    
    .footer-message {
      text-align: center;
      font-size: 15px;
      color: #1e3a8a;
      margin: 40px 0 12px 0;
      font-style: italic;
      font-weight: 500;
    }
    
    .footer-bar {
      background: #1e3a5f;
      color: white;
      padding: 8px 16px;
      text-align: center;
      font-size: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      border-radius: 2px;
    }

    .footer-separator {
      border-top: 1px solid #d1d5db;
      margin-top: 40px;
    }
  </style>
</head>
<body>
<div class="invoice-page">
  <!-- Header -->
  <div class="header">
    <div class="brand">
      ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Logo" />` : ''}
      <div class="company-name">${escapeHtml(companyInfo.name || 'DevGroup Africa')}</div>
    </div>
  </div>
  
  <div class="blue-line"></div>
  
  <!-- Title -->
  <div class="title-row">
    <div class="title-accent"></div>
    <div class="title">FACTURE</div>
  </div>
  
  <div class="thin-line"></div>
  
  <!-- Emitter + Client -->
  <div class="two-columns">
    <div class="box emitter">
      <div class="box-title">ÉMETTEUR</div>
      <div class="box-name">${escapeHtml(companyInfo.name || 'DevGroup Africa')}</div>
      ${companyInfo.city ? `<div class="box-text">${escapeHtml(companyInfo.city)}</div>` : ''}
      ${companyInfo.email ? `<div class="box-text">${escapeHtml(companyInfo.email)}</div>` : ''}
      ${companyInfo.website ? `<div class="box-text">${escapeHtml(companyInfo.website)}</div>` : ''}
      ${companyInfo.phone ? `<div class="box-text">${escapeHtml(companyInfo.phone)}</div>` : ''}
    </div>
    
    <div class="box client">
      <div class="box-title">CLIENT</div>
      <div class="box-name">${escapeHtml(client.name || '')}</div>
      ${client.company ? `<div class="box-text">Nom: ${escapeHtml(client.company)}</div>` : ''}
      ${client.phone ? `<div class="box-text red">Numéro: ${escapeHtml(client.phone)}</div>` : ''}
      ${client.email ? `<div class="box-text">${escapeHtml(client.email)}</div>` : ''}
      ${client.taxNumber ? `<div class="box-text">${escapeHtml(client.taxNumber)}</div>` : ''}
    </div>
  </div>
  
  <!-- Meta Info -->
  <div class="meta-columns">
    <div>
      <div class="meta-box">
        <span class="meta-label">N° Facture :</span>
        <span class="meta-value blue">${escapeHtml(invoice.number)}</span>
      </div>
      ${invoice.object ? `<div class="meta-box">
        <span class="meta-label">Objet :</span>
        <span class="meta-value">${escapeHtml(invoice.object)}</span>
      </div>` : ''}
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
    <colgroup>
      <col style="width: 6%;">
      <col style="width: 21%;">
      <col style="width: 34%;">
      <col style="width: 11%;">
      <col style="width: 14%;">
      <col style="width: 14%;">
    </colgroup>
    <thead>
      <tr>
        <th class="center">#</th>
        <th>Service / produit</th>
        <th>Description du service / produit</th>
        <th class="center">Quantité</th>
        <th class="right">Prix unitaire</th>
        <th class="right">Montant</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item, idx) => `
        <tr>
          <td class="center">${idx + 1}</td>
          <td class="bold service-cell">${escapeHtml(item.description)}</td>
          <td class="description-cell">
            ${item.detailedDescription ? 
              renderDetailedDescription(item.detailedDescription)
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
      <span>Sous-total HT</span>
      <span><strong>${formatCurrency(invoice.subtotal)}</strong></span>
    </div>
    ${invoice.discountRate > 0 ? `
      <div class="total-row red">
        <span>Remise (${invoice.discountRate}%)</span>
        <span><strong>-${formatCurrency(invoice.discountAmount)}</strong></span>
      </div>
    ` : ''}
    <div class="total-row final">
      <span>TOTAL TTC</span>
      <span>${formatCurrency(invoice.total)}</span>
    </div>
  </div>
  
  <!-- Payment Info -->
  ${(invoice.paymentInfo?.mobileMoney?.length || invoice.paymentInfo?.bankAccounts?.length) ? `
    <div class="payment-section">
      <div class="thin-line"></div>
      <div class="section-title">INFORMATIONS DE PAIEMENT</div>
      <div class="payment-grid">
        ${invoice.paymentInfo.mobileMoney?.map(mm => `
          <div class="payment-item">
            <div class="payment-title">${escapeHtml(mm.provider)} :</div>
            <div class="payment-text">${escapeHtml(mm.provider)} : ${escapeHtml(mm.number)}</div>
            <div class="payment-text">Au nom de : ${escapeHtml(mm.name)}</div>
          </div>
        `).join('') || ''}
        ${invoice.paymentInfo.bankAccounts?.map(bank => `
          <div class="payment-item">
            <div class="payment-title">${escapeHtml(bank.bankName)} :</div>
            <div class="payment-text">${escapeHtml(bank.bankName)} : ${escapeHtml(bank.accountNumber)}</div>
            <div class="payment-text">Au nom de : ${escapeHtml(bank.accountName)}</div>
          </div>
        `).join('') || ''}
      </div>
    </div>
  ` : ''}

  <!-- Signatures -->
  <div class="signatures">
    <div class="signature-box">
      Signature / Cachet ${escapeHtml(companyInfo.name || 'DevGroup Africa')}
      <div class="signature-line">Nom & Qualité : ___________________________</div>
    </div>
    <div class="signature-box">
      Bon pour accord — Client
      <div class="signature-line">Nom & Qualité : ___________________________</div>
    </div>
  </div>
  
  <!-- Footer -->
  <div class="footer-separator"></div>
  <div class="footer-message">Merci pour votre confiance !</div>
  <div class="footer-bar">
    ${companyInfo.email ? `<span>${escapeHtml(companyInfo.email)}</span>` : ''}
    ${companyInfo.phone ? `<span>${escapeHtml(companyInfo.phone)}</span>` : ''}
    ${companyInfo.city ? `<span>${escapeHtml(companyInfo.city)}</span>` : ''}
  </div>
</div>
</body>
</html>
  `;
}
