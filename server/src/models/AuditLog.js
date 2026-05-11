import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  invoiceNumber: {
    type: String,
    index: true
  },
  reason: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient querying by category and timestamp
auditLogSchema.index({ category: 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
