import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: [true, 'La facture est requise']
  },
  amount: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0.01, 'Le montant doit être positif']
  },
  method: {
    type: String,
    required: [true, 'La méthode de paiement est requise'],
    enum: {
      values: ['cash', 'bank_transfer', 'check', 'mobile_money', 'card'],
      message: 'Méthode de paiement invalide'
    }
  },
  date: {
    type: Date,
    required: [true, 'La date de paiement est requise'],
    default: Date.now
  },
  reference: {
    type: String,
    trim: true
  },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount'
  },
  notes: String,
  
  // Référence comptable
  journalEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
  },
  
  // Métadonnées
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour performance
paymentSchema.index({ invoice: 1 });
paymentSchema.index({ date: -1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ status: 1 });

// Validation : le paiement ne peut pas dépasser le montant dû
paymentSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('amount')) {
    const Invoice = mongoose.model('Invoice');
    const invoice = await Invoice.findById(this.invoice);
    
    if (!invoice) {
      return next(new Error('Facture introuvable'));
    }
    
    // Calculer le total des paiements existants (sauf celui-ci si modification)
    const existingPayments = await this.constructor.find({
      invoice: this.invoice,
      _id: { $ne: this._id },
      status: { $ne: 'cancelled' }
    });
    
    const totalExistingPayments = existingPayments.reduce((sum, p) => sum + p.amount, 0);
    const newTotal = totalExistingPayments + this.amount;
    
    if (newTotal > invoice.total) {
      return next(new Error(`Le montant total des paiements (${newTotal}) dépasse le montant de la facture (${invoice.total})`));
    }
  }
  
  next();
});

// Mise à jour de la facture après paiement
paymentSchema.post('save', async function() {
  await this.updateInvoiceStatus();
  if (!this.journalEntry) {
    await this.generateJournalEntry();
  }
});

// Mise à jour de la facture après suppression
paymentSchema.post('remove', async function() {
  await this.updateInvoiceStatus();
});

// Méthode pour mettre à jour le statut de la facture
paymentSchema.methods.updateInvoiceStatus = async function() {
  const Invoice = mongoose.model('Invoice');
  
  // Calculer le total des paiements confirmés
  const payments = await this.constructor.find({
    invoice: this.invoice,
    status: 'confirmed'
  });
  
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  
  // Mettre à jour la facture
  const invoice = await Invoice.findById(this.invoice);
  invoice.paidAmount = totalPaid;
  await invoice.save();
};

// Méthode pour générer l'écriture comptable
paymentSchema.methods.generateJournalEntry = async function() {
  const JournalEntry = mongoose.model('JournalEntry');
  const Account = mongoose.model('Account');
  
  if (this.journalEntry) {
    throw new Error('Écriture comptable déjà générée pour ce paiement');
  }
  
  const entries = [];
  
  // Débit : Compte de trésorerie selon la méthode
  let treasuryAccountCode;
  switch (this.method) {
    case 'cash':
      treasuryAccountCode = '531'; // Caisse
      break;
    case 'bank_transfer':
    case 'check':
    case 'card':
      treasuryAccountCode = '512'; // Banque
      break;
    case 'mobile_money':
      treasuryAccountCode = '513'; // Mobile Money (à créer)
      break;
    default:
      treasuryAccountCode = '512';
  }
  
  const treasuryAccount = await Account.findOne({ code: treasuryAccountCode });
  const clientAccount = await Account.findOne({ code: '411' });
  
  entries.push({
    account: treasuryAccount._id,
    debit: this.amount,
    credit: 0
  });
  
  // Crédit : Compte client (411)
  entries.push({
    account: clientAccount._id,
    debit: 0,
    credit: this.amount
  });
  
  const journalEntry = new JournalEntry({
    date: this.date,
    reference: this.reference || `PAY-${this._id.toString().slice(-6)}`,
    description: `Paiement facture - ${this.reference || this._id}`,
    entries,
    sourceType: 'payment',
    sourceId: this._id,
    createdBy: this.createdBy
  });
  
  await journalEntry.save();
  this.journalEntry = journalEntry._id;
  await this.save();
  
  return journalEntry;
};

export const Payment = mongoose.model('Payment', paymentSchema);