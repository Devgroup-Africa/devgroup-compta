import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import apiService from '@/services/api';

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    getClients: vi.fn(),
    getSuppliers: vi.fn(),
    getInvoices: vi.fn(),
  },
}));

// Mock the chart components
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  Legend: () => null,
}));

const mockClients = [
  { _id: '1', name: 'Client 1', company: 'Company 1' },
  { _id: '2', name: 'Client 2', company: 'Company 2' },
];

const mockSuppliers = [
  { _id: '1', name: 'Supplier 1' },
  { _id: '2', name: 'Supplier 2' },
];

describe('Dashboard - Revenue Calculation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getClients).mockResolvedValue({ data: { clients: mockClients } });
    vi.mocked(apiService.getSuppliers).mockResolvedValue({ data: { suppliers: mockSuppliers } });
  });

  it('should exclude cancelled invoices from revenue calculation', async () => {
    const mockInvoices = [
      { _id: '1', number: 'INV-001', status: 'paid', total: 100000, paidAmount: 100000, createdAt: '2024-01-01' },
      { _id: '2', number: 'INV-002', status: 'paid', total: 50000, paidAmount: 50000, createdAt: '2024-01-02' },
      { _id: '3', number: 'INV-003', status: 'cancelled', total: 75000, paidAmount: 75000, createdAt: '2024-01-03' },
    ];

    vi.mocked(apiService.getInvoices).mockResolvedValue({ data: { invoices: mockInvoices } });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Revenue should be 150,000 (100,000 + 50,000), excluding the cancelled invoice of 75,000
      const revenueCard = screen.getByText(/Chiffre d'affaires/i).closest('div');
      expect(revenueCard).toHaveTextContent(/150\s*000/);
    });
  });

  it('should exclude cancelled invoices from unpaid invoices count', async () => {
    const mockInvoices = [
      { _id: '1', number: 'INV-001', status: 'sent', total: 100000, paidAmount: 0, createdAt: '2024-01-01' },
      { _id: '2', number: 'INV-002', status: 'overdue', total: 50000, paidAmount: 0, createdAt: '2024-01-02' },
      { _id: '3', number: 'INV-003', status: 'cancelled', total: 75000, paidAmount: 0, createdAt: '2024-01-03' },
    ];

    vi.mocked(apiService.getInvoices).mockResolvedValue({ data: { invoices: mockInvoices } });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Should show 2 unpaid invoices, not 3 (excluding cancelled)
      const alertSection = screen.getByText(/factures impayées/i).closest('div');
      expect(alertSection).toHaveTextContent('2 factures impayées');
    });
  });

  it('should calculate correct unpaid amount excluding cancelled invoices', async () => {
    const mockInvoices = [
      { _id: '1', number: 'INV-001', status: 'sent', total: 100000, paidAmount: 0, createdAt: '2024-01-01' },
      { _id: '2', number: 'INV-002', status: 'overdue', total: 50000, paidAmount: 0, createdAt: '2024-01-02' },
      { _id: '3', number: 'INV-003', status: 'cancelled', total: 200000, paidAmount: 0, createdAt: '2024-01-03' },
    ];

    vi.mocked(apiService.getInvoices).mockResolvedValue({ data: { invoices: mockInvoices } });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Unpaid amount should be 150,000 (100,000 + 50,000), excluding cancelled invoice
      const alertSection = screen.getByText(/factures impayées/i).closest('div');
      expect(alertSection).toHaveTextContent(/150\s*000/);
    });
  });

  it('should handle all cancelled invoices correctly', async () => {
    const mockInvoices = [
      { _id: '1', number: 'INV-001', status: 'cancelled', total: 100000, paidAmount: 100000, createdAt: '2024-01-01' },
      { _id: '2', number: 'INV-002', status: 'cancelled', total: 50000, paidAmount: 50000, createdAt: '2024-01-02' },
    ];

    vi.mocked(apiService.getInvoices).mockResolvedValue({ data: { invoices: mockInvoices } });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Revenue should be 0 when all invoices are cancelled
      const revenueCard = screen.getByText(/Chiffre d'affaires/i).closest('div');
      expect(revenueCard).toHaveTextContent(/0\s*FCFA/);
    });
  });
});
