import mongoose from 'mongoose';

const companySettingsSchema = new mongoose.Schema({
  // Informations de l'entreprise
  name: {
    type: String,
    required: [true, "Le nom de l'entreprise est requis"],
    trim: true
  },
  logo: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  
  // Description du module comptable
  description: {
    type: String,
    trim: true
  },
  
  // Paramètres de facturation (flat structure)
  taxRate: {
    type: Number,
    default: 18
  },
  currency: {
    type: String,
    default: 'FCFA',
    trim: true
  },
  invoicePrefix: {
    type: String,
    default: 'INV',
    trim: true
  },
  invoiceStartNumber: {
    type: Number,
    default: 1
  },
  paymentTerms: {
    type: Number,
    default: 30
  },
  
  // Informations de paiement (flat structure)
  mobileMoneyAccounts: [{
    provider: String,
    number: String,
    name: String
  }],
  bankAccounts: [{
    bankName: String,
    accountNumber: String,
    accountName: String
  }],
  
  // Il ne peut y avoir qu'une seule configuration par système
  singleton: {
    type: String,
    default: 'single',
    unique: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Méthode statique pour obtenir ou créer les paramètres
companySettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    // Créer des paramètres par défaut
    settings = await this.create({
      name: 'Mon Entreprise',
      taxRate: 18,
      currency: 'FCFA',
      invoicePrefix: 'INV',
      invoiceStartNumber: 1,
      paymentTerms: 30,
      mobileMoneyAccounts: [],
      bankAccounts: []
    });
  }
  
  return settings;
};

export const CompanySettings = mongoose.model('CompanySettings', companySettingsSchema);
