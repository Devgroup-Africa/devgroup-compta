import React from 'react';
import { formatXAF } from '@/data/mockData';

interface SupplierFormData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
  paymentTerms?: number;
  taxNumber?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    iban?: string;
  };
}

interface SupplierPreviewRendererProps {
  data: SupplierFormData;
}

const SupplierPreviewRenderer: React.FC<SupplierPreviewRendererProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-warning/8 flex items-center justify-center text-warning font-bold text-sm border border-warning/10">
          {data.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
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
};

export default SupplierPreviewRenderer;
