import ExcelJS from 'exceljs';

export const generateInvoiceExcel = async (invoice) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Facture');

  // Styles
  const headerStyle = {
    font: { bold: true, size: 14, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } },
    alignment: { vertical: 'middle', horizontal: 'center' }
  };

  const titleStyle = {
    font: { bold: true, size: 18 },
    alignment: { vertical: 'middle', horizontal: 'center' }
  };

  const boldStyle = {
    font: { bold: true }
  };

  // Titre
  worksheet.mergeCells('A1:E1');
  worksheet.getCell('A1').value = 'FACTURE';
  worksheet.getCell('A1').style = titleStyle;
  worksheet.getRow(1).height = 30;

  // Informations entreprise
  let row = 3;
  worksheet.getCell(`A${row}`).value = invoice.companyInfo?.name || 'DevGroup Africa';
  worksheet.getCell(`A${row}`).font = { bold: true, size: 12 };
  row++;
  if (invoice.companyInfo?.address) {
    worksheet.getCell(`A${row}`).value = invoice.companyInfo.address;
    row++;
  }
  if (invoice.companyInfo?.city) {
    worksheet.getCell(`A${row}`).value = invoice.companyInfo.city;
    row++;
  }
  if (invoice.companyInfo?.phone) {
    worksheet.getCell(`A${row}`).value = `Tél: ${invoice.companyInfo.phone}`;
    row++;
  }
  if (invoice.companyInfo?.email) {
    worksheet.getCell(`A${row}`).value = `Email: ${invoice.companyInfo.email}`;
    row++;
  }

  // Informations facture (à droite)
  worksheet.getCell('D3').value = 'N° Facture:';
  worksheet.getCell('D3').font = boldStyle.font;
  worksheet.getCell('E3').value = invoice.number;
  
  worksheet.getCell('D4').value = 'Date d\'émission:';
  worksheet.getCell('D4').font = boldStyle.font;
  worksheet.getCell('E4').value = new Date(invoice.issueDate).toLocaleDateString('fr-FR');
  
  worksheet.getCell('D5').value = 'Date d\'échéance:';
  worksheet.getCell('D5').font = boldStyle.font;
  worksheet.getCell('E5').value = new Date(invoice.dueDate).toLocaleDateString('fr-FR');

  if (invoice.object) {
    worksheet.getCell('D6').value = 'Objet:';
    worksheet.getCell('D6').font = boldStyle.font;
    worksheet.getCell('E6').value = invoice.object;
  }

  row += 2;

  // Informations client
  worksheet.getCell(`A${row}`).value = 'CLIENT';
  worksheet.getCell(`A${row}`).font = { bold: true, size: 12 };
  row++;
  
  if (invoice.client) {
    worksheet.getCell(`A${row}`).value = invoice.client.name;
    row++;
    if (invoice.client.company) {
      worksheet.getCell(`A${row}`).value = invoice.client.company;
      row++;
    }
    if (invoice.client.address?.street) {
      worksheet.getCell(`A${row}`).value = invoice.client.address.street;
      row++;
    }
    if (invoice.client.address?.city) {
      worksheet.getCell(`A${row}`).value = `${invoice.client.address.postalCode || ''} ${invoice.client.address.city}`;
      row++;
    }
  }

  row += 2;

  // Tableau des articles
  const tableStartRow = row;
  
  // En-tête du tableau
  worksheet.getCell(`A${row}`).value = '#';
  worksheet.getCell(`B${row}`).value = 'Description';
  worksheet.getCell(`C${row}`).value = 'Quantité';
  worksheet.getCell(`D${row}`).value = 'Prix unitaire';
  worksheet.getCell(`E${row}`).value = 'Total';
  
  ['A', 'B', 'C', 'D', 'E'].forEach(col => {
    worksheet.getCell(`${col}${row}`).style = headerStyle;
  });
  
  row++;

  // Lignes du tableau
  invoice.items.forEach((item, index) => {
    worksheet.getCell(`A${row}`).value = index + 1;
    worksheet.getCell(`B${row}`).value = item.description;
    worksheet.getCell(`C${row}`).value = item.quantity;
    worksheet.getCell(`D${row}`).value = item.unitPrice;
    worksheet.getCell(`D${row}`).numFmt = '#,##0 "FCFA"';
    worksheet.getCell(`E${row}`).value = item.total;
    worksheet.getCell(`E${row}`).numFmt = '#,##0 "FCFA"';
    row++;
  });

  row += 2;

  // Totaux
  worksheet.getCell(`D${row}`).value = 'Sous-total HT:';
  worksheet.getCell(`D${row}`).font = boldStyle.font;
  worksheet.getCell(`E${row}`).value = invoice.subtotal;
  worksheet.getCell(`E${row}`).numFmt = '#,##0 "FCFA"';
  row++;

  if (invoice.discountRate > 0) {
    worksheet.getCell(`D${row}`).value = `Remise (${invoice.discountRate}%):`;
    worksheet.getCell(`D${row}`).font = boldStyle.font;
    worksheet.getCell(`E${row}`).value = -invoice.discountAmount;
    worksheet.getCell(`E${row}`).numFmt = '#,##0 "FCFA"';
    worksheet.getCell(`E${row}`).font = { color: { argb: 'FFDC2626' } };
    row++;
  }

  worksheet.getCell(`D${row}`).value = `TVA (${invoice.taxRate}%):`;
  worksheet.getCell(`D${row}`).font = boldStyle.font;
  worksheet.getCell(`E${row}`).value = invoice.taxAmount;
  worksheet.getCell(`E${row}`).numFmt = '#,##0 "FCFA"';
  row++;

  worksheet.getCell(`D${row}`).value = 'TOTAL TTC:';
  worksheet.getCell(`D${row}`).font = { bold: true, size: 14 };
  worksheet.getCell(`E${row}`).value = invoice.total;
  worksheet.getCell(`E${row}`).numFmt = '#,##0 "FCFA"';
  worksheet.getCell(`E${row}`).font = { bold: true, size: 14 };
  worksheet.getCell(`E${row}`).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E40AF' }
  };
  worksheet.getCell(`E${row}`).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };

  // Ajuster les largeurs de colonnes
  worksheet.getColumn('A').width = 8;
  worksheet.getColumn('B').width = 40;
  worksheet.getColumn('C').width = 12;
  worksheet.getColumn('D').width = 20;
  worksheet.getColumn('E').width = 20;

  return await workbook.xlsx.writeBuffer();
};
