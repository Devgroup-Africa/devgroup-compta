import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du fournisseur est requis'],
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
    default: '401' // Compte fournisseur par défaut
  },
  paymentTerms: {
    type: Number,
    default: 30 // Jours
  },
  taxNumber: String,
  bankDetails: {
    bankName: String,
    accountNumber: String,
    iban: String,
    swift: String
  },
  // Lien avec la trésorerie
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Statistiques calculées
  totalPurchases: {
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
supplierSchema.index({ name: 'text', company: 'text', email: 'text' });
supplierSchema.index({ isActive: 1 });

// Virtual pour le montant dû
supplierSchema.virtual('amountOwed').get(function() {
  return this.totalPurchases - this.totalPaid;
});

// Méthode pour calculer les statistiques
supplierSchema.methods.calculateStats = async function() {
  // Pour l'instant, on garde les valeurs actuelles
  // Cette méthode sera implémentée quand on aura un système de gestion des achats
  return this.save();
};

export const Supplier = mongoose.model('Supplier', supplierSchema);