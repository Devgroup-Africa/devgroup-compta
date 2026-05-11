import { formatXAF } from '@/data/mockData';

interface InvoiceItem {
  description?: string;
  detailedDescription?: string;
  quantity?: number;
  unitPrice?: number;
  price?: number;
}

interface CompanyInfo {
  name?: string;
  logo?: string;
  city?: string;
  email?: string;
}

interface PaymentInfo {
  mobileMoney?: Array<{
    provider: string;
    number: string;
  }>;
  bankAccounts?: Array<{
    bankName: string;
    accountNumber: string;
  }>;
}

interface InvoiceFormData {
  companyInfo?: CompanyInfo;
  object?: string;
  clientName?: string;
  items?: InvoiceItem[];
  taxRate?: number;
  discountRate?: number;
  issueDate?: string;
  dueDate?: string;
  paymentInfo?: PaymentInfo;
}

interface InvoicePreviewRendererProps {
  data: InvoiceFormData;
}

const InvoicePreviewRenderer: React.FC<InvoicePreviewRendererProps> = ({ data }) => {
  const subtotal = data.items?.reduce((sum: number, item: InvoiceItem) => 
    sum + ((item.quantity || 0) * ((item.unitPrice || item.price) || 0)), 0) || 0;
  const discountAmount = subtotal * ((data.discountRate || 0) / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * ((data.taxRate || 0) / 100);
  const total = taxableAmount + taxAmount;

  return (
    <div className="space-y-4">
      {/* Company Info */}
      {data.companyInfo && (data.companyInfo.name || data.companyInfo.city) && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h4 className="font-semibold text-purple-900 dark:text-purple-100">Entreprise</h4>
          </div>
          {data.companyInfo.name && (
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{data.companyInfo.name}</p>
          )}
          {data.companyInfo.city && (
            <p className="text-xs text-purple-600 dark:text-purple-400">{data.companyInfo.city}</p>
          )}
          {data.companyInfo.email && (
            <p className="text-xs text-purple-600 dark:text-purple-400">{data.companyInfo.email}</p>
          )}
        </div>
      )}

      {/* Invoice Object */}
      {data.object && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-3 border border-amber-200/50 dark:border-amber-800/50">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-xs font-medium text-amber-900 dark:text-amber-100">Objet: {data.object}</span>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h4 className="font-semibold text-blue-900 dark:text-blue-100">Aperçu de la facture</h4>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          {data.clientName || <span className="italic opacity-50">Client non sélectionné</span>}
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
          {data.items.map((item: InvoiceItem, i: number) => (
            <div key={i} className="px-3 py-2 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-[1fr_80px_100px_100px] gap-0 items-center">
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {item.description || <span className="text-gray-400 italic">(Vide)</span>}
                </span>
                <span className="text-center text-sm text-gray-900 dark:text-gray-100">{item.quantity || 0}</span>
                <span className="text-right text-sm text-gray-900 dark:text-gray-100">{formatXAF((item.unitPrice || item.price) || 0)}</span>
                <span className="text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatXAF((item.quantity || 0) * ((item.unitPrice || item.price) || 0))}
                </span>
              </div>
              {item.detailedDescription && (
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 pl-0">
                  {item.detailedDescription.split('\n').slice(0, 2).map((line, idx) => (
                    <div key={idx}>- {line}</div>
                  ))}
                  {item.detailedDescription.split('\n').length > 2 && (
                    <div className="italic">...</div>
                  )}
                </div>
              )}
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
            <span className="text-gray-600 dark:text-gray-400">TVA ({data.taxRate}%)</span>
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

      {/* Payment Info */}
      {data.paymentInfo && (data.paymentInfo.mobileMoney?.length || data.paymentInfo.bankAccounts?.length) ? (
        <div className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 rounded-xl p-4 border border-cyan-200/50 dark:border-cyan-800/50">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h4 className="font-semibold text-cyan-900 dark:text-cyan-100">Paiement</h4>
          </div>
          <div className="space-y-2 text-xs">
            {data.paymentInfo.mobileMoney?.map((mm, idx) => (
              <div key={idx} className="text-cyan-700 dark:text-cyan-300">
                {mm.provider}: {mm.number}
              </div>
            ))}
            {data.paymentInfo.bankAccounts?.map((bank, idx) => (
              <div key={idx} className="text-cyan-700 dark:text-cyan-300">
                {bank.bankName}: {bank.accountNumber}
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
};

export default InvoicePreviewRenderer;
