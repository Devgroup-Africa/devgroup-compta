import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InvoicesPage from './InvoicesPage';
import apiService from '@/services/api';

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    getInvoices: vi.fn(),
    deleteInvoice: vi.fn(),
    cancelInvoice: vi.fn(),
    sendInvoice: vi.fn(),
    markInvoiceAsPaid: vi.fn(),
    sendInvoiceByEmail: vi.fn(),
  },
}));

describe('InvoicesPage - Revenue Calculation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should exclude cancelled invoices from totalAmount calculation', async () => {
    const mockInvoices = [
      {
        _id: '1',
        number: 'INV-001',
        status: 'paid',
        total: 100000,
        paidAmount: 100000,
        items: [],
        subtotal: 100000,
        taxAmount: 0,
        discountAmount: 0,
        issueDate: '2024-01-01',
        dueDate: '2024-01-31',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        clientId: '1',
        taxRate: 0,
        discountRate: 0,
      },
      {
        _id: '2',
        number: 'INV-002',
        status: 'sent',
        total: 50000,
        paidAmount: 0,
        items: [],
        subtotal: 50000,
        taxAmount: 0,
        discountAmount: 0,
        issueDate: '2024-01-02',
        dueDate: '2024-02-01',
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
        clientId: '2',
        taxRate: 0,
        discountRate: 0,
      },
      {
        _id: '3',
        number: 'INV-003',
        status: 'cancelled',
        total: 75000,
        paidAmount: 75000,
        items: [],
        subtotal: 75000,
        taxAmount: 0,
        discountAmount: 0,
        issueDate: '2024-01-03',
        dueDate: '2024-02-02',
        createdAt: '2024-01-03',
        updatedAt: '2024-01-03',
        clientId: '3',
        taxRate: 0,
        discountRate: 0,
      },
    ];

    vi.mocked(apiService.getInvoices).mockResolvedValue({ data: { invoices: mockInvoices } });

    render(
      <BrowserRouter>
        <InvoicesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Total amount should be 150,000 (100,000 + 50,000), excluding cancelled invoice
      const toCollectCards = screen.getAllByText(/À encaisser/i);
      const toCollectCard = toCollectCards[0].closest('div');
      expect(toCollectCard).toHaveTextContent(/50\s*000/); // 150,000 - 100,000 paid
    });
  });

  it('should exclude cancelled invoices from paidAmount calculation', async () => {
    const mockInvoices = [
      {
        _id: '1',
        number: 'INV-001',
        status: 'paid',
        total: 100000,
        paidAmount: 100000,
        items: [],
        subtotal: 100000,
        taxAmount: 0,
        discountAmount: 0,
        issueDate: '2024-01-01',
        dueDate: '2024-01-31',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        clientId: '1',
        taxRate: 0,
        discountRate: 0,
      },
      {
        _id: '2',
        number: 'INV-002',
        status: 'cancelled',
        total: 200000,
        paidAmount: 200000,
        items: [],
        subtotal: 200000,
        taxAmount: 0,
        discountAmount: 0,
        issueDate: '2024-01-02',
        dueDate: '2024-02-01',
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
        clientId: '2',
        taxRate: 0,
        discountRate: 0,
      },
    ];

    vi.mocked(apiService.getInvoices).mockResolvedValue({ data: { invoices: mockInvoices } });

    render(
      <BrowserRouter>
        <InvoicesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Paid amount should be 100,000, excluding cancelled invoice's 200,000
      const collectedCards = screen.getAllByText(/Encaissé/i);
      const collectedCard = collectedCards[0].closest('div');
      expect(collectedCard).toHaveTextContent(/100\s*000/);
    });
  });

  it('should handle mixed invoice statuses correctly', async () => {
    const mockInvoices = [
      {
        _id: '1',
        number: 'INV-001',
        status: 'paid',
        total: 100000,
        paidAmount: 100000,
        items: [],
        subtotal: 100000,
        taxAmount: 0,
        discountAmount: 0,
        issueDate: '2024-01-01',
        dueDate: '2024-01-31',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        clientId: '1',
        taxRate: 0,
        discountRate: 0,
      },
      {
        _id: '2',
        number: 'INV-002',
        status: 'sent',
        total: 50000,
        paidAmount: 0,
        items: [],
        subtotal: 50000,
        taxAmount: 0,
        discountAmount: 0,
        issueDate: '2024-01-02',
        dueDate: '2024-02-01',
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
        clientId: '2',
        taxRate: 0,
        discountRate: 0,
      },
      {
        _id: '3',
        number: 'INV-003',
        status: 'partial',
        total: 80000,
        paidAmount: 40000,
        items: [],
        subtotal: 80000,
        taxAmount: 0,
        discountAmount: 0,
        issueDate: '2024-01-03',
        dueDate: '2024-02-02',
        createdAt: '2024-01-03',
        updatedAt: '2024-01-03',
        clientId: '3',
        taxRate: 0,
        discountRate: 0,
      },
      {
        _id: '4',
        number: 'INV-004',
        status: 'cancelled',
        total: 150000,
        paidAmount: 150000,
        items: [],
        subtotal: 150000,
        taxAmount: 0,
        discountAmount: 0,
        issueDate: '2024-01-04',
        dueDate: '2024-02-03',
        createdAt: '2024-01-04',
        updatedAt: '2024-01-04',
        clientId: '4',
        taxRate: 0,
        discountRate: 0,
      },
    ];

    vi.mocked(apiService.getInvoices).mockResolvedValue({ data: { invoices: mockInvoices } });

    render(
      <BrowserRouter>
        <InvoicesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Total amount: 100,000 + 50,000 + 80,000 = 230,000 (excluding cancelled 150,000)
      // Paid amount: 100,000 + 0 + 40,000 = 140,000 (excluding cancelled 150,000)
      // To collect: 230,000 - 140,000 = 90,000
      const toCollectCards = screen.getAllByText(/À encaisser/i);
      const toCollectCard = toCollectCards[0].closest('div');
      expect(toCollectCard).toHaveTextContent(/90\s*000/);
    });
  });

  it('should show zero revenue when all invoices are cancelled', async () => {
    const mockInvoices = [
      {
        _id: '1',
        number: 'INV-001',
        status: 'cancelled',
        total: 100000,
        paidAmount: 100000,
        items: [],
        subtotal: 100000,
        taxAmount: 0,
        discountAmount: 0,
        issueDate: '2024-01-01',
        dueDate: '2024-01-31',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        clientId: '1',
        taxRate: 0,
        discountRate: 0,
      },
      {
        _id: '2',
        number: 'INV-002',
        status: 'cancelled',
        total: 50000,
        paidAmount: 50000,
        items: [],
        subtotal: 50000,
        taxAmount: 0,
        discountAmount: 0,
        issueDate: '2024-01-02',
        dueDate: '2024-02-01',
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
        clientId: '2',
        taxRate: 0,
        discountRate: 0,
      },
    ];

    vi.mocked(apiService.getInvoices).mockResolvedValue({ data: { invoices: mockInvoices } });

    render(
      <BrowserRouter>
        <InvoicesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Both collected and to collect should be 0
      const collectedCards = screen.getAllByText(/Encaissé/i);
      const toCollectCards = screen.getAllByText(/À encaisser/i);
      const collectedCard = collectedCards[0].closest('div');
      const toCollectCard = toCollectCards[0].closest('div');
      expect(collectedCard).toHaveTextContent(/0\s*FCFA/);
      expect(toCollectCard).toHaveTextContent(/0\s*FCFA/);
    });
  });
});
