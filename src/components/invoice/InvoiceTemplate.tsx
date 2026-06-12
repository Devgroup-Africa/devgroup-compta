import { formatXAF } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

interface InvoiceItem {
  description: string;
  detailedDescription?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceTemplateProps {
  invoice: {
    number: string;
    object?: string;
    issueDate: string;
    dueDate: string;
    status: string;
    items: InvoiceItem[];
    subtotal: number;
    discountRate: number;
    discountAmount: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    terms?: string;
    companyInfo?: {
      name?: string;
      logo?: string;
      address?: string;
      city?: string;
      phone?: string;
      email?: string;
      website?: string;
      registrationNumber?: string;
    };
    client?: {
      name: string;
      company?: string;
      address?: {
        street?: string;
        city?: string;
        postalCode?: string;
      };
      phone?: string;
      email?: string;
      taxNumber?: string;
    };
    paymentInfo?: {
      mobileMoney?: Array<{
        provider: string;
        number: string;
        name: string;
      }>;
      bankAccounts?: Array<{
        bankName: string;
        accountNumber: string;
        accountName: string;
      }>;
    };
  };
  forPrint?: boolean;
}

const InvoiceTemplate = ({ invoice, forPrint = false }: InvoiceTemplateProps) => {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: 'Brouillon', variant: 'secondary' },
      sent: { label: 'Envoyée', variant: 'default' },
      paid: { label: 'Payée', variant: 'default' },
      partial: { label: 'Partiellement payée', variant: 'outline' },
      overdue: { label: 'En retard', variant: 'destructive' },
      cancelled: { label: 'Annulée', variant: 'destructive' }
    };
    return statusMap[status] || { label: status, variant: 'default' };
  };

  const statusInfo = getStatusBadge(invoice.status);

  return (
    <div
      className={`bg-white ${forPrint ? 'p-8' : 'p-8'} max-w-4xl mx-auto font-sans text-gray-800`}
      style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
    >
      {/* ── TOP HEADER: company name + thin blue rule ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            {invoice.companyInfo?.logo ? (
              <img src={invoice.companyInfo.logo} alt="Logo" className="h-10" />
            ) : (
              <img src="/logo devgroup-1.png" alt="DevGroup Africa" className="h-10" />
            )}
            <span className="text-sm font-semibold text-blue-900" style={{ letterSpacing: '0.04em' }}>
              {invoice.companyInfo?.name || 'DevGroup Africa'}
            </span>
          </div>
          {!forPrint && (
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          )}
        </div>
        {/* thin blue rule */}
        <div className="h-px bg-blue-600 mt-2" />
      </div>

      {/* ── FACTURE TITLE ── */}
      <div className="flex items-center justify-center mb-8 mt-6">
        {/* left accent bar */}
        <div className="w-1.5 h-10 bg-blue-700 mr-3 rounded-sm" />
        <h2
          className="text-4xl font-extrabold text-blue-900 tracking-widest"
          style={{ letterSpacing: '0.18em' }}
        >
          FACTURE
        </h2>
      </div>

      {/* thin blue rule below title */}
      <div className="h-px bg-blue-600 mb-7" />

      {/* ── ÉMETTEUR + CLIENT ── */}
      <div className="grid grid-cols-2 gap-6 mb-7">
        {/* Émetteur */}
        <div className="bg-blue-50 p-4 rounded-sm">
          <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">ÉMETTEUR</p>
          <p className="font-bold text-blue-900 text-sm">{invoice.companyInfo?.name || 'DevGroup Africa'}</p>
          {invoice.companyInfo?.city && <p className="text-gray-600 text-xs mt-0.5">{invoice.companyInfo.city}</p>}
          {invoice.companyInfo?.email && <p className="text-gray-600 text-xs">{invoice.companyInfo.email}</p>}
          {invoice.companyInfo?.website && <p className="text-gray-600 text-xs">{invoice.companyInfo.website}</p>}
          {invoice.companyInfo?.phone && <p className="text-gray-600 text-xs">{invoice.companyInfo.phone}</p>}
        </div>

        {/* Client */}
        <div className="p-4">
          <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">CLIENT</p>
          <p className="font-bold text-gray-900 text-sm">{invoice.client?.name}</p>
          {invoice.client?.company && (
            <p className="text-gray-700 text-xs mt-0.5">Nom: {invoice.client.company}</p>
          )}
          {invoice.client?.phone && (
            <p className="text-red-600 text-xs font-medium">Numéro: {invoice.client.phone}</p>
          )}
          {invoice.client?.email && <p className="text-gray-600 text-xs">{invoice.client.email}</p>}
          {invoice.client?.taxNumber && <p className="text-gray-600 text-xs">{invoice.client.taxNumber}</p>}
        </div>
      </div>

      {/* ── META INFOS: N° Facture / Objet / Dates ── */}
      <div className="grid grid-cols-2 gap-4 mb-7">
        <div className="space-y-1.5">
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-sm gap-2">
            <span className="text-xs font-semibold text-gray-700 w-28 shrink-0">N° Facture :</span>
            <span className="text-xs font-bold text-blue-900">{invoice.number}</span>
          </div>
          {invoice.object && (
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-sm gap-2">
              <span className="text-xs font-semibold text-gray-700 w-28 shrink-0">Objet :</span>
              <span className="text-xs text-gray-800">{invoice.object}</span>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-sm gap-2">
            <span className="text-xs font-semibold text-gray-700 w-36 shrink-0">Date d'émission :</span>
            <span className="text-xs text-gray-800">{new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-sm gap-2">
            <span className="text-xs font-semibold text-gray-700 w-36 shrink-0">Date d'échéance :</span>
            <span className="text-xs text-gray-800">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>

      {/* ── ITEMS TABLE ── */}
      <div className="mb-6">
        <table className="w-full border-collapse" style={{ borderColor: '#d1d5db' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e3a5f' }} className="text-white">
              <th className="text-center p-2.5 border border-gray-300 text-xs font-semibold w-8">#</th>
              <th className="text-left p-2.5 border border-gray-300 text-xs font-semibold w-36">Service / produit</th>
              <th className="text-left p-2.5 border border-gray-300 text-xs font-semibold">Description du service / produit</th>
              <th className="text-center p-2.5 border border-gray-300 text-xs font-semibold w-20">Quantité</th>
              <th className="text-right p-2.5 border border-gray-300 text-xs font-semibold w-28">Prix unitaire</th>
              <th className="text-right p-2.5 border border-gray-300 text-xs font-semibold w-24">Montant</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-2.5 border border-gray-300 text-xs text-center text-gray-700">{index + 1}</td>
                <td className="p-2.5 border border-gray-300 text-xs font-medium text-gray-800">{item.description}</td>
                <td className="p-2.5 border border-gray-300 text-xs text-gray-600">
                  {item.detailedDescription ? (
                    <ul className="list-none space-y-0.5">
                      {item.detailedDescription.split('\n').map((line, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="mt-0.5 text-gray-400">-</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  ) : '-'}
                </td>
                <td className="p-2.5 border border-gray-300 text-xs text-center text-gray-700">{item.quantity}</td>
                <td className="p-2.5 border border-gray-300 text-xs text-right text-gray-700">
                  {formatXAF(item.unitPrice).replace(' FCFA', '')}
                </td>
                <td className="p-2.5 border border-gray-300 text-xs text-right font-semibold text-gray-800">
                  {formatXAF(item.total).replace(' FCFA', '')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── TOTALS ── */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="flex justify-between py-2 px-4 border border-gray-200">
            <span className="text-xs text-gray-700">Sous-total HT</span>
            <span className="text-xs font-semibold text-gray-800">{formatXAF(invoice.subtotal)}</span>
          </div>
          {invoice.discountRate > 0 && (
            <div className="flex justify-between py-2 px-4 border border-gray-200 text-red-600">
              <span className="text-xs">Remise ({invoice.discountRate}%)</span>
              <span className="text-xs font-semibold">-{formatXAF(invoice.discountAmount)}</span>
            </div>
          )}
          <div
            className="flex justify-between py-3 px-4 mt-0.5 text-white"
            style={{ backgroundColor: '#1e3a5f' }}
          >
            <span className="text-sm font-bold uppercase tracking-wide">TOTAL TTC</span>
            <span className="text-base font-extrabold">{formatXAF(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* ── INFORMATIONS DE PAIEMENT ── */}
      {(invoice.paymentInfo?.mobileMoney?.length || invoice.paymentInfo?.bankAccounts?.length) && (
        <div className="mb-8">
          <div className="h-px bg-blue-600 mb-4" />
          <h3 className="font-bold text-sm mb-4 text-blue-900 uppercase tracking-wide">
            INFORMATIONS DE PAIEMENT
          </h3>
          <div className="grid grid-cols-2 gap-8">
            {invoice.paymentInfo?.mobileMoney?.map((mm, index) => (
              <div key={index}>
                <p className="font-semibold text-xs mb-1 text-gray-800">{mm.provider} :</p>
                <p className="text-xs text-gray-600">{mm.provider} : {mm.number}</p>
                <p className="text-xs text-gray-600">Au nom de : {mm.name}</p>
              </div>
            ))}
            {invoice.paymentInfo?.bankAccounts?.map((bank, index) => (
              <div key={index}>
                <p className="font-semibold text-xs mb-1 text-gray-800">{bank.bankName} :</p>
                <p className="text-xs text-gray-600">{bank.bankName} : {bank.accountNumber}</p>
                <p className="text-xs text-gray-600">Au nom de : {bank.accountName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SIGNATURES ── */}
      <div className="grid grid-cols-2 gap-12 mt-14">
        <div>
          <p className="font-semibold text-xs mb-1 text-gray-800">
            Signature / Cachet {invoice.companyInfo?.name || 'DevGroup Africa'}
          </p>
          <div className="mt-16 border-t border-gray-400 pt-2">
            <p className="text-xs text-gray-500">Nom &amp; Qualité : ___________________________</p>
          </div>
        </div>
        <div>
          <p className="font-semibold text-xs mb-1 text-gray-800">Bon pour accord — Client</p>
          <div className="mt-16 border-t border-gray-400 pt-2">
            <p className="text-xs text-gray-500">Nom &amp; Qualité : ___________________________</p>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="mt-10 pt-4 border-t border-gray-300">
        <p className="text-center text-sm text-blue-900 font-medium italic mb-3">
          Merci pour votre confiance !
        </p>
        {/* footer info bar */}
        <div
          className="flex items-center justify-center gap-4 py-2 px-4 rounded-sm"
          style={{ backgroundColor: '#1e3a5f' }}
        >
          {/* Globe icon */}
          {invoice.companyInfo?.website && (
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="text-white text-xs">{invoice.companyInfo.email || 'contact@devgroup.ga'}</span>
            </div>
          )}
          {/* Phone icon */}
          {invoice.companyInfo?.phone && (
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.13 6.13l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="text-white text-xs">{invoice.companyInfo.phone}</span>
            </div>
          )}
          {/* Location icon */}
          {invoice.companyInfo?.city && (
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-white text-xs">{invoice.companyInfo.city}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
