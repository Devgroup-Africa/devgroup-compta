import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/api";
import MultiStepFormContainer from "./MultiStepFormContainer";

interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: {
    street: string;
    city: string;
    country: string;
  };
  paymentTerms: number;
  taxNumber: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    iban: string;
  };
}

interface SupplierFormProps {
  supplier?: SupplierFormData & { _id?: string };
  onSuccess: () => void;
  onCancel: () => void;
}

const SupplierForm = ({ supplier, onSuccess, onCancel }: SupplierFormProps) => {
  const { toast } = useToast();

  const handleSubmit = async (data: SupplierFormData) => {
    try {
      if (supplier) {
        await apiService.updateSupplier(supplier._id, data);
        toast({
          title: "Fournisseur modifié",
          description: `${data.name} a été modifié avec succès.`
        });
      } else {
        await apiService.createSupplier(data);
        toast({
          title: "Fournisseur créé",
          description: `${data.name} a été créé avec succès.`
        });
      }
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement.";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const initialData = supplier ? {
    name: supplier.name || "",
    email: supplier.email || "",
    phone: supplier.phone || "",
    company: supplier.company || "",
    address: {
      street: supplier.address?.street || "",
      city: supplier.address?.city || "",
      country: supplier.address?.country || "Cameroun"
    },
    paymentTerms: supplier.paymentTerms || 30,
    taxNumber: supplier.taxNumber || "",
    bankDetails: {
      bankName: supplier.bankDetails?.bankName || "",
      accountNumber: supplier.bankDetails?.accountNumber || "",
      iban: supplier.bankDetails?.iban || ""
    }
  } : {
    name: "",
    email: "",
    phone: "",
    company: "",
    address: {
      street: "",
      city: "",
      country: "Cameroun"
    },
    paymentTerms: 30,
    taxNumber: "",
    bankDetails: {
      bankName: "",
      accountNumber: "",
      iban: ""
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {supplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MultiStepFormContainer
          formType="supplier"
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </CardContent>
    </Card>
  );
};

export default SupplierForm;
