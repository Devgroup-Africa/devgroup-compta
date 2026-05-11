import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle, VerticalAlign } from 'docx';

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

export const generateInvoiceWord = async (invoice) => {
  const children = [];

  // ── HEADER: Company Name ──
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: invoice.companyInfo?.name || 'DevGroup Africa',
          bold: true,
          size: 24,
          color: '1e3a5f'
        })
      ],
      spacing: { after: 200 }
    })
  );

  // ── FACTURE TITLE ──
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'FACTURE',
          bold: true,
          size: 56,
          color: '1e40af'
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    })
  );

  // ── ÉMETTEUR + CLIENT TABLE ──
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            // Émetteur
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'ÉMETTEUR',
                      bold: true,
                      size: 16,
                      color: '1e3a5f'
                    })
                  ],
                  spacing: { after: 100 }
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: invoice.companyInfo?.name || 'DevGroup Africa',
                      bold: true,
                      size: 22,
                      color: '1e3a5f'
                    })
                  ],
                  spacing: { after: 100 }
                }),
                ...(invoice.companyInfo?.address ? [
                  new Paragraph({
                    text: invoice.companyInfo.address,
                    spacing: { after: 50 }
                  })
                ] : []),
                ...(invoice.companyInfo?.email ? [
                  new Paragraph({
                    text: invoice.companyInfo.email,
                    spacing: { after: 50 }
                  })
                ] : []),
                ...(invoice.companyInfo?.phone ? [
                  new Paragraph({
                    text: invoice.companyInfo.phone,
                    spacing: { after: 50 }
                  })
                ] : [])
              ],
              shading: { fill: 'e8f1ff' },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }),
            // Client
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'CLIENT',
                      bold: true,
                      size: 16,
                      color: '1e3a5f'
                    })
                  ],
                  spacing: { after: 100 }
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: invoice.client?.name || '',
                      bold: true,
                      size: 22,
                      color: '111827'
                    })
                  ],
                  spacing: { after: 100 }
                }),
                ...(invoice.client?.company ? [
                  new Paragraph({
                    text: `Entreprise: ${invoice.client.company}`,
                    spacing: { after: 50 }
                  })
                ] : []),
                ...(invoice.client?.phone ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Numéro: ${invoice.client.phone}`,
                        color: 'dc2626',
                        bold: true
                      })
                    ],
                    spacing: { after: 50 }
                  })
                ] : []),
                ...(invoice.client?.email ? [
                  new Paragraph({
                    text: invoice.client.email,
                    spacing: { after: 50 }
                  })
                ] : [])
              ],
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            })
          ]
        })
      ]
    })
  );

  children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // ── META INFOS TABLE ──
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'N° Facture :',
                      bold: true,
                      size: 14
                    })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: invoice.number,
                      bold: true,
                      size: 14,
                      color: '1e3a5f'
                    })
                  ]
                })
              ],
              shading: { fill: 'f3f4f6' },
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Date d'émission :",
                      bold: true,
                      size: 14
                    })
                  ]
                }),
                new Paragraph({
                  text: formatDate(invoice.issueDate)
                })
              ],
              shading: { fill: 'f3f4f6' },
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Objet :',
                      bold: true,
                      size: 14
                    })
                  ]
                }),
                new Paragraph({
                  text: invoice.object || '—'
                })
              ],
              shading: { fill: 'f3f4f6' },
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Date d'échéance :",
                      bold: true,
                      size: 14
                    })
                  ]
                }),
                new Paragraph({
                  text: formatDate(invoice.dueDate)
                })
              ],
              shading: { fill: 'f3f4f6' },
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            })
          ]
        })
      ]
    })
  );

  children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // ── ITEMS TABLE ──
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        // Header
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: '#', bold: true, alignment: AlignmentType.CENTER })],
              shading: { fill: '1e3a5f' },
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Service / produit', bold: true })],
              shading: { fill: '1e3a5f' },
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Description du service / produit', bold: true })],
              shading: { fill: '1e3a5f' },
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Quantité', bold: true, alignment: AlignmentType.CENTER })],
              shading: { fill: '1e3a5f' },
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Prix unitaire', bold: true, alignment: AlignmentType.RIGHT })],
              shading: { fill: '1e3a5f' },
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Montant', bold: true, alignment: AlignmentType.RIGHT })],
              shading: { fill: '1e3a5f' },
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            })
          ]
        }),
        // Items
        ...invoice.items.map((item, idx) => new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: String(idx + 1), alignment: AlignmentType.CENTER })],
              shading: idx % 2 === 0 ? { fill: 'f9fafb' } : undefined,
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            }),
            new TableCell({
              children: [new Paragraph({ text: item.description, bold: true })],
              shading: idx % 2 === 0 ? { fill: 'f9fafb' } : undefined,
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            }),
            new TableCell({
              children: item.detailedDescription ? [
                ...item.detailedDescription.split('\n').slice(0, 2).map(line => 
                  new Paragraph({ text: line, size: 18 })
                ),
                ...(item.detailedDescription.split('\n').length > 2 ? [new Paragraph({ text: '...' })] : [])
              ] : [new Paragraph({ text: '-' })],
              shading: idx % 2 === 0 ? { fill: 'f9fafb' } : undefined,
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            }),
            new TableCell({
              children: [new Paragraph({ text: String(item.quantity), alignment: AlignmentType.CENTER })],
              shading: idx % 2 === 0 ? { fill: 'f9fafb' } : undefined,
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            }),
            new TableCell({
              children: [new Paragraph({ text: formatCurrency(item.unitPrice).replace(' FCFA', ''), alignment: AlignmentType.RIGHT })],
              shading: idx % 2 === 0 ? { fill: 'f9fafb' } : undefined,
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            }),
            new TableCell({
              children: [new Paragraph({ text: formatCurrency(item.total).replace(' FCFA', ''), bold: true, alignment: AlignmentType.RIGHT })],
              shading: idx % 2 === 0 ? { fill: 'f9fafb' } : undefined,
              margins: { top: 50, bottom: 50, left: 50, right: 50 }
            })
          ]
        }))
      ]
    })
  );

  children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // ── TOTALS ──
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Sous total HT',
          size: 14
        }),
        new TextRun({
          text: '\t\t\t\t\t',
          size: 14
        }),
        new TextRun({
          text: formatCurrency(invoice.subtotal),
          bold: true,
          size: 14
        })
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 }
    })
  );

  if (invoice.discountRate > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Remise (${invoice.discountRate}%)`,
            color: 'dc2626',
            size: 14
          }),
          new TextRun({
            text: '\t\t\t\t\t',
            size: 14
          }),
          new TextRun({
            text: `-${formatCurrency(invoice.discountAmount)}`,
            bold: true,
            color: 'dc2626',
            size: 14
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 }
      })
    );
  }

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `TVA (${invoice.taxRate}%)`,
          size: 14
        }),
        new TextRun({
          text: '\t\t\t\t\t',
          size: 14
        }),
        new TextRun({
          text: formatCurrency(invoice.taxAmount),
          bold: true,
          size: 14
        })
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 }
    })
  );

  // Total TTC
  children.push(
    new Table({
      width: { size: 50, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'TOTAL TTC',
                      bold: true,
                      size: 16,
                      color: 'ffffff'
                    })
                  ]
                })
              ],
              shading: { fill: '1e3a5f' },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: formatCurrency(invoice.total),
                      bold: true,
                      size: 20,
                      color: 'ffffff'
                    })
                  ],
                  alignment: AlignmentType.RIGHT
                })
              ],
              shading: { fill: '1e3a5f' },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            })
          ]
        })
      ]
    })
  );

  children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // ── PAYMENT INFO ──
  if (invoice.paymentInfo?.mobileMoney?.length || invoice.paymentInfo?.bankAccounts?.length) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'INFORMATIONS DE PAIEMENT',
            bold: true,
            size: 16,
            color: '1e3a5f'
          })
        ],
        spacing: { after: 100 }
      })
    );

    invoice.paymentInfo?.mobileMoney?.forEach((mm) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${mm.provider} :`,
              bold: true
            })
          ],
          spacing: { after: 50 }
        })
      );
      children.push(
        new Paragraph({
          text: `${mm.provider} : ${mm.number}`,
          spacing: { after: 30 }
        })
      );
      children.push(
        new Paragraph({
          text: `Au nom de : ${mm.name}`,
          spacing: { after: 100 }
        })
      );
    });

    invoice.paymentInfo?.bankAccounts?.forEach((bank) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${bank.bankName} :`,
              bold: true
            })
          ],
          spacing: { after: 50 }
        })
      );
      children.push(
        new Paragraph({
          text: `${bank.bankName} : ${bank.accountNumber}`,
          spacing: { after: 30 }
        })
      );
      children.push(
        new Paragraph({
          text: `Au nom de : ${bank.accountName}`,
          spacing: { after: 100 }
        })
      );
    });
  }

  // ── CONDITIONS ──
  if (invoice.terms) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Conditions de paiement :',
            bold: true
          })
        ],
        spacing: { after: 100 }
      })
    );
    children.push(
      new Paragraph({
        text: invoice.terms,
        spacing: { after: 200 }
      })
    );
  }

  // ── SIGNATURES ──
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Signature / Cachet DevGroup Africa',
                      bold: true
                    })
                  ],
                  spacing: { after: 300 }
                }),
                new Paragraph({
                  text: 'Nom & Qualité : ___________________________'
                })
              ],
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Bon pour accord — Client',
                      bold: true
                    })
                  ],
                  spacing: { after: 300 }
                }),
                new Paragraph({
                  text: 'Nom & Qualité : ___________________________'
                })
              ],
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            })
          ]
        })
      ]
    })
  );

  children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // ── FOOTER ──
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Merci pour votre confiance !',
          italics: true,
          size: 18
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    })
  );

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `✉ ${invoice.companyInfo?.email || ''} | ✆ ${invoice.companyInfo?.phone || ''} | 📍 ${invoice.companyInfo?.city || ''}`,
                      color: 'ffffff',
                      size: 12
                    })
                  ],
                  alignment: AlignmentType.CENTER
                })
              ],
              shading: { fill: '1e3a5f' },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            })
          ]
        })
      ]
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children
    }]
  });

  return await Packer.toBuffer(doc);
};

