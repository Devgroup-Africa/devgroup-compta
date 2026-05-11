import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/api";
import MultiStepFormContainer from "./MultiStepFormContainer";

interface JournalEntryLine {
  account: string;
  debit?: number;
  credit?: number;
}

interface JournalEntryFormData {
  date: string;
  reference: string;
  description: string;
  entries: JournalEntryLine[];
}

interface JournalEntryFormProps {
  journalEntry?: JournalEntryFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

const JournalEntryForm = ({ journalEntry, onSuccess, onCancel }: JournalEntryFormProps) => {
  const { toast } = useToast();

  const handleSubmit = async (data: JournalEntryFormData) => {
    try {
      const validEntries = data.entries.filter((entry: JournalEntryLine) => 
        entry.account && ((entry.debit && entry.debit > 0) || (entry.credit && entry.credit > 0))
      );

      if (validEntries.length < 2) {
        throw new Error("Au moins deux écritures sont requises.");
      }

      const totalDebit = validEntries.reduce((sum: number, entry: JournalEntryLine) => sum + (entry.debit || 0), 0);
      const totalCredit = validEntries.reduce((sum: number, entry: JournalEntryLine) => sum + (entry.credit || 0), 0);

      if (totalDebit !== totalCredit) {
        throw new Error("Le total débit doit être égal au total crédit.");
      }

      const entryData = {
        ...data,
        entries: validEntries
      };

      if (journalEntry) {
        await apiService.updateJournalEntry(journalEntry._id, entryData);
        toast({
          title: "Écriture modifiée",
          description: "L'écriture comptable a été modifiée avec succès."
        });
      } else {
        await apiService.createJournalEntry(entryData);
        toast({
          title: "Écriture créée",
          description: `Écriture ${data.reference} créée avec succès.`
        });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const initialData = journalEntry ? {
    date: journalEntry.date ? journalEntry.date.split('T')[0] : new Date().toISOString().split('T')[0],
    reference: journalEntry.reference || "",
    description: journalEntry.description || "",
    entries: journalEntry.entries || [
      { account: "", debit: 0, credit: 0 },
      { account: "", debit: 0, credit: 0 }
    ]
  } : {
    date: new Date().toISOString().split('T')[0],
    reference: "",
    description: "",
    entries: [
      { account: "", debit: 0, credit: 0 },
      { account: "", debit: 0, credit: 0 }
    ]
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {journalEntry ? 'Modifier l\'écriture comptable' : 'Nouvelle écriture comptable'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MultiStepFormContainer
          formType="journalEntry"
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </CardContent>
    </Card>
  );
};

export default JournalEntryForm;
