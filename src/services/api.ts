const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

type ResponseType = 'json' | 'blob';

// Type d'erreur détecté automatiquement
export interface ApiError {
  message: string;
  type: "error" | "warning" | "info";
  statusCode?: number;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  // Détecte automatiquement le type d'erreur selon le message et le code HTTP
  private detectErrorType(message: string, statusCode?: number): "error" | "warning" | "info" {
    const lowerMessage = message.toLowerCase();
    
    // Avertissements (situations non critiques)
    if (
      lowerMessage.includes("impossible de supprimer") ||
      lowerMessage.includes("contient") ||
      lowerMessage.includes("transaction(s)") ||
      lowerMessage.includes("déjà") ||
      lowerMessage.includes("existe déjà") ||
      lowerMessage.includes("solde insuffisant") ||
      lowerMessage.includes("dépasse") ||
      statusCode === 409 // Conflict
    ) {
      return "warning";
    }
    
    // Informations (pas vraiment des erreurs)
    if (
      lowerMessage.includes("aucun") ||
      lowerMessage.includes("vide") ||
      lowerMessage.includes("non trouvé") ||
      statusCode === 404
    ) {
      return "info";
    }
    
    // Erreurs critiques par défaut
    return "error";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    responseType: ResponseType = 'json'
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Detect binary response based on endpoint path
    const isBinaryEndpoint = endpoint.includes('/export/pdf') || 
                            endpoint.includes('/export/word') || 
                            endpoint.includes('/export/excel');
    
    const effectiveResponseType = isBinaryEndpoint ? 'blob' : responseType;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle binary responses
      if (effectiveResponseType === 'blob') {
        if (!response.ok) {
          // Try to parse error as JSON for binary endpoints
          const errorText = await response.text();
          let errorMessage = `Erreur ${response.status}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            // If not JSON, use the text as error message
            errorMessage = errorText || errorMessage;
          }
          
          const apiError: ApiError = {
            message: errorMessage,
            type: this.detectErrorType(errorMessage, response.status),
            statusCode: response.status,
          };
          throw apiError;
        }
        
        const blob = await response.blob();
        return { data: blob as T };
      }
      
      // Handle JSON responses
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, create a meaningful error
        const apiError: ApiError = {
          message: `Erreur de parsing de la réponse (${response.status})`,
          type: "error",
          statusCode: response.status,
        };
        throw apiError;
      }

      if (!response.ok) {
        // Handle validation errors with detailed messages
        if (response.status === 400 && data.errors) {
          const errorMessages = data.errors.map((err: { message?: string; msg?: string }) => err.message || err.msg).join(', ');
          const errorMessage = `Erreur de validation: ${errorMessages}`;
          const apiError: ApiError = {
            message: errorMessage,
            type: this.detectErrorType(errorMessage, response.status),
            statusCode: response.status,
          };
          throw apiError;
        }
        
        const errorMessage = data.message || `Erreur ${response.status}`;
        const apiError: ApiError = {
          message: errorMessage,
          type: this.detectErrorType(errorMessage, response.status),
          statusCode: response.status,
        };
        throw apiError;
      }

      return { data };
    } catch (error) {
      console.error('Erreur API:', error);
      // Si c'est déjà une ApiError, on la relance telle quelle
      if ((error as ApiError).type) {
        throw error;
      }
      // Sinon, on crée une ApiError générique avec un message lisible
      const errorMessage = error instanceof Error ? error.message : String(error);
      const apiError: ApiError = {
        message: errorMessage || "Une erreur est survenue",
        type: "error",
      };
      throw apiError;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{
      user: {
        _id: string;
        name: string;
        email: string;
        role: string;
      };
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      this.token = response.data.accessToken;
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await this.request<{
      accessToken: string;
      refreshToken: string;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.data) {
      this.token = response.data.accessToken;
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response;
  }

  // Account methods
  async getAccounts(params?: {
    type?: string;
    parent?: string;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.parent) queryParams.append('parent', params.parent);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.request(`/accounts${query ? `?${query}` : ''}`);
  }

  async getAccount(id: string) {
    return this.request(`/accounts/${id}`);
  }

  async createAccount(accountData: {
    code: string;
    name: string;
    type: string;
    parent?: string;
    description?: string;
  }) {
    return this.request('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  async updateAccount(id: string, accountData: Partial<{
    name: string;
    description: string;
    isActive: boolean;
  }>) {
    return this.request(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    });
  }

  async deleteAccount(id: string) {
    return this.request(`/accounts/${id}`, {
      method: 'DELETE',
    });
  }

  async getTrialBalance(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.request(`/accounts/trial-balance${query ? `?${query}` : ''}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Client methods
  async getClients(params?: {
    search?: string;
    isActive?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const query = queryParams.toString();
    return this.request(`/clients${query ? `?${query}` : ''}`);
  }

  async getClient(id: string) {
    return this.request(`/clients/${id}`);
  }

  async createClient(clientData: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
    paymentTerms?: number;
    creditLimit?: number;
    taxNumber?: string;
  }) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id: string, clientData: Partial<{
    name: string;
    email: string;
    phone: string;
    company: string;
    address: {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
    paymentTerms: number;
    creditLimit: number;
    taxNumber: string;
    isActive: boolean;
  }>) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id: string) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Supplier methods
  async getSuppliers(params?: {
    search?: string;
    isActive?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const query = queryParams.toString();
    return this.request(`/suppliers${query ? `?${query}` : ''}`);
  }

  async getSupplier(id: string) {
    return this.request(`/suppliers/${id}`);
  }

  async createSupplier(supplierData: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
    paymentTerms?: number;
    taxNumber?: string;
    bankDetails?: {
      bankName?: string;
      accountNumber?: string;
      iban?: string;
    };
  }) {
    return this.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  }

  async updateSupplier(id: string, supplierData: Partial<{
    name: string;
    email: string;
    phone: string;
    company: string;
    address: {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
    paymentTerms: number;
    taxNumber: string;
    bankDetails: {
      bankName?: string;
      accountNumber?: string;
      iban?: string;
    };
    isActive: boolean;
  }>) {
    return this.request(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
  }

  async deleteSupplier(id: string) {
    return this.request(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  }

  // Invoice methods
  async getInvoices(params?: {
    status?: string;
    clientId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.clientId) queryParams.append('clientId', params.clientId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.request(`/invoices${query ? `?${query}` : ''}`);
  }

  async getInvoice(id: string) {
    return this.request(`/invoices/${id}`);
  }

  async createInvoice(invoiceData: {
    clientId: string;
    items: Array<{
      description: string;
      detailedDescription?: string;
      quantity: number;
      unitPrice: number;
    }>;
    taxRate?: number;
    discountRate?: number;
    issueDate?: string;
    dueDate?: string;
    notes?: string;
    terms?: string;
  }) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async updateInvoice(id: string, invoiceData: Partial<{
    items: Array<{
      description: string;
      detailedDescription?: string;
      quantity: number;
      unitPrice: number;
    }>;
    taxRate: number;
    discountRate: number;
    dueDate: string;
    notes: string;
    terms: string;
    status: string;
  }>) {
    return this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    });
  }

  async deleteInvoice(id: string) {
    return this.request(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  async sendInvoice(id: string) {
    return this.request(`/invoices/${id}/send`, {
      method: 'POST',
    });
  }

  async markInvoiceAsPaid(id: string) {
    return this.request(`/invoices/${id}/mark-paid`, {
      method: 'POST',
    });
  }

  async cancelInvoice(id: string, reason?: string) {
    return this.request(`/invoices/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Invoice export and email functions
  async getInvoicePreview(id: string) {
    return this.request(`/invoices/${id}/preview`);
  }

  async exportInvoicePDF(id: string): Promise<ApiResponse<Blob>> {
    return this.request<Blob>(`/invoices/${id}/export/pdf`, {}, 'blob');
  }

  async exportInvoiceWord(id: string): Promise<ApiResponse<Blob>> {
    return this.request<Blob>(`/invoices/${id}/export/word`, {}, 'blob');
  }

  async exportInvoiceExcel(id: string): Promise<ApiResponse<Blob>> {
    return this.request<Blob>(`/invoices/${id}/export/excel`, {}, 'blob');
  }

  async exportInvoiceJPEG(id: string): Promise<ApiResponse<Blob>> {
    return this.request<Blob>(`/invoices/${id}/export/jpeg`, {}, 'blob');
  }

  async sendInvoiceByEmail(id: string, emailData: {
    recipientEmail?: string;
    subject?: string;
    message?: string;
  }) {
    return this.request(`/invoices/${id}/send-email`, {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  // Journal methods
  async getJournalEntries(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    accountId?: string;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.accountId) queryParams.append('accountId', params.accountId);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.request(`/journal${query ? `?${query}` : ''}`);
  }

  async getJournalEntry(id: string) {
    return this.request(`/journal/${id}`);
  }

  async createJournalEntry(entryData: {
    date?: string;
    reference?: string;
    description: string;
    entries: Array<{
      account: string;
      debit?: number;
      credit?: number;
    }>;
  }) {
    return this.request('/journal', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }

  async updateJournalEntry(id: string, entryData: Partial<{
    date: string;
    reference: string;
    description: string;
    entries: Array<{
      account: string;
      debit?: number;
      credit?: number;
    }>;
  }>) {
    return this.request(`/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  }

  async deleteJournalEntry(id: string) {
    return this.request(`/journal/${id}`, {
      method: 'DELETE',
    });
  }

  async validateJournalEntry(id: string) {
    return this.request(`/journal/${id}/validate`, {
      method: 'POST',
    });
  }

  async getGeneralLedger(params: {
    accountId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('accountId', params.accountId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.request(`/journal/general-ledger?${query}`);
  }

  // Bank Account methods
  async getBankAccounts(params?: {
    isActive?: boolean;
    type?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.type) queryParams.append('type', params.type);

    const query = queryParams.toString();
    return this.request(`/bank-accounts${query ? `?${query}` : ''}`);
  }

  async getBankAccount(id: string) {
    return this.request(`/bank-accounts/${id}`);
  }

  async getBankAccountById(id: string) {
    return this.request(`/bank-accounts/${id}`);
  }

  async recalculateBalance(id: string) {
    return this.request(`/bank-accounts/${id}/recalculate`, {
      method: 'POST',
    });
  }

  async exportBankAccountStatement(id: string, format: 'excel' | 'pdf' = 'excel') {
    const response = await fetch(`${this.baseURL}/bank-accounts/${id}/export/statement?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'export du relevé');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `releve-compte-${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async exportTransactionsList(id: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    params.append('format', 'excel');
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${this.baseURL}/bank-accounts/${id}/export/transactions?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'export des transactions');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async exportAllTransactions(type?: string, category?: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    params.append('format', 'excel');
    if (type) params.append('type', type);
    if (category) params.append('category', category);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${this.baseURL}/transactions/export?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'export des transactions');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toutes-transactions-${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async createBankAccount(data: {
    name: string;
    bank: string;
    accountNumber: string;
    iban?: string;
    swift?: string;
    currency?: string;
    type?: string;
    initialBalance?: number;
    accountCode?: string;
    description?: string;
  }) {
    return this.request('/bank-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBankAccount(id: string, data: Partial<{
    name: string;
    bank: string;
    accountNumber: string;
    iban: string;
    swift: string;
    currency: string;
    type: string;
    accountCode: string;
    description: string;
    isActive: boolean;
  }>) {
    return this.request(`/bank-accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBankAccount(id: string) {
    return this.request(`/bank-accounts/${id}`, {
      method: 'DELETE',
    });
  }

  async recalculateBankAccountBalance(id: string) {
    return this.request(`/bank-accounts/${id}/recalculate`, {
      method: 'POST',
    });
  }

  // Transaction methods
  async getTransactions(params?: {
    type?: string;
    category?: string;
    bankAccount?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.bankAccount) queryParams.append('bankAccount', params.bankAccount);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.request(`/transactions${query ? `?${query}` : ''}`);
  }

  async getTransaction(id: string) {
    return this.request(`/transactions/${id}`);
  }

  async getTransactionById(id: string) {
    return this.getTransaction(id);
  }

  async createTransaction(data: {
    type: string;
    amount: number;
    description: string;
    category: string;
    date?: string;
    reference?: string;
    bankAccount?: string;
    account: string;
    notes?: string;
  }) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(id: string, data: Partial<{
    type: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    reference: string;
    bankAccount: string;
    account: string;
    notes: string;
    status: string;
  }>) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: string) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async createTransfer(data: {
    sourceAccount: string;
    destinationAccount: string;
    amount: number;
    date?: string;
    reference?: string;
    description?: string;
  }) {
    return this.request('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Treasury Dashboard methods
  async getTreasuryDashboard(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.request(`/treasury/dashboard${query ? `?${query}` : ''}`);
  }

  async getCashFlow(params: {
    startDate: string;
    endDate: string;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.request(`/treasury/cash-flow?${query}`);
  }

  async getCategorySummary(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.request(`/treasury/categories${query ? `?${query}` : ''}`);
  }
  
  // Company Settings
  async getCompanySettings() {
    return this.request('/company-settings');
  }

  async updateCompanySettings(settings: any) {
    return this.request('/company-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async resetCompanySettings() {
    return this.request('/company-settings/reset', {
      method: 'POST',
    });
  }

  // Purchases (Factures fournisseurs)
  async getPurchases(filters?: { status?: string; supplier?: string; startDate?: string; endDate?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.supplier) params.append('supplier', filters.supplier);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    return this.request(`/purchases${queryString ? `?${queryString}` : ''}`);
  }

  async getPurchaseById(id: string) {
    return this.request(`/purchases/${id}`);
  }

  async createPurchase(purchase: any) {
    return this.request('/purchases', {
      method: 'POST',
      body: JSON.stringify(purchase),
    });
  }

  async updatePurchase(id: string, purchase: any) {
    return this.request(`/purchases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(purchase),
    });
  }

  async markPurchaseAsPaid(id: string, paymentData: { paymentDate?: string; paymentMethod?: string }) {
    return this.request(`/purchases/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async cancelPurchase(id: string, reason: string) {
    return this.request(`/purchases/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async deletePurchase(id: string) {
    return this.request(`/purchases/${id}`, {
      method: 'DELETE',
    });
  }

  // Purchase exports
  async exportPurchasePDF(id: string) {
    return this.request<Blob>(`/purchases/${id}/export/pdf`);
  }

  async exportPurchaseExcel(id: string) {
    return this.request<Blob>(`/purchases/${id}/export/excel`);
  }

  async exportPurchasesListExcel(filters?: { status?: string; supplier?: string; startDate?: string; endDate?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.supplier) params.append('supplier', filters.supplier);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    return this.request<Blob>(`/purchases/export/list${queryString ? `?${queryString}` : ''}`);
  }

  async getPurchaseStats(filters?: { startDate?: string; endDate?: string }) {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    return this.request(`/purchases/stats${queryString ? `?${queryString}` : ''}`);
  }

  // AI Assistant
  async chatWithAI(message: string, history: Array<{ role: string; content: string }>) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;

