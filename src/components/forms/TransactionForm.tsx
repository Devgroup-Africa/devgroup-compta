import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import MultiStepFormContainer from './MultiStepFormContainer';
import { getTransactionFormConfig } from './configs/transactionFormConfig';

interface TransactionFormProps {
  transaction?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bankAccountsRes, accountsRes] = await Promise.all([
        apiService.getBankAccounts({ isActive: true }),
        apiService.getAccounts()
      ]);
      
      setBankAccounts(bankAccountsRes.data?.bankAccounts || []);
      setAccounts(accountsRes.data?.accounts || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (transaction) {
        await apiService.updateTransaction(transaction._id, data);
        toast({
          title: "Succès",
          description: "Transaction mise à jour avec succès",
        });
      } else {
        await apiService.createTransaction(data);
        toast({
          title: "Succès",
          description: "Transaction créée avec succès",
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

  const initialData = transaction ? {
    type: transaction.type || 'income',
    amount: transaction.amount || 0,
    description: transaction.description || '',
    category: transaction.category || '',
    date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    reference: transaction.reference || '',
    bankAccount: transaction.bankAccount?._id || transaction.bankAccount || '',
    account: transaction.account?._id || transaction.account || '',
    notes: transaction.notes || ''
  } : {
    type: 'income',
    date: new Date().toISOString().split('T')[0]
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
            {transaction ? 'Modifier la transaction' : 'Nouvelle transaction'}
          </h1>
          <p className="text-sm text-gray-600">
            {transaction ? 'Modifiez les informations de la transaction' : 'Enregistrez une nouvelle transaction'}
          </p>
        </div>
      </div>

      <MultiStepFormContainer
        formType="transaction"
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        config={getTransactionFormConfig(bankAccounts, accounts)}
      />
    </div>
  );
};

export default TransactionForm;
