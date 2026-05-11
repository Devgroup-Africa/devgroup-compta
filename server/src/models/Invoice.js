import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true
  },
  detailedDescription: {
    type: String,
    trim: true,
    maxlength: [1000, 'La description détaillée ne peut pas dépasser 1000 caractères']
  },
  quantity: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [0.01, 'La quantité doit être positive']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Le prix unitaire est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  total: {
    type: Number,
    default: 0
  },
  // Compte comptable pour cette ligne
  accountCode: {
    type: String,
    default: '701' // Ventes par défaut
  }
});

const invoiceSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Le numéro de facture est requis'],
    unique: true,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Le client est requis']
  },
  items: [invoiceItemSchema],
  
  // Montants
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 19.25, // TVA Cameroun
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Dates
  issueDate: {
    type: Date,
    required: [true, 'La date d\'émission est requise'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'La date d\'échéance est requise']
  },
  
  // Statut
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'],
    default: 'draft'
  },
  
  // Paiements
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Références comptables
  journalEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
  },
  
  // Compte bancaire de destination pour cette facture
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount'
  },
  
  // Métadonnées de cancellation
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Métadonnées
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Informations supplémentaires
  object: {
    type: String,
    trim: true,
    default: ''
  },
  notes: String,
  terms: String,
  
  // Informations de paiement
  paymentInfo: {
    mobileMoney: [{
      provider: String, // Airtel Money, Moov Money, etc.
      number: String,
      name: String
    }],
    bankAccounts: [{
      bankName: String,
      accountNumber: String,
      accountName: String
    }]
  },
  
  // Informations de l'entreprise émettrice (pour personnalisation)
  companyInfo: {
    name: String,
    address: String,
    city: String,
    phone: String,
    email: String,
    website: String,
    logo: String, // URL ou chemin du logo
    registrationNumber: String,
    taxNumber: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour performance
invoiceSchema.index({ number: 1 });
invoiceSchema.index({ client: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ issueDate: -1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ status: 1, cancelledAt: -1 });

// Track original state for validation
invoiceSchema.post('init', function() {
  this._original = this.toObject();
});

// Virtual pour le montant restant dû
invoiceSchema.virtual('amountDue').get(function() {
  return this.total - this.paidAmount;
});

// Virtual pour savoir si en retard
invoiceSchema.virtual('isOverdue').get(function() {
  return this.status !== 'paid' && this.dueDate < new Date();
});

// Calcul automatique des montants avant sauvegarde
invoiceSchema.pre('save', function(next) {
  // Check if being cancelled first (before any other checks)
  const isBeingCancelled = this.isModified('status') && this.status === 'cancelled';
  
  // If being cancelled, skip all calculations and validations
  if (isBeingCancelled) {
    return next();
  }
  
  // Prevent modification of cancelled invoices
  if (this.isModified() && !this.isNew) {
    const wasCancelled = this._original && this._original.status === 'cancelled';
    
    // If invoice was already cancelled, prevent any modifications
    if (wasCancelled) {
      return next(new Error('Cannot modify cancelled invoice'));
    }
  }
  
  // Skip calculations if invoice is already cancelled
  if (this.status === 'cancelled') {
    return next();
  }
  
  // Calcul du sous-total
  this.subtotal = this.items.reduce((sum, item) => {
    item.total = item.quantity * item.unitPrice;
    return sum + item.total;
  }, 0);
  
  // Calcul de la remise
  this.discountAmount = (this.subtotal * this.discountRate) / 100;
  const subtotalAfterDiscount = this.subtotal - this.discountAmount;
  
  // Calcul de la TVA
  this.taxAmount = (subtotalAfterDiscount * this.taxRate) / 100;
  
  // Total final
  this.total = subtotalAfterDiscount + this.taxAmount;
  
  // Mise à jour du statut selon les paiements
  if (this.paidAmount >= this.total) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else if (this.dueDate < new Date() && this.status === 'sent') {
    this.status = 'overdue';
  }
  
  next();
});

// Méthode pour générer l'écriture comptable
invoiceSchema.methods.generateJournalEntry = async function() {
  const JournalEntry = mongoose.model('JournalEntry');
  
  if (this.journalEntry) {
    throw new Error('Écriture comptable déjà générée pour cette facture');
  }
  
  const entries = [];
  
  // Débit : Compte client (411)
  entries.push({
    account: await mongoose.model('Account').findOne({ code: '411' })._id,
    debit: this.total,
    credit: 0
  });
  
  // Crédit : Ventes (701) - Montant HT
  entries.push({
    account: await mongoose.model('Account').findOne({ code: '701' })._id,
    debit: 0,
    credit: this.subtotal - this.discountAmount
  });
  
  // Crédit : TVA collectée (445) si TVA > 0
  if (this.taxAmount > 0) {
    entries.push({
      account: await mongoose.model('Account').findOne({ code: '445' })._id,
      debit: 0,
      credit: this.taxAmount
    });
  }
  
  const journalEntry = new JournalEntry({
    date: this.issueDate,
    reference: this.number,
    description: `Facture client - ${this.number}`,
    entries,
    sourceType: 'invoice',
    sourceId: this._id,
    createdBy: this.createdBy
  });
  
  await journalEntry.save();
  this.journalEntry = journalEntry._id;
  await this.save();
  
  return journalEntry;
};

export const Invoice = mongoose.model('Invoice', invoiceSchema);