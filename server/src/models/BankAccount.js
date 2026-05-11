import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du compte est requis'],
    trim: true
  },
  bank: {
    type: String,
    required: [true, 'Le nom de la banque est requis'],
    trim: true
  },
  accountNumber: {
    type: String,
    required: [true, 'Le numéro de compte est requis'],
    trim: true
  },
  iban: String,
  swift: String,
  currency: {
    type: String,
    default: 'XAF',
    enum: ['XAF', 'EUR', 'USD']
  },
  type: {
    type: String,
    enum: ['checking', 'savings', 'business'],
    default: 'checking'
  },
  // Solde initial lors de la création
  initialBalance: {
    type: Number,
    default: 0
  },
  // Solde actuel (calculé)
  currentBalance: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Compte comptable associé
  accountCode: {
    type: String,
    default: '512' // Banque
  },
  description: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour performance
bankAccountSchema.index({ accountNumber: 1 });
bankAccountSchema.index({ isActive: 1 });

// Méthode pour calculer le solde réel
bankAccountSchema.methods.calculateBalance = async function() {
  const Payment = mongoose.model('Payment');
  const Transaction = mongoose.model('Transaction');
  
  // Paiements reçus (entrées)
  const incomingPayments = await Payment.aggregate([
    { 
      $match: { 
        bankAccount: this._id, 
        status: 'confirmed',
        method: { $in: ['bank_transfer', 'check', 'card'] }
      } 
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  // Transactions (entrées et sorties)
  const transactions = await Transaction.aggregate([
    { $match: { bankAccount: this._id, status: 'confirmed' } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  const incoming = incomingPayments[0]?.total || 0;
  
  let transactionBalance = 0;
  transactions.forEach(t => {
    if (t._id === 'income') {
      transactionBalance += t.total;
    } else {
      transactionBalance -= t.total;
    }
  });
  
  this.currentBalance = this.initialBalance + incoming + transactionBalance;
  await this.save();
  
  return this.currentBalance;
};

export const BankAccount = mongoose.model('BankAccount', bankAccountSchema);