import React from 'react';
import { formatXAF } from '@/data/mockData';

interface JournalEntryLine {
  account?: {
    code?: string;
    name?: string;
  };
  debit?: number;
  credit?: number;
}

interface JournalEntryFormData {
  date?: string;
  reference?: string;
  description?: string;
  entries?: JournalEntryLine[];
}

interface JournalEntryPreviewRendererProps {
  data: JournalEntryFormData;
}

const JournalEntryPreviewRenderer: React.FC<JournalEntryPreviewRendererProps> = ({ data }) => {
  const totalDebit = data.entries?.reduce((sum: number, entry: JournalEntryLine) => 
    sum + (entry.debit || 0), 0) || 0;
  const totalCredit = data.entries?.reduce((sum: number, entry: JournalEntryLine) => 
    sum + (entry.credit || 0), 0) || 0;
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
          <span>{data.date ? new Date(data.date).toLocaleDateString('fr-FR') : <span className="italic opacity-50">Date non définie</span>}</span>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_100px] gap-0 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-[10px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
          <span>Compte</span>
          <span className="text-right">Débit</span>
          <span className="text-right">Crédit</span>
        </div>
        {data.entries?.map((entry: JournalEntryLine, i: number) => (
          <div key={i} className="grid grid-cols-[1fr_100px_100px] gap-0 px-3 py-2 border-t border-gray-200 dark:border-gray-600 items-center">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-primary">{entry.account?.code || '---'}</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {entry.account?.name || <span className="text-gray-400 italic">Compte non sélectionné</span>}
              </span>
            </div>
            <span className="text-right text-sm text-gray-900 dark:text-gray-100">
              {entry.debit ? formatXAF(entry.debit) : '-'}
            </span>
            <span className="text-right text-sm text-gray-900 dark:text-gray-100">
              {entry.credit ? formatXAF(entry.credit) : '-'}
            </span>
          </div>
        ))}
        <div className="grid grid-cols-[1fr_100px_100px] gap-0 px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-muted/30 font-semibold">
          <span className="text-xs uppercase text-muted-foreground">Total</span>
          <span className={balanced ? "text-right text-success" : "text-right text-destructive"}>
            {formatXAF(totalDebit)}
          </span>
          <span className={balanced ? "text-right text-success" : "text-right text-destructive"}>
            {formatXAF(totalCredit)}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">
            {data.description || <span className="italic opacity-50">Aucune description</span>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryPreviewRenderer;
