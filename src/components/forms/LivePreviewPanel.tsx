import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatXAF } from '@/data/mockData';
import { cn } from '@/lib/utils';
import BankAccountPreviewRenderer from './preview/BankAccountPreviewRenderer';
import TransactionPreviewRenderer from './preview/TransactionPreviewRenderer';
import TransferPreviewRenderer from './preview/TransferPreviewRenderer';

interface LivePreviewPanelProps<T> {
  formType: 'client' | 'supplier' | 'invoice' | 'journalEntry' | 'bankAccount' | 'transaction' | 'transfer';
  formData: T;
  currentStep: number;
  changedFields?: string[];
  className?: string;
}

const LivePreviewPanel = <T,>({
  formType,
  formData,
  currentStep,
  changedFields = [],
  className
}: LivePreviewPanelProps<T>) => {
  const renderPreviewContent = () => {
    switch (formType) {
      case 'client':
        return renderClientPreview(formData as any);
      case 'supplier':
        return renderSupplierPreview(formData as any);
      case 'invoice':
        return renderInvoicePreview(formData as any);
      case 'journalEntry':
        return renderJournalEntryPreview(formData as any);
      case 'bankAccount':
        return <BankAccountPreviewRenderer data={formData as any} />;
      case 'transaction':
        return <TransactionPreviewRenderer data={formData as any} />;
      case 'transfer':
        return <TransferPreviewRenderer data={formData as any} />;
      default:
        return null;
    }
  };

  const renderClientPreview = (data: any) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          {data.clientType && data.clientType !== 'particulier' ? (
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {data.name || <span className="text-gray-400 italic">Nom du client</span>}
          </h3>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {data.clientType || 'particulier'}
          </p>
          {data.company && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{data.company}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {data.email && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{data.email}</span>
          </div>
        )}
        {data.phone && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{data.phone}</span>
          </div>
        )}
      </div>

      {data.address?.street && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              {data.address.street}
              {data.address.city && `, ${data.address.city}`}
              {data.address.country && `, ${data.address.country}`}
            </span>
          </div>
        </div>
      )}

      {data.clientType && data.clientType !== 'particulier' && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Délai de paiement:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{data.paymentTerms || 0} jours</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Limite de crédit:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{formatXAF(data.creditLimit || 0)}</span>
          </div>
          {data.taxNumber && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">N fiscal:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">{data.taxNumber}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSupplierPreview = (data: any) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-warning/8 flex items-center justify-center text-warning font-bold text-sm border border-warning/10">
          {data.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {data.name || <span className="text-gray-400 italic">Nom du fournisseur</span>}
          </h3>
          {data.company && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{data.company}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {data.email && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{data.email}</span>
          </div>
        )}
        {data.phone && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{data.phone}</span>
          </div>
        )}
      </div>

      {data.address?.street && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              {data.address.street}
              {data.address.city && `, ${data.address.city}`}
              {data.address.country && `, ${data.address.country}`}
            </span>
          </div>
        </div>
      )}

      {data.taxNumber && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-400">N° fiscal:</span>
            <span className="font-mono text-gray-900 dark:text-gray-100">{data.taxNumber}</span>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Délai paiement:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{data.paymentTerms || 30} jours</span>
        </div>
      </div>

      {data.bankDetails?.bankName && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Informations bancaires</h4>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {data.bankDetails.bankName && (
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>{data.bankDetails.bankName}</span>
              </div>
            )}
            {data.bankDetails.accountNumber && (
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-mono">{data.bankDetails.accountNumber}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderInvoicePreview = (data: any) => {
    const subtotal = data.items?.reduce((sum: number, item: any) => sum + (item.total || (item.quantity * item.unitPrice) || 0), 0) || 0;
    const discountAmount = subtotal * ((data.discountRate || 0) / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * ((data.taxRate || 19.25) / 100);
    const total = taxableAmount + taxAmount;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Aperçu de la facture</h4>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {data.clientId ? (
              <span>Client sélectionné</span>
            ) : (
              <span className="italic opacity-50">Client non sélectionné</span>
            )}
          </p>
        </div>

        {data.items && data.items.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_100px_100px] gap-0 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-[10px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              <span>Description</span>
              <span className="text-center">Qté</span>
              <span className="text-right">Prix unit.</span>
              <span className="text-right">Total</span>
            </div>
            {data.items.map((item: any, i: number) => (
              <div key={i} className="grid grid-cols-[1fr_80px_100px_100px] gap-0 px-3 py-2 border-t border-gray-200 dark:border-gray-600 items-center">
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {item.description || <span className="text-gray-400 italic">(Vide)</span>}
                </span>
                <span className="text-center text-sm text-gray-900 dark:text-gray-100">{item.quantity || 0}</span>
                <span className="text-right text-sm text-gray-900 dark:text-gray-100">{formatXAF(item.unitPrice || 0)}</span>
                <span className="text-right text-sm font-medium text-gray-900 dark:text-gray-100">{formatXAF(item.total || ((item.quantity || 0) * (item.unitPrice || 0)))}</span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-4 border border-green-200/50 dark:border-green-800/50">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Sous-total HT</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{formatXAF(subtotal)}</span>
            </div>
            {data.discountRate && data.discountRate > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Remise ({data.discountRate}%)</span>
                <span className="font-medium text-red-600 dark:text-red-400">-{formatXAF(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">TVA ({data.taxRate || 19.25}%)</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{formatXAF(taxAmount)}</span>
            </div>
            <div className="border-t border-green-200 dark:border-green-700 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total TTC</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{formatXAF(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <span className="text-gray-600 dark:text-gray-400 text-xs uppercase">Date d'émission</span>
            <p className="text-gray-900 dark:text-gray-100">
              {data.issueDate ? new Date(data.issueDate).toLocaleDateString('fr-FR') : <span className="text-gray-400 italic">Non définie</span>}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-600 dark:text-gray-400 text-xs uppercase">Date d'échéance</span>
            <p className="text-gray-900 dark:text-gray-100">
              {data.dueDate ? new Date(data.dueDate).toLocaleDateString('fr-FR') : <span className="text-gray-400 italic">Non définie</span>}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderJournalEntryPreview = (data: any) => {
    const totalDebit = data.entries?.reduce((sum: number, entry: any) => sum + (entry.debit || 0), 0) || 0;
    const totalCredit = data.entries?.reduce((sum: number, entry: any) => sum + (entry.credit || 0), 0) || 0;
    const balanced = totalDebit === totalCredit;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h4 className="font-semibold text-purple-900 dark:text-purple-100">Aperçu de l'écriture</h4>
          </div>
          <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
            <span className="font-mono">{data.reference || 'Réf.'}</span>
            <span className="opacity-50">|</span>
            <span>{new Date(data.date || Date.now()).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_100px] gap-0 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-[10px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            <span>Compte</span>
            <span className="text-right">Débit</span>
            <span className="text-right">Crédit</span>
          </div>
          {data.entries?.map((entry: any, i: number) => (
            <div key={i} className="grid grid-cols-[1fr_100px_100px] gap-0 px-3 py-2 border-t border-gray-200 dark:border-gray-600 items-center">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-primary">{entry.account?.code || '---'}</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">{entry.account?.name || <span className="text-gray-400 italic">Compte non sélectionné</span>}</span>
              </div>
              <span className="text-right text-sm text-gray-900 dark:text-gray-100">{entry.debit ? formatXAF(entry.debit) : '-'}</span>
              <span className="text-right text-sm text-gray-900 dark:text-gray-100">{entry.credit ? formatXAF(entry.credit) : '-'}</span>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_100px_100px] gap-0 px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-muted/30 font-semibold">
            <span className="text-xs uppercase text-muted-foreground">Total</span>
            <span className={cn("text-right", balanced ? "text-success" : "text-destructive")}>
              {formatXAF(totalDebit)}
            </span>
            <span className={cn("text-right", balanced ? "text-success" : "text-destructive")}>
              {formatXAF(totalCredit)}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-400">{data.description || <span className="italic opacity-50">Aucune description</span>}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Aperçu en direct
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {renderPreviewContent()}
      </CardContent>
    </Card>
  );
};

export default LivePreviewPanel;
