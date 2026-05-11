import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Wallet } from 'lucide-react';
import { formatXAF } from '@/data/mockData';

interface BankAccountPreviewRendererProps {
  data: {
    name?: string;
    bank?: string;
    accountNumber?: string;
    iban?: string;
    swift?: string;
    currency?: string;
    type?: string;
    initialBalance?: number;
    accountCode?: string;
    description?: string;
    isActive?: boolean;
  };
}

const BankAccountPreviewRenderer: React.FC<BankAccountPreviewRendererProps> = ({ data }) => {
  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'checking': return 'Compte courant';
      case 'savings': return 'Compte épargne';
      case 'business': return 'Compte professionnel';
      default: return 'Non spécifié';
    }
  };

  const getCurrencyLabel = (currency?: string) => {
    switch (currency) {
      case 'XAF': return 'XAF (Franc CFA)';
      case 'EUR': return 'EUR (Euro)';
      case 'USD': return 'USD (Dollar)';
      default: return 'XAF (Franc CFA)';
    }
  };

  const isCash = data.type === 'cash' || data.bank?.toLowerCase().includes('caisse');

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600 mb-4">
        Aperçu du compte bancaire
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isCash ? 'bg-amber-100' : 'bg-blue-100'
              }`}>
                {isCash ? (
                  <Wallet className="w-5 h-5 text-amber-600" />
                ) : (
                  <Building2 className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <CardTitle className="text-base">
                  {data.name || 'Nom du compte'}
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {data.bank || 'Nom de la banque'}
                </p>
              </div>
            </div>
            {data.isActive !== false && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Actif
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Type de compte</p>
              <p className="text-sm font-medium text-slate-700">
                {getTypeLabel(data.type)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Numéro de compte</p>
              <p className="text-sm font-mono text-slate-700">
                {data.accountNumber || 'Non renseigné'}
              </p>
            </div>

            {data.iban && (
              <div>
                <p className="text-xs text-slate-500 mb-1">IBAN</p>
                <p className="text-sm font-mono text-slate-700">{data.iban}</p>
              </div>
            )}

            {data.swift && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Code SWIFT/BIC</p>
                <p className="text-sm font-mono text-slate-700">{data.swift}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Solde initial</p>
              <p className="text-2xl font-bold text-slate-900">
                {data.initialBalance !== undefined 
                  ? formatXAF(data.initialBalance) 
                  : formatXAF(0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {getCurrencyLabel(data.currency)}
              </p>
            </div>

            {data.accountCode && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Code comptable</p>
                <p className="text-sm font-medium text-slate-700">{data.accountCode}</p>
              </div>
            )}

            {data.description && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-700">{data.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankAccountPreviewRenderer;
