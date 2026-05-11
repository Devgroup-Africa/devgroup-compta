import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { formatXAF } from '@/data/mockData';

interface TransactionPreviewRendererProps {
  data: {
    type?: string;
    amount?: number;
    description?: string;
    category?: string;
    date?: string;
    reference?: string;
    bankAccount?: { name: string } | string;
    account?: { name: string; code: string } | string;
    notes?: string;
    attachment?: File | { filename: string };
  };
}

const TransactionPreviewRenderer: React.FC<TransactionPreviewRendererProps> = ({ data }) => {
  const isIncome = data.type === 'income';

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600 mb-4">
        Aperçu de la transaction
      </div>

      <Card className={`border-2 ${isIncome ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              isIncome ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isIncome ? (
                <ArrowDownRight className="w-6 h-6 text-green-600 rotate-180" />
              ) : (
                <ArrowUpRight className="w-6 h-6 text-red-600" />
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    isIncome 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {isIncome ? 'Recette' : 'Dépense'}
                  </span>
                  {data.category && (
                    <span className="text-xs text-slate-500">{data.category}</span>
                  )}
                </div>
                <p className="font-medium text-slate-900 text-lg">
                  {data.description || 'Description de la transaction'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Montant</p>
                <p className={`text-3xl font-bold ${
                  isIncome ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isIncome ? '+' : '-'}{data.amount !== undefined ? formatXAF(data.amount) : formatXAF(0)}
                </p>
              </div>

              {data.date && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Date</p>
                  <p className="text-sm text-slate-700">
                    {new Date(data.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {data.reference && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Référence</p>
                  <p className="text-sm font-mono text-slate-700">{data.reference}</p>
                </div>
              )}

              {data.bankAccount && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Compte bancaire</p>
                  <p className="text-sm text-slate-700">
                    {typeof data.bankAccount === 'string' 
                      ? data.bankAccount 
                      : data.bankAccount.name || 'Non sélectionné'}
                  </p>
                </div>
              )}

              {data.account && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Compte comptable</p>
                  <p className="text-sm text-slate-700">
                    {typeof data.account === 'string' 
                      ? data.account 
                      : `${data.account.code} - ${data.account.name}` || 'Non sélectionné'}
                  </p>
                </div>
              )}

              {data.attachment && (
                <div className="flex items-center gap-2 p-2 bg-slate-100 rounded">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-700">
                    {data.attachment instanceof File 
                      ? data.attachment.name 
                      : data.attachment.filename || 'Pièce jointe'}
                  </span>
                </div>
              )}

              {data.notes && (
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Notes</p>
                  <p className="text-sm text-slate-700 italic">{data.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded border border-blue-100">
        <p className="font-medium text-blue-900 mb-1">Écriture comptable automatique</p>
        <p>
          Une écriture comptable en partie double sera générée automatiquement lors de la création de cette transaction.
        </p>
      </div>
    </div>
  );
};

export default TransactionPreviewRenderer;
