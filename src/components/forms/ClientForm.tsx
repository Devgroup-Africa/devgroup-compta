import React, { useState } from 'react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import MultiStepFormContainer from './MultiStepFormContainer';

interface ClientFormProps {
  client?: {
    _id: string;
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
    isActive?: boolean;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSuccess, onCancel }) => {
  const { toast } = useToast();

  interface ClientFormData {
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
    isActive?: boolean;
  }

  const handleSubmit = async (data: ClientFormData) => {
    try {
      if (client) {
        await apiService.updateClient(client._id, data);
        toast({
          title: "Succès",
          description: "Client mis à jour avec succès",
        });
      } else {
        await apiService.createClient(data);
        toast({
          title: "Succès",
          description: "Client créé avec succès",
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

  const initialData: Partial<ClientFormData> = client ? {
    name: client.name || '',
    email: client.email || '',
    phone: client.phone || '',
    company: client.company || '',
    address: {
      street: client.address?.street || '',
      city: client.address?.city || '',
      postalCode: client.address?.postalCode || '',
      country: client.address?.country || 'Cameroun'
    },
    paymentTerms: client.paymentTerms || 30,
    creditLimit: client.creditLimit || 0,
    taxNumber: client.taxNumber || '',
    isActive: client.isActive !== false
  } : {};

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
            {client ? 'Modifier le client' : 'Nouveau client'}
          </h1>
          <p className="text-sm text-gray-600">
            {client ? 'Modifiez les informations du client' : 'Créez un nouveau client'}
          </p>
        </div>
      </div>

      {/* Formulaire multi-étapes */}
      <MultiStepFormContainer
        formType="client"
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </div>
  );
};

export default ClientForm;
