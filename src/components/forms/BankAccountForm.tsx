import React from 'react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import MultiStepFormContainer from './MultiStepFormContainer';
import { bankAccountFormConfig } from './configs/bankAccountFormConfig';

interface BankAccountFormProps {
  bankAccount?: {
    _id: string;
    name: string;
    bank: string;
    accountNumber: string;
    iban?: string;
    swift?: string;
    currency?: string;
    type?: string;
    initialBalance?: number;
    currentBalance?: number;
    accountCode?: string;
    description?: string;
    isActive?: boolean;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ bankAccount, onSuccess, onCancel }) => {
  const { toast } = useToast();

  interface BankAccountFormData {
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
    isActive?: boolean;
  }

  const handleSubmit = async (data: BankAccountFormData) => {
    try {
      if (bankAccount) {
        await apiService.updateBankAccount(bankAccount._id, data);
        toast({
          title: "Succès",
          description: "Compte bancaire mis à jour avec succès",
        });
      } else {
        await apiService.createBankAccount(data);
        toast({
          title: "Succès",
          description: "Compte bancaire créé avec succès",
        });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
      throw error;
    }
  };

  const initialData: Partial<BankAccountFormData> = bankAccount ? {
    name: bankAccount.name || '',
    bank: bankAccount.bank || '',
    accountNumber: bankAccount.accountNumber || '',
    iban: bankAccount.iban || '',
    swift: bankAccount.swift || '',
    currency: bankAccount.currency || 'XAF',
    type: bankAccount.type || 'checking',
    initialBalance: bankAccount.initialBalance || 0,
    accountCode: bankAccount.accountCode || '512',
    description: bankAccount.description || '',
    isActive: bankAccount.isActive !== false
  } : {
    currency: 'XAF',
    type: 'checking',
    initialBalance: 0,
    accountCode: '512',
    isActive: true
  };

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
            {bankAccount ? 'Modifier le compte bancaire' : 'Nouveau compte bancaire'}
          </h1>
          <p className="text-sm text-gray-600">
            {bankAccount ? 'Modifiez les informations du compte' : 'Créez un nouveau compte bancaire'}
          </p>
        </div>
      </div>

      {/* Formulaire multi-étapes */}
      <MultiStepFormContainer
        formType="bankAccount"
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        config={bankAccountFormConfig}
      />
    </div>
  );
};

export default BankAccountForm;
