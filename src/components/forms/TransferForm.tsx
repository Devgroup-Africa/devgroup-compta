import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import MultiStepFormContainer from './MultiStepFormContainer';
import { getTransferFormConfig } from './configs/transferFormConfig';

interface TransferFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBankAccounts({ isActive: true });
      const data: any = response.data;
      setBankAccounts(data?.bankAccounts || data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les comptes bancaires",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      // Valider que les comptes sont différents
      if (data.sourceAccount === data.destinationAccount) {
        throw new Error('Les comptes source et destination doivent être différents');
      }

      // Valider le solde suffisant
      const sourceAcc = bankAccounts.find(acc => acc._id === data.sourceAccount);
      if (sourceAcc && sourceAcc.currentBalance < data.amount) {
        throw new Error('Solde insuffisant sur le compte source');
      }

      await apiService.createTransfer(data);
      toast({
        title: "Succès",
        description: "Virement effectué avec succès",
      });
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

  const initialData = {
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
            Nouveau virement
          </h1>
          <p className="text-sm text-gray-600">
            Transférez de l'argent entre vos comptes
          </p>
        </div>
      </div>

      <MultiStepFormContainer
        formType="transfer"
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        config={getTransferFormConfig(bankAccounts)}
      />
    </div>
  );
};

export default TransferForm;
