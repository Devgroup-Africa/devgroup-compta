import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  purchaseNumber: {
    type: String,
    unique: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Le fournisseur est requis']
  },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount'
  },
  date: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  items: [{
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'paid', 'cancelled'],
    default: 'draft'
  },
  paymentDate: Date,
  paymentMethod: String,
  notes: String,
  // Pièce jointe (facture du fournisseur en base64)
  attachment: String,
  attachmentName: String,
  // Lien avec la transaction de trésorerie
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  // Annulation
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index
purchaseSchema.index({ purchaseNumber: 1 });
purchaseSchema.index({ supplier: 1, status: 1 });
purchaseSchema.index({ date: -1 });
purchaseSchema.index({ status: 1 });

// Générer le numéro de facture fournisseur automatiquement
purchaseSchema.pre('save', async function(next) {
  if (this.isNew && !this.purchaseNumber) {
    const count = await mongoose.model('Purchase').countDocuments();
    this.purchaseNumber = `ACH-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export const Purchase = mongoose.model('Purchase', purchaseSchema);
