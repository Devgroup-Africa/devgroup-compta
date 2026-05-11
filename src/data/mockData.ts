// ===== INTERFACES =====
export interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "expense" | "revenue";
  parentId?: string;
  balance: number;
}

export interface JournalEntryLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  lines: JournalEntryLine[];
  validated: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  totalDue: number;
  totalPaid: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  totalOwed: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  items: InvoiceItem[];
  subtotal: number;
  tva: number;
  total: number;
  status: "draft" | "sent" | "paid" | "partial" | "overdue";
  issueDate: string;
  dueDate: string;
  paidAmount: number;
}

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  accountNumber: string; 
  balance: number;
  currency: string;
}

export interface CashFlowEntry {
  id: string;
  date: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  category: string;
}

// ===== EMPTY DATA ARRAYS =====
export const accounts: Account[] = [];
export const journalEntries: JournalEntry[] = [];
export const clients: Client[] = [];
export const suppliers: Supplier[] = [];
export const invoices: Invoice[] = [];
export const bankAccounts: BankAccount[] = [];
export const cashFlowEntries: CashFlowEntry[] = [];

export const dashboardKPIs = {
  revenue: 0,
  expenses: 0,
  profit: 0,
  cashBalance: 0,
  unpaidInvoices: 0,
  unpaidAmount: 0,
  clientCount: 0,
  supplierCount: 0,
};

export const monthlyRevenue: Array<{ month: string; revenue: number; expenses: number }> = [];

// ===== UTILITY FUNCTIONS =====
export const formatXAF = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", minimumFractionDigits: 0 }).format(amount);
};