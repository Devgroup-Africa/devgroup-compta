// Validation utilities for invoice forms

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CompanyInfo {
  name?: string;
  logo?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  registrationNumber?: string;
}

export interface InvoiceItem {
  description: string;
  detailedDescription?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface MobileMoneyAccount {
  provider: string;
  number: string;
  name: string;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface PaymentInfo {
  mobileMoney?: MobileMoneyAccount[];
  bankAccounts?: BankAccount[];
}

// Helper function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate URL format
export function isValidURL(url: string): boolean {
  try {
    // Allow URLs with or without protocol
    const urlToTest = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
    new URL(urlToTest);
    return true;
  } catch {
    return false;
  }
}

// Helper function to check if company info has any non-empty fields
export function hasAnyCompanyInfo(companyInfo?: CompanyInfo): boolean {
  if (!companyInfo) return false;
  return !!(
    companyInfo.name ||
    companyInfo.logo ||
    companyInfo.address ||
    companyInfo.city ||
    companyInfo.phone ||
    companyInfo.email ||
    companyInfo.website ||
    companyInfo.registrationNumber
  );
}

// Helper function to check if payment info has any non-empty fields
export function hasAnyPaymentInfo(paymentInfo?: PaymentInfo): boolean {
  if (!paymentInfo) return false;
  return !!(
    (paymentInfo.mobileMoney && paymentInfo.mobileMoney.length > 0) ||
    (paymentInfo.bankAccounts && paymentInfo.bankAccounts.length > 0)
  );
}

// Validate company information
export function validateCompanyInfo(companyInfo?: CompanyInfo): ValidationResult {
  const errors: string[] = [];
  
  if (!companyInfo) {
    return { isValid: true, errors: [] };
  }
  
  if (companyInfo.email && !isValidEmail(companyInfo.email)) {
    errors.push('Email invalide');
  }
  
  if (companyInfo.website && !isValidURL(companyInfo.website)) {
    errors.push('URL du site web invalide');
  }
  
  if (companyInfo.name && companyInfo.name.length > 100) {
    errors.push("Le nom de l'entreprise ne peut pas dépasser 100 caractères");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate invoice items
export function validateInvoiceItems(items: InvoiceItem[]): ValidationResult {
  const errors: string[] = [];
  
  if (!items || items.length === 0) {
    errors.push('Au moins un article est requis');
    return { isValid: false, errors };
  }
  
  items.forEach((item, index) => {
    if (!item.description || item.description.trim() === '') {
      errors.push(`Article ${index + 1}: Description requise`);
    }
    
    if (item.quantity <= 0) {
      errors.push(`Article ${index + 1}: Quantité doit être positive`);
    }
    
    if (item.unitPrice < 0) {
      errors.push(`Article ${index + 1}: Prix unitaire ne peut pas être négatif`);
    }
    
    if (item.detailedDescription && item.detailedDescription.length > 1000) {
      errors.push(`Article ${index + 1}: Description détaillée trop longue (max 1000 caractères)`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate payment information
export function validatePaymentInfo(paymentInfo?: PaymentInfo): ValidationResult {
  const errors: string[] = [];
  
  if (!paymentInfo) {
    return { isValid: true, errors: [] }; // Payment info is optional
  }
  
  // Validate Mobile Money accounts
  paymentInfo.mobileMoney?.forEach((mm, index) => {
    if (!mm.provider || mm.provider.trim() === '') {
      errors.push(`Mobile Money ${index + 1}: Fournisseur requis`);
    }
    
    if (!mm.number || mm.number.trim() === '') {
      errors.push(`Mobile Money ${index + 1}: Numéro requis`);
    }
    
    if (!mm.name || mm.name.trim() === '') {
      errors.push(`Mobile Money ${index + 1}: Nom du titulaire requis`);
    }
  });
  
  // Validate Bank accounts
  paymentInfo.bankAccounts?.forEach((bank, index) => {
    if (!bank.bankName || bank.bankName.trim() === '') {
      errors.push(`Compte bancaire ${index + 1}: Nom de la banque requis`);
    }
    
    if (!bank.accountNumber || bank.accountNumber.trim() === '') {
      errors.push(`Compte bancaire ${index + 1}: Numéro de compte requis`);
    }
    
    if (!bank.accountName || bank.accountName.trim() === '') {
      errors.push(`Compte bancaire ${index + 1}: Nom du titulaire requis`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate dates
export function validateDates(issueDate: string, dueDate: string): ValidationResult {
  const errors: string[] = [];
  
  if (!issueDate) {
    errors.push("La date d'émission est obligatoire");
  }
  
  if (!dueDate) {
    errors.push("La date d'échéance est obligatoire");
  }
  
  if (issueDate && dueDate) {
    const issue = new Date(issueDate);
    const due = new Date(dueDate);
    
    if (due <= issue) {
      errors.push("La date d'échéance doit être après la date d'émission");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Transform form data to invoice payload
export interface InvoicePayload {
  clientId: string;
  items: Array<{
    description: string;
    detailedDescription?: string;
    quantity: number;
    unitPrice: number;
  }>;
  taxRate: number;
  discountRate: number;
  issueDate: string;
  dueDate: string;
  object?: string;
  notes?: string;
  terms?: string;
  companyInfo?: CompanyInfo;
  paymentInfo?: PaymentInfo;
  bankAccountId?: string;
}

export function transformFormDataToInvoicePayload(formData: {
  clientId: string;
  items: InvoiceItem[];
  taxRate: number;
  discountRate: number;
  issueDate: string;
  dueDate: string;
  object?: string;
  notes?: string;
  terms?: string;
  companyInfo?: CompanyInfo;
  paymentInfo?: PaymentInfo;
  bankAccountId?: string;
}): InvoicePayload {
  // Filter valid items
  const validItems = formData.items.filter(item => 
    item.description && 
    item.description.trim() !== '' &&
    item.quantity > 0 &&
    item.unitPrice >= 0
  );
  
  // Transform items to backend format
  const transformedItems = validItems.map(item => ({
    description: item.description.trim(),
    detailedDescription: item.detailedDescription?.trim() || undefined,
    quantity: item.quantity,
    unitPrice: item.unitPrice
  }));
  
  // Build payload
  const payload: InvoicePayload = {
    clientId: formData.clientId,
    items: transformedItems,
    taxRate: formData.taxRate || 19.25,
    discountRate: formData.discountRate || 0,
    issueDate: formData.issueDate,
    dueDate: formData.dueDate,
    object: formData.object?.trim() || undefined,
    notes: formData.notes?.trim() || undefined,
    terms: formData.terms?.trim() || undefined,
    bankAccountId: formData.bankAccountId || undefined
  };
  
  // Add company info if provided
  if (formData.companyInfo && hasAnyCompanyInfo(formData.companyInfo)) {
    payload.companyInfo = {
      name: formData.companyInfo.name?.trim(),
      logo: formData.companyInfo.logo?.trim(),
      address: formData.companyInfo.address?.trim(),
      city: formData.companyInfo.city?.trim(),
      phone: formData.companyInfo.phone?.trim(),
      email: formData.companyInfo.email?.trim(),
      website: formData.companyInfo.website?.trim(),
      registrationNumber: formData.companyInfo.registrationNumber?.trim()
    };
  }
  
  // Add payment info if provided
  if (formData.paymentInfo && hasAnyPaymentInfo(formData.paymentInfo)) {
    payload.paymentInfo = {
      mobileMoney: formData.paymentInfo.mobileMoney?.filter(mm => 
        mm.provider && mm.number && mm.name
      ).map(mm => ({
        provider: mm.provider.trim(),
        number: mm.number.trim(),
        name: mm.name.trim()
      })),
      bankAccounts: formData.paymentInfo.bankAccounts?.filter(bank => 
        bank.bankName && bank.accountNumber && bank.accountName
      ).map(bank => ({
        bankName: bank.bankName.trim(),
        accountNumber: bank.accountNumber.trim(),
        accountName: bank.accountName.trim()
      }))
    };
  }
  
  return payload;
}
