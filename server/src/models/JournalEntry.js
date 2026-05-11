import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'La date est requise'],
    default: Date.now
  },
  reference: {
    type: String,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true
  },
  entries: [{
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Le compte est requis']
    },
    debit: {
      type: Number,
      default: 0,
      min: [0, 'Le débit ne peut pas être négatif']
    },
    credit: {
      type: Number,
      default: 0,
      min: [0, 'Le crédit ne peut pas être négatif']
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'validated', 'cancelled'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: Date,
  // Référence vers la source (facture, paiement, etc.)
  sourceType: {
    type: String,
    enum: ['manual', 'invoice', 'payment', 'expense', 'adjustment', 'transaction', 'transfer']
  },
  sourceId: mongoose.Schema.Types.ObjectId,
  // Montant total pour vérification
  totalAmount: {
    type: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour performance
journalEntrySchema.index({ date: -1 });
journalEntrySchema.index({ reference: 1 });
journalEntrySchema.index({ status: 1 });
journalEntrySchema.index({ 'entries.account': 1 });

// Validation : équilibre débit/crédit
journalEntrySchema.pre('save', function(next) {
  const totalDebit = this.entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = this.entries.reduce((sum, entry) => sum + entry.credit, 0);
  
  // Vérification équilibre comptable
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return next(new Error(`Écriture déséquilibrée: Débit ${totalDebit} ≠ Crédit ${totalCredit}`));
  }
  
  // Vérification qu'une ligne ne peut pas avoir débit ET crédit
  for (const entry of this.entries) {
    if (entry.debit > 0 && entry.credit > 0) {
      return next(new Error('Une ligne ne peut pas avoir à la fois un débit et un crédit'));
    }
    if (entry.debit === 0 && entry.credit === 0) {
      return next(new Error('Une ligne doit avoir soit un débit soit un crédit'));
    }
  }
  
  this.totalAmount = totalDebit; // ou totalCredit, c'est pareil
  next();
});

// Méthode pour valider l'écriture
journalEntrySchema.methods.validate = function(userId) {
  this.status = 'validated';
  this.validatedBy = userId;
  this.validatedAt = new Date();
  return this.save();
};

// Méthode pour annuler l'écriture
journalEntrySchema.methods.cancel = function() {
  if (this.status === 'validated') {
    throw new Error('Impossible d\'annuler une écriture validée');
  }
  this.status = 'cancelled';
  return this.save();
};

// Virtual pour le total
journalEntrySchema.virtual('total').get(function() {
  return this.entries.reduce((sum, entry) => sum + entry.debit, 0);
});

export const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);