export const generateBankStatementWord = async (account, transactions) => {
  const formatAmount = (amount) => {
    return `${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
  };

  let runningBalance = account.initialBalance;
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: 'RELEVÉ DE COMPTE',
          heading: 'Heading1',
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),

        new Paragraph({
          text: 'Factures',
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),

        new Paragraph({
          text: `DevGroup Africa Compta - ${account.accountNumber}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: `Date d'édition: `,
              bold: true
            }),
            new TextRun({
              text: new Date().toLocaleDateString('fr-FR')
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: `Solde initial: `,
              bold: true
            }),
            new TextRun({
              text: formatAmount(account.initialBalance),
              color: '1E40AF'
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: `Solde actuel: `,
              bold: true
            }),
            new TextRun({
              text: formatAmount(account.currentBalance),
              color: '16A34A',
              bold: true
            })
          ],
          spacing: { after: 400 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: 'HISTORIQUE DES TRANSACTIONS',
              bold: true,
              size: 24,
              color: '1E40AF'
            })
          ],
          spacing: { after: 200 }
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ 
                  children: [new Paragraph({ text: 'Date', bold: true })],
                  shading: { fill: '1E3A5F' }
                }),
                new TableCell({ 
                  children: [new Paragraph({ text: 'Description', bold: true })],
                  shading: { fill: '1E3A5F' }
                }),
                new TableCell({ 
                  children: [new Paragraph({ text: 'Référence', bold: true })],
                  shading: { fill: '1E3A5F' }
                }),
                new TableCell({ 
                  children: [new Paragraph({ text: 'Débit', bold: true })],
                  shading: { fill: '1E3A5F' }
                }),
                new TableCell({ 
                  children: [new Paragraph({ text: 'Crédit', bold: true })],
                  shading: { fill: '1E3A5F' }
                }),
                new TableCell({ 
                  children: [new Paragraph({ text: 'Solde', bold: true })],
                  shading: { fill: '1E3A5F' }
                })
              ]
            }),
            ...transactions.map((transaction, index) => {
              if (transaction.type === 'income') {
                runningBalance += transaction.amount;
              } else {
                runningBalance -= transaction.amount;
              }

              const debit = transaction.type === 'expense' ? formatAmount(transaction.amount) : '-';
              const credit = transaction.type === 'income' ? formatAmount(transaction.amount) : '-';

              return new TableRow({
                children: [
                  new TableCell({ 
                    children: [new Paragraph(new Date(transaction.date).toLocaleDateString('fr-FR'))],
                    shading: index % 2 === 0 ? { fill: 'F9FAFB' } : undefined
                  }),
                  new TableCell({ 
                    children: [new Paragraph(transaction.description)],
                    shading: index % 2 === 0 ? { fill: 'F9FAFB' } : undefined
                  }),
                  new TableCell({ 
                    children: [new Paragraph(transaction.reference || '-')],
                    shading: index % 2 === 0 ? { fill: 'F9FAFB' } : undefined
                  }),
                  new TableCell({ 
                    children: [new Paragraph({
                      text: debit,
                      alignment: AlignmentType.RIGHT,
                      children: transaction.type === 'expense' ? [new TextRun({ text: debit, color: 'DC2626', bold: true })] : undefined
                    })],
                    shading: index % 2 === 0 ? { fill: 'F9FAFB' } : undefined
                  }),
                  new TableCell({ 
                    children: [new Paragraph({
                      text: credit,
                      alignment: AlignmentType.RIGHT,
                      children: transaction.type === 'income' ? [new TextRun({ text: credit, color: '16A34A', bold: true })] : undefined
                    })],
                    shading: index % 2 === 0 ? { fill: 'F9FAFB' } : undefined
                  }),
                  new TableCell({ 
                    children: [new Paragraph({
                      text: formatAmount(runningBalance),
                      alignment: AlignmentType.RIGHT,
                      bold: true
                    })],
                    shading: index % 2 === 0 ? { fill: 'F9FAFB' } : undefined
                  })
                ]
              });
            })
          ]
        }),

        new Paragraph({ text: '', spacing: { after: 400 } }),

        new Paragraph({
          children: [
            new TextRun({
              text: 'RÉSUMÉ',
              bold: true,
              size: 24,
              color: '1E40AF'
            })
          ],
          spacing: { after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: 'Total des débits: ',
              bold: true
            }),
            new TextRun({
              text: formatAmount(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)),
              color: 'DC2626',
              bold: true
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: 'Total des crédits: ',
              bold: true
            }),
            new TextRun({
              text: formatAmount(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)),
              color: '16A34A',
              bold: true
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: 'Nombre de transactions: ',
              bold: true
            }),
            new TextRun({
              text: transactions.length.toString(),
              bold: true
            })
          ],
          spacing: { after: 400 }
        }),

        new Paragraph({
          text: 'Document généré automatiquement par DevGroup Africa Compta',
          alignment: AlignmentType.CENTER,
          italics: true
        }),

        new Paragraph({
          text: 'Merci pour votre confiance !',
          alignment: AlignmentType.CENTER,
          italics: true
        })
      ]
    }]
  });

  return await Packer.toBuffer(doc);
};
