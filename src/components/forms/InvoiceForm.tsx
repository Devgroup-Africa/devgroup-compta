import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/api";
import MultiStepFormContainer from "./MultiStepFormContainer";
import { invoiceFormConfig } from "./configs/invoiceFormConfig";
import { transformFormDataToInvoicePayload } from "@/utils/invoiceValidation";

interface InvoiceItem {
  description: string;
  detailedDescription?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface MobileMoneyAccount {
  provider: string;
  number: string;
  name: string;
}

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface PaymentInfo {
  mobileMoney?: MobileMoneyAccount[];
  bankAccounts?: BankAccount[];
}

interface CompanyInfo {
  name?: string;
  logo?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  registrationNumber?: string;
}

interface InvoiceFormData {
  _id?: string;
  companyInfo?: CompanyInfo;
  object?: string;
  clientId: string;
  bankAccountId?: string;
  items: InvoiceItem[];
  taxRate: number;
  discountRate: number;
  issueDate: string;
  dueDate: string;
  paymentInfo?: PaymentInfo;
  notes?: string;
  terms?: string;
}

interface InvoiceFormProps {
  invoice?: Partial<InvoiceFormData>;
  onSuccess: () => void;
  onCancel: () => void;
}

const InvoiceForm = ({ invoice, onSuccess, onCancel }: InvoiceFormProps) => {
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companySettings, setCompanySettings] = useState<any>(null);

  // Load clients, bank accounts and company settings
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load clients
        const clientsResponse = await apiService.getClients({ isActive: true });
        const data = clientsResponse as { data?: { clients?: any[] } | any[] };
        const clientsData = (data.data && typeof data.data === 'object' && 'clients' in data.data) 
          ? data.data.clients || []
          : Array.isArray(data.data) ? data.data : [];
        setClients(clientsData);
        
        // Load bank accounts
        const bankAccountsResponse = await apiService.getBankAccounts();
        const bankData = bankAccountsResponse as { data?: { bankAccounts?: any[] } | any[] };
        const bankAccountsData = (bankData.data && typeof bankData.data === 'object' && 'bankAccounts' in bankData.data)
          ? bankData.data.bankAccounts || []
          : Array.isArray(bankData.data) ? bankData.data : [];
        setBankAccounts(bankAccountsData);
        
        // Load company settings
        const settingsResponse = await apiService.getCompanySettings();
        if (settingsResponse.data?.settings) {
          setCompanySettings(settingsResponse.data.settings);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleSubmit = async (data: InvoiceFormData) => {
    try {
      // Use the transformation function from utils
      const payload = transformFormDataToInvoicePayload(data);

      if (invoice?._id) {
        await apiService.updateInvoice(invoice._id, payload);
        toast({
          title: "Succès",
          description: "Facture modifiée avec succès"
        });
      } else {
        await apiService.createInvoice(payload);
        toast({
          title: "Succès",
          description: "Facture créée avec succès"
        });
      }
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Calculate due date (30 days from issue date by default)
  const calculateDueDate = (issueDate: string) => {
    const date = new Date(issueDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  const today = new Date().toISOString().split('T')[0];

  // Auto-fill company info from settings if creating new invoice
  const getInitialCompanyInfo = () => {
    if (invoice?.companyInfo) {
      return invoice.companyInfo;
    }
    if (companySettings) {
      return {
        name: companySettings.name || '',
        logo: companySettings.logo || '',
        address: companySettings.address || '',
        city: companySettings.city || '',
        phone: companySettings.phone || '',
        email: companySettings.email || '',
        website: companySettings.website || '',
        registrationNumber: companySettings.registrationNumber || ''
      };
    }
    return {
      name: '',
      logo: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      website: '',
      registrationNumber: ''
    };
  };

  // Auto-fill payment info from settings if creating new invoice
  const getInitialPaymentInfo = () => {
    if (invoice?.paymentInfo) {
      return invoice.paymentInfo;
    }
    if (companySettings?.mobileMoneyAccounts || companySettings?.bankAccounts) {
      return {
        mobileMoney: companySettings.mobileMoneyAccounts || [],
        bankAccounts: companySettings.bankAccounts || []
      };
    }
    return {
      mobileMoney: [],
      bankAccounts: []
    };
  };

  // Get default tax rate from settings
  const getDefaultTaxRate = () => {
    if (invoice?.taxRate !== undefined) {
      return invoice.taxRate;
    }
    return companySettings?.invoiceSettings?.defaultTaxRate ?? 19.25;
  };

  // Get default payment terms from settings
  const getDefaultTerms = () => {
    if (invoice?.terms) {
      return invoice.terms;
    }
    return companySettings?.invoiceSettings?.defaultTermsAndConditions || "Paiement à 30 jours net.\nPénalités de retard: 10% par mois.";
  };

  // Get default notes from settings
  const getDefaultNotes = () => {
    if (invoice?.notes) {
      return invoice.notes;
    }
    return companySettings?.invoiceSettings?.defaultNotes || "";
  };

  // Get default bank account from settings
  const getDefaultBankAccount = () => {
    if (invoice?.bankAccountId) {
      return invoice.bankAccountId;
    }
    return companySettings?.defaultBankAccount || "";
  };

  const initialData = {
    companyInfo: getInitialCompanyInfo(),
    object: invoice?.object || '',
    clientId: invoice?.clientId || "",
    bankAccountId: getDefaultBankAccount(),
    items: invoice?.items && invoice.items.length > 0 
      ? invoice.items 
      : [{ description: "", detailedDescription: "", quantity: 1, unitPrice: 0, total: 0 }],
    taxRate: getDefaultTaxRate(),
    discountRate: invoice?.discountRate ?? 0,
    issueDate: invoice?.issueDate ? invoice.issueDate.split('T')[0] : today,
    dueDate: invoice?.dueDate ? invoice.dueDate.split('T')[0] : calculateDueDate(today),
    paymentInfo: getInitialPaymentInfo(),
    notes: getDefaultNotes(),
    terms: getDefaultTerms()
  };

  // Create config with client and bank account options
  const configWithClients = {
    ...invoiceFormConfig,
    steps: invoiceFormConfig.steps.map(step => ({
      ...step,
      fields: step.fields.map(field => {
        if (field.name === 'clientId') {
          return {
            ...field,
            options: clients.map(client => ({
              value: client._id,
              label: client.name + (client.company ? ` (${client.company})` : '')
            }))
          };
        }
        if (field.name === 'bankAccountId') {
          return {
            ...field,
            options: bankAccounts.map(account => ({
              value: account._id,
              label: `${account.name} - ${account.accountNumber}`
            }))
          };
        }
        return field;
      })
    }))
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
          </h1>
          <p className="text-sm text-gray-600">
            {invoice ? 'Modifiez les informations de la facture' : 'Créez une nouvelle facture'}
          </p>
        </div>
      </div>

      {/* Formulaire multi-étapes */}
      <MultiStepFormContainer
        formType="invoice"
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        config={configWithClients as any}
      />
    </div>
  );
};

export default InvoiceForm;
