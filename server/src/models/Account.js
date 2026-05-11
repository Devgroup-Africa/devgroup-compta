import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Le code compte est requis'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Le nom du compte est requis'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Le type de compte est requis'],
    enum: {
      values: ['asset', 'liability', 'equity', 'expense', 'revenue'],
      message: 'Type de compte invalide'
    }
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    default: null
  },
  level: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: String,
  // Solde calculé dynamiquement
  currentBalance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour performance
accountSchema.index({ code: 1 });
accountSchema.index({ type: 1 });
accountSchema.index({ parent: 1 });

// Virtual pour les sous-comptes
accountSchema.virtual('children', {
  ref: 'Account',
  localField: '_id',
  foreignField: 'parent'
});

// Méthode pour calculer le solde réel
accountSchema.methods.calculateBalance = async function() {
  const JournalEntry = mongoose.model('JournalEntry');
  
  const result = await JournalEntry.aggregate([
    { $unwind: '$entries' },
    { $match: { 'entries.account': this._id } },
    {
      $group: {
        _id: null,
        totalDebit: { $sum: '$entries.debit' },
        totalCredit: { $sum: '$entries.credit' }
      }
    }
  ]);

  if (result.length === 0) return 0;

  const { totalDebit, totalCredit } = result[0];
  
  // Logique comptable : Actifs et Charges = Débit - Crédit
  // Passifs, Capitaux et Produits = Crédit - Débit
  if (['asset', 'expense'].includes(this.type)) {
    return totalDebit - totalCredit;
  } else {
    return totalCredit - totalDebit;
  }
};

// Middleware pour calculer le niveau hiérarchique
accountSchema.pre('save', async function(next) {
  if (this.parent) {
    const parentAccount = await this.constructor.findById(this.parent);
    if (parentAccount) {
      this.level = parentAccount.level + 1;
    }
  }
  next();
});

export const Account = mongoose.model('Account', accountSchema);