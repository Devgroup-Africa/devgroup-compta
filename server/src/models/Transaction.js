import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Le type de transaction est requis'],
    enum: {
      values: ['income', 'expense'],
      message: 'Type de transaction invalide'
    }
  },
  amount: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0.01, 'Le montant doit être positif']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'La date est requise'],
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
  // Référence à la facture source
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  // Référence à la facture fournisseur
  purchase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase'
  },
  // Compte comptable
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  // Référence comptable
  journalEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
  },
  // Pièce jointe (reçu, facture, etc.)
  attachment: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number
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
  },
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour performance
transactionSchema.index({ type: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ bankAccount: 1 });
transactionSchema.index({ account: 1 });

// Génération automatique de l'écriture comptable - DÉSACTIVÉ
// Ce hook est désactivé car les transactions de factures n'ont pas toujours de compte comptable associé
// Pour générer une écriture comptable, appelez manuellement generateJournalEntry()
/*
transactionSchema.post('save', async function() {
  if (!this.journalEntry && this.status === 'confirmed' && this.account) {
    await this.generateJournalEntry();
  }
});
*/

// Méthode pour générer l'écriture comptable
transactionSchema.methods.generateJournalEntry = async function() {
  const JournalEntry = mongoose.model('JournalEntry');
  const Account = mongoose.model('Account');
  
  if (this.journalEntry) {
    throw new Error('Écriture comptable déjà générée pour cette transaction');
  }
  
  const entries = [];
  
  if (this.type === 'income') {
    // Recette : Débit Banque/Caisse, Crédit Compte de produit
    const treasuryAccount = this.bankAccount ? 
      await Account.findOne({ code: '512' }) : // Banque
      await Account.findOne({ code: '531' });   // Caisse
    
    entries.push({
      account: treasuryAccount._id,
      debit: this.amount,
      credit: 0
    });
    
    entries.push({
      account: this.account,
      debit: 0,
      credit: this.amount
    });
  } else {
    // Dépense : Débit Compte de charge, Crédit Banque/Caisse
    entries.push({
      account: this.account,
      debit: this.amount,
      credit: 0
    });
    
    const treasuryAccount = this.bankAccount ? 
      await Account.findOne({ code: '512' }) : // Banque
      await Account.findOne({ code: '531' });   // Caisse
    
    entries.push({
      account: treasuryAccount._id,
      debit: 0,
      credit: this.amount
    });
  }
  
  const journalEntry = new JournalEntry({
    date: this.date,
    reference: this.reference || `TXN-${this._id.toString().slice(-6)}`,
    description: this.description,
    entries,
    sourceType: 'transaction',
    sourceId: this._id,
    createdBy: this.createdBy
  });
  
  await journalEntry.save();
  this.journalEntry = journalEntry._id;
  await this.save();
  
  return journalEntry;
};

export const Transaction = mongoose.model('Transaction', transactionSchema);