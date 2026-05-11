import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InvoiceDetailPage from './InvoiceDetailPage';
import apiService from '@/services/api';

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    getInvoice: vi.fn(),
    deleteInvoice: vi.fn(),
    cancelInvoice: vi.fn(),
    sendInvoice: vi.fn(),
    markInvoiceAsPaid: vi.fn(),
  },
}));

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-invoice-id' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('InvoiceDetailPage - Task 11 Implementation', () => {
  const mockDraftInvoice = {
    _id: 'test-invoice-id',
    number: 'INV-001',
    clientId: 'client-1',
    client: {
      name: 'Test Client',
      company: 'Test Company',
      email: 'test@example.com',
    },
    items: [
      {
        description: 'Test Item',
        quantity: 1,
        unitPrice: 100,
        total: 100,
      },
    ],
    subtotal: 100,
    taxAmount: 0,
    discountAmount: 0,
    total: 100,
    status: 'draft' as const,
    issueDate: '2024-01-01',
    dueDate: '2024-01-31',
    paidAmount: 0,
    taxRate: 0,
    discountRate: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const mockSentInvoice = {
    ...mockDraftInvoice,
    status: 'sent' as const,
  };

  const mockCancelledInvoice = {
    ...mockDraftInvoice,
    status: 'cancelled' as const,
    cancelledBy: {
      _id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    cancelledAt: '2024-01-15T10:30:00Z',
    cancellationReason: 'Test cancellation reason',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sub-task 11.1: Add cancellation dialog integration', () => {
    it('should show Cancel button for sent invoices', async () => {
      vi.mocked(apiService.getInvoice).mockResolvedValue({
        data: { invoice: mockSentInvoice },
      });

      render(
        <BrowserRouter>
          <InvoiceDetailPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Annuler')).toBeInTheDocument();
      });
    });

    it('should show Delete button for draft invoices', async () => {
      vi.mocked(apiService.getInvoice).mockResolvedValue({
        data: { invoice: mockDraftInvoice },
      });

      render(
        <BrowserRouter>
          <InvoiceDetailPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Supprimer')).toBeInTheDocument();
      });
    });
  });

  describe('Sub-task 11.2: Display cancellation metadata for cancelled invoices', () => {
    it('should display cancellation metadata for cancelled invoices', async () => {
      vi.mocked(apiService.getInvoice).mockResolvedValue({
        data: { invoice: mockCancelledInvoice },
      });

      render(
        <BrowserRouter>
          <InvoiceDetailPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Facture annulée')).toBeInTheDocument();
        expect(screen.getByText('Annulée par')).toBeInTheDocument();
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        expect(screen.getByText('Date d\'annulation')).toBeInTheDocument();
        expect(screen.getByText('Raison de l\'annulation')).toBeInTheDocument();
        expect(screen.getByText('Test cancellation reason')).toBeInTheDocument();
      });
    });
  });

  describe('Sub-task 11.3: Update action buttons based on status', () => {
    it('should not show Cancel or Delete buttons for cancelled invoices', async () => {
      vi.mocked(apiService.getInvoice).mockResolvedValue({
        data: { invoice: mockCancelledInvoice },
      });

      render(
        <BrowserRouter>
          <InvoiceDetailPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Annuler')).not.toBeInTheDocument();
        expect(screen.queryByText('Supprimer')).not.toBeInTheDocument();
      });
    });

    it('should not show Edit button for cancelled invoices', async () => {
      vi.mocked(apiService.getInvoice).mockResolvedValue({
        data: { invoice: mockCancelledInvoice },
      });

      render(
        <BrowserRouter>
          <InvoiceDetailPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Modifier')).not.toBeInTheDocument();
      });
    });

    it('should show Edit button for non-cancelled invoices', async () => {
      vi.mocked(apiService.getInvoice).mockResolvedValue({
        data: { invoice: mockDraftInvoice },
      });

      render(
        <BrowserRouter>
          <InvoiceDetailPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Modifier')).toBeInTheDocument();
      });
    });
  });
});
