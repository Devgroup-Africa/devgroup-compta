import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Building2, Wallet } from 'lucide-react';
import { formatXAF } from '@/data/mockData';

interface TransferPreviewRendererProps {
  data: {
    sourceAccount?: { _id: string; name: string; bank: string; currentBalance: number; type: string } | string;
    destinationAccount?: { _id: string; name: string; bank: string; currentBalance: number; type: string } | string;
    amount?: number;
    date?: string;
    reference?: string;
    description?: string;
  };
}

const TransferPreviewRenderer: React.FC<TransferPreviewRendererProps> = ({ data }) => {
  const sourceAcc = typeof data.sourceAccount === 'object' ? data.sourceAccount : null;
  const destAcc = typeof data.destinationAccount === 'object' ? data.destinationAccount : null;

  const getAccountIcon = (type?: string) => {
    if (type === 'cash') return <Wallet className="w-5 h-5 text-amber-600" />;
    return <Building2 className="w-5 h-5 text-blue-600" />;
  };

  const getAccountBg = (type?: string) => {
    if (type === 'cash') return 'bg-amber-100';
    return 'bg-blue-100';
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600 mb-4">
        Aperçu du virement
      </div>

      <div className="space-y-4">
        {/* Compte source */}
        <Card className="border-2 border-red-200 bg-red-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getAccountBg(sourceAcc?.type)}`}>
                {getAccountIcon(sourceAcc?.type)}
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Compte source (débit)</p>
                <p className="font-medium text-slate-900">
                  {sourceAcc?.name || 'Sélectionnez un compte'}
                </p>
                {sourceAcc?.bank && (
                  <p className="text-xs text-slate-500">{sourceAcc.bank}</p>
                )}
                {sourceAcc?.currentBalance !== undefined && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-500">Solde actuel</p>
                    <p className="text-sm font-bold text-slate-700">
                      {formatXAF(sourceAcc.currentBalance)}
                    </p>
                    {data.amount !== undefined && (
                      <p className="text-xs text-red-600 mt-1">
                        Après virement: {formatXAF(sourceAcc.currentBalance - data.amount)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flèche et montant */}
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">Montant du virement</p>
              <p className="text-2xl font-bold text-purple-600">
                {data.amount !== undefined ? formatXAF(data.amount) : formatXAF(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Compte destination */}
        <Card className="border-2 border-green-200 bg-green-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getAccountBg(destAcc?.type)}`}>
                {getAccountIcon(destAcc?.type)}
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Compte destination (crédit)</p>
                <p className="font-medium text-slate-900">
                  {destAcc?.name || 'Sélectionnez un compte'}
                </p>
                {destAcc?.bank && (
                  <p className="text-xs text-slate-500">{destAcc.bank}</p>
                )}
                {destAcc?.currentBalance !== undefined && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-500">Solde actuel</p>
                    <p className="text-sm font-bold text-slate-700">
                      {formatXAF(destAcc.currentBalance)}
                    </p>
                    {data.amount !== undefined && (
                      <p className="text-xs text-green-600 mt-1">
                        Après virement: {formatXAF(destAcc.currentBalance + data.amount)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails supplémentaires */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
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

            {data.description && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-700">{data.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded border border-blue-100">
        <p className="font-medium text-blue-900 mb-1">Opération atomique</p>
        <p>
          Deux transactions seront créées automatiquement (une sortie et une entrée) avec les écritures comptables correspondantes.
        </p>
      </div>
    </div>
  );
};

export default TransferPreviewRenderer;
