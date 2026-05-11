import { jest } from '@jest/globals';

// Mock the middleware first
jest.unstable_mockModule('../../middleware/validation.js', () => ({
  asyncHandler: (fn) => fn
}));

// Mock the models
jest.unstable_mockModule('../../models/Invoice.js', () => ({
  Invoice: {
    findById: jest.fn()
  }
}));

jest.unstable_mockModule('../../models/AuditLog.js', () => ({
  AuditLog: {
    create: jest.fn()
  }
}));

// Import after mocking
const { cancelInvoice } = await import('../invoiceController.js');
const { Invoice } = await import('../../models/Invoice.js');
const { AuditLog } = await import('../../models/AuditLog.js');

describe('cancelInvoice - Audit Logging', () => {
  let req, res, mockInvoice;

  beforeEach(() => {
    // Setup request mock
    req = {
      params: { id: 'invoice123' },
      body: { reason: 'Customer requested cancellation' },
      user: { _id: 'user123' }
    };

    // Setup response mock
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Setup mock invoice
    mockInvoice = {
      _id: 'invoice123',
      number: 'FA-202401-001',
      status: 'sent',
      total: 5000,
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockReturnThis()
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  test('should create audit log entry with correct data', async () => {
    // Arrange
    Invoice.findById.mockResolvedValue(mockInvoice);
    AuditLog.create.mockResolvedValue({
      category: 'INVOICE_CANCELLED',
      userId: 'user123',
      invoiceNumber: 'FA-202401-001',
      reason: 'Customer requested cancellation'
    });

    // Act
    await cancelInvoice(req, res);

    // Assert
    expect(AuditLog.create).toHaveBeenCalledWith({
      category: 'INVOICE_CANCELLED',
      userId: 'user123',
      invoiceNumber: 'FA-202401-001',
      reason: 'Customer requested cancellation',
      metadata: expect.objectContaining({
        invoiceId: 'invoice123',
        invoiceTotal: 5000,
        invoiceStatus: 'cancelled',
        cancelledAt: expect.any(Date)
      })
    });
  });

  test('should create audit log with empty reason when not provided', async () => {
    // Arrange
    req.body = {}; // No reason provided
    Invoice.findById.mockResolvedValue(mockInvoice);
    AuditLog.create.mockResolvedValue({});

    // Act
    await cancelInvoice(req, res);

    // Assert
    expect(AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: ''
      })
    );
  });

  test('should not block cancellation if audit log creation fails', async () => {
    // Arrange
    Invoice.findById.mockResolvedValue(mockInvoice);
    AuditLog.create.mockRejectedValue(new Error('Database error'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Act
    await cancelInvoice(req, res);

    // Assert
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Facture annulée avec succès'
      })
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to create audit log:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  test('should trigger high-value alert for invoices above threshold', async () => {
    // Arrange
    mockInvoice.total = 15000; // Above default threshold of 10000
    Invoice.findById.mockResolvedValue(mockInvoice);
    AuditLog.create.mockResolvedValue({});
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Act
    await cancelInvoice(req, res);

    // Assert
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('HIGH VALUE CANCELLATION ALERT')
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('FA-202401-001')
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('15000')
    );

    consoleWarnSpy.mockRestore();
  });

  test('should not trigger alert for invoices below threshold', async () => {
    // Arrange
    mockInvoice.total = 5000; // Below default threshold of 10000
    Invoice.findById.mockResolvedValue(mockInvoice);
    AuditLog.create.mockResolvedValue({});
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Act
    await cancelInvoice(req, res);

    // Assert
    expect(consoleWarnSpy).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});
