import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du client est requis'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: { type: String, default: 'Cameroun' }
  },
  // Informations comptables
  accountCode: {
    type: String,
    default: '411' // Compte client par défaut
  },
  paymentTerms: {
    type: Number,
    default: 30 // Jours
  },
  creditLimit: {
    type: Number,
    default: 0
  },
  taxNumber: String,
  isActive: {
    type: Boolean,
    default: true
  },
  // Statistiques calculées
  totalInvoiced: {
    type: Number,
    default: 0
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  currentBalance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour recherche
clientSchema.index({ name: 'text', company: 'text', email: 'text' });
clientSchema.index({ isActive: 1 });

// Virtual pour le solde dû
clientSchema.virtual('amountDue').get(function() {
  return this.totalInvoiced - this.totalPaid;
});

// Méthode pour calculer les statistiques
clientSchema.methods.calculateStats = async function() {
  const Invoice = mongoose.model('Invoice');
  const Payment = mongoose.model('Payment');
  
  // Total facturé
  const invoiceStats = await Invoice.aggregate([
    { $match: { client: this._id, status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);
  
  // Total payé
  const paymentStats = await Payment.aggregate([
    { 
      $lookup: {
        from: 'invoices',
        localField: 'invoice',
        foreignField: '_id',
        as: 'invoiceData'
      }
    },
    { $unwind: '$invoiceData' },
    { $match: { 'invoiceData.client': this._id } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  this.totalInvoiced = invoiceStats[0]?.total || 0;
  this.totalPaid = paymentStats[0]?.total || 0;
  this.currentBalance = this.totalInvoiced - this.totalPaid;
  
  return this.save();
};

export const Client = mongoose.model('Client', clientSchema);