import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useError } from '@/contexts/ErrorContext';
import api from '@/services/api';
import { ArrowLeft, Check, Download } from 'lucide-react';
import { formatXAF } from '@/data/mockData';

interface Purchase {
  _id: string;
  purchaseNumber: string;
  supplier?: {
    _id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
  };
  bankAccount?: {
    _id: string;
    name: string;
    bank: string;
  };
  date: string;
  dueDate?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: string;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
  attachment?: string;
  attachmentName?: string;
  transaction?: any;
}

interface CompanySettings {
  name?: string;
  logo?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  registrationNumber?: string;
  taxNumber?: string;
}

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showError } = useError();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanySettings>({});
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (id) {
      loadPurchase();
      loadCompanyInfo();
    }
  }, [id]);

  const loadPurchase = async () => {
    try {
      setLoading(true);
      const response = await api.getPurchaseById(id!);
      setPurchase(response.data);
    } catch (error: any) {
      console.error('Error loading purchase:', error);
      showError(error.message || 'Impossible de charger la facture fournisseur');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyInfo = async () => {
    try {
      const response = await api.getCompanySettings();
      const data = response.data || response;
      setCompanyInfo(data);
    } catch (error) {
      console.error('Error loading company info:', error);
      // Non-blocking error, just log it
    }
  };

  const handleMarkAsPaid = async () => {
    if (!purchase) return;

    try {
      setPaying(true);
      await api.markPurchaseAsPaid(purchase._id, {
        paymentDate: new Date().toISOString(),
        paymentMethod: 'Virement'
      });
      toast({
        title: 'Succès',
        description: 'Facture marquée comme payée'
      });
      loadPurchase();
    } catch (error: any) {
      console.error('Error marking purchase as paid:', error);
      showError(error.message || 'Impossible de marquer la facture comme payée');
    } finally {
      setPaying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { label: 'Brouillon', variant: 'secondary' },
      pending: { label: 'En attente', variant: 'outline' },
      paid: { label: 'Payée', variant: 'default' },
      cancelled: { label: 'Annulée', variant: 'destructive' }
    };

    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const downloadAttachment = () => {
    if (!purchase?.attachment || !purchase?.attachmentName) return;
    
    const link = document.createElement('a');
    link.href = purchase.attachment;
    link.download = purchase.attachmentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!purchase) return;

    try {
      let response;
      if (format === 'pdf') {
        response = await api.exportPurchasePDF(purchase._id);
      } else {
        response = await api.exportPurchaseExcel(purchase._id);
      }

      if (response.data && response.data instanceof Blob) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Achat_${purchase.purchaseNumber}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: 'Export réussi',
          description: `Facture exportée en ${format.toUpperCase()}`
        });
      }
    } catch (error: any) {
      console.error('Error exporting purchase:', error);
      showError(error.message || `Impossible d'exporter en ${format.toUpperCase()}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Facture fournisseur non trouvée</p>
        <Button onClick={() => navigate('/achats')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/achats')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{purchase.purchaseNumber}</h1>
            <p className="text-sm text-gray-600">Facture fournisseur</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {purchase.attachment && purchase.attachmentName && (
            <Button variant="outline" onClick={downloadAttachment}>
              <Download className="w-4 h-4 mr-2" />
              Télécharger la pièce jointe
            </Button>
          )}
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          {purchase.status === 'pending' && (
            <Button onClick={handleMarkAsPaid} disabled={paying}>
              <Check className="w-4 h-4 mr-2" />
              {paying ? 'Traitement...' : 'Marquer comme payée'}
            </Button>
          )}
        </div>
      </div>

      {/* Professional Template */}
      <Card>
        <CardContent className="p-0">
          <div
            className="bg-white p-8 max-w-4xl mx-auto font-sans text-gray-800"
            style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
          >
            {/* TOP HEADER */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  {companyInfo.logo && (
                    <img src={companyInfo.logo} alt="Logo" className="h-10" />
                  )}
                  <span className="text-sm font-semibold text-red-900" style={{ letterSpacing: '0.04em' }}>
                    {companyInfo.name || 'Mon Entreprise'}
                  </span>
                </div>
                {getStatusBadge(purchase.status)}
              </div>
              <div className="h-px bg-red-600 mt-2" />
            </div>

            {/* TITLE */}
            <div className="flex items-center justify-center mb-8 mt-6">
              <div className="w-1.5 h-10 bg-red-700 mr-3 rounded-sm" />
              <h2
                className="text-4xl font-extrabold text-red-900 tracking-widest"
                style={{ letterSpacing: '0.18em' }}
              >
                FACTURE FOURNISSEUR
              </h2>
            </div>

            <div className="h-px bg-red-600 mb-7" />

            {/* COMPANY + SUPPLIER */}
            <div className="grid grid-cols-2 gap-6 mb-7">
              {/* Company (Acheteur) */}
              <div className="bg-red-50 p-4 rounded-sm">
                <p className="text-xs font-bold text-red-900 uppercase tracking-wide mb-2">ACHETEUR</p>
                <p className="font-bold text-red-900 text-sm">{companyInfo.name || 'Mon Entreprise'}</p>
                {companyInfo.city && <p className="text-gray-600 text-xs mt-0.5">{companyInfo.city}</p>}
                {companyInfo.email && <p className="text-gray-600 text-xs">{companyInfo.email}</p>}
                {companyInfo.website && <p className="text-gray-600 text-xs">{companyInfo.website}</p>}
                {companyInfo.phone && <p className="text-gray-600 text-xs">{companyInfo.phone}</p>}
              </div>

              {/* Supplier (Fournisseur) */}
              <div className="p-4">
                <p className="text-xs font-bold text-red-900 uppercase tracking-wide mb-2">FOURNISSEUR</p>
                <p className="font-bold text-gray-900 text-sm">{purchase.supplier?.name || 'Non renseigné'}</p>
                {purchase.supplier?.company && (
                  <p className="text-gray-700 text-xs mt-0.5">Entreprise: {purchase.supplier.company}</p>
                )}
                {purchase.supplier?.phone && (
                  <p className="text-red-600 text-xs font-medium">Téléphone: {purchase.supplier.phone}</p>
                )}
                {purchase.supplier?.email && <p className="text-gray-600 text-xs">{purchase.supplier.email}</p>}
              </div>
            </div>

            {/* META INFO */}
            <div className="grid grid-cols-2 gap-4 mb-7">
              <div className="space-y-1.5">
                <div className="flex items-center bg-gray-100 px-3 py-2 rounded-sm gap-2">
                  <span className="text-xs font-semibold text-gray-700 w-28 shrink-0">N° Facture :</span>
                  <span className="text-xs font-bold text-red-900">{purchase.purchaseNumber}</span>
                </div>
                {purchase.bankAccount && (
                  <div className="flex items-center bg-gray-100 px-3 py-2 rounded-sm gap-2">
                    <span className="text-xs font-semibold text-gray-700 w-28 shrink-0">Compte :</span>
                    <span className="text-xs text-gray-800">{purchase.bankAccount.name}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center bg-gray-100 px-3 py-2 rounded-sm gap-2">
                  <span className="text-xs font-semibold text-gray-700 w-36 shrink-0">Date :</span>
                  <span className="text-xs text-gray-800">{new Date(purchase.date).toLocaleDateString('fr-FR')}</span>
                </div>
                {purchase.dueDate && (
                  <div className="flex items-center bg-gray-100 px-3 py-2 rounded-sm gap-2">
                    <span className="text-xs font-semibold text-gray-700 w-36 shrink-0">Échéance :</span>
                    <span className="text-xs text-gray-800">{new Date(purchase.dueDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ITEMS TABLE */}
            <div className="mb-6">
              <table className="w-full border-collapse" style={{ borderColor: '#d1d5db' }}>
                <thead>
                  <tr style={{ backgroundColor: '#7f1d1d' }} className="text-white">
                    <th className="text-center p-2.5 border border-gray-300 text-xs font-semibold w-8">#</th>
                    <th className="text-left p-2.5 border border-gray-300 text-xs font-semibold">Description</th>
                    <th className="text-center p-2.5 border border-gray-300 text-xs font-semibold w-20">Quantité</th>
                    <th className="text-right p-2.5 border border-gray-300 text-xs font-semibold w-28">Prix unitaire</th>
                    <th className="text-right p-2.5 border border-gray-300 text-xs font-semibold w-24">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {purchase.items?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="p-2.5 border border-gray-300 text-xs text-center text-gray-700">{index + 1}</td>
                      <td className="p-2.5 border border-gray-300 text-xs font-medium text-gray-800">{item.description}</td>
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

            {/* TOTALS */}
            <div className="flex justify-end mb-8">
              <div className="w-80">
                <div className="flex justify-between py-2 px-4 border border-gray-200">
                  <span className="text-xs text-gray-700">Sous-total HT</span>
                  <span className="text-xs font-semibold text-gray-800">{formatXAF(purchase.subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 px-4 border border-gray-200">
                  <span className="text-xs text-gray-700">TVA ({purchase.taxRate}%)</span>
                  <span className="text-xs font-semibold text-gray-800">{formatXAF(purchase.taxAmount)}</span>
                </div>
                <div
                  className="flex justify-between py-3 px-4 mt-0.5 text-white"
                  style={{ backgroundColor: '#7f1d1d' }}
                >
                  <span className="text-sm font-bold uppercase tracking-wide">TOTAL TTC</span>
                  <span className="text-base font-extrabold">{formatXAF(purchase.total)}</span>
                </div>
              </div>
            </div>

            {/* NOTES */}
            {purchase.notes && (
              <div className="mb-8">
                <div className="h-px bg-red-600 mb-4" />
                <h3 className="font-bold text-sm mb-2 text-red-900 uppercase tracking-wide">NOTES</h3>
                <p className="text-xs text-gray-600 whitespace-pre-line">{purchase.notes}</p>
              </div>
            )}

            {/* PAYMENT INFO */}
            {purchase.status === 'paid' && purchase.paymentDate && (
              <div className="mb-8">
                <div className="h-px bg-red-600 mb-4" />
                <h3 className="font-bold text-sm mb-3 text-red-900 uppercase tracking-wide">
                  INFORMATIONS DE PAIEMENT
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-sm">
                    <p className="font-semibold text-xs mb-1 text-green-900">Date de paiement</p>
                    <p className="text-xs text-green-800">{new Date(purchase.paymentDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                  {purchase.paymentMethod && (
                    <div className="bg-green-50 p-3 rounded-sm">
                      <p className="font-semibold text-xs mb-1 text-green-900">Méthode de paiement</p>
                      <p className="text-xs text-green-800">{purchase.paymentMethod}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ATTACHMENT INFO */}
            {purchase.attachment && purchase.attachmentName && (
              <div className="mb-8">
                <div className="h-px bg-red-600 mb-4" />
                <h3 className="font-bold text-sm mb-3 text-red-900 uppercase tracking-wide">
                  PIÈCE JOINTE
                </h3>
                <div className="bg-gray-50 p-3 rounded-sm border border-gray-200">
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">Fichier joint :</span> {purchase.attachmentName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Utilisez le bouton "Télécharger la pièce jointe" en haut de la page pour accéder au fichier.
                  </p>
                </div>
              </div>
            )}

            {/* SIGNATURES */}
            <div className="grid grid-cols-2 gap-12 mt-14">
              <div>
                <p className="font-semibold text-xs mb-1 text-gray-800">
                  Signature / Cachet Fournisseur
                </p>
                <div className="mt-16 border-t border-gray-400 pt-2">
                  <p className="text-xs text-gray-500">Nom &amp; Qualité : ___________________________</p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-xs mb-1 text-gray-800">
                  Bon pour accord — {companyInfo.name || 'Acheteur'}
                </p>
                <div className="mt-16 border-t border-gray-400 pt-2">
                  <p className="text-xs text-gray-500">Nom &amp; Qualité : ___________________________</p>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-10 pt-4 border-t border-gray-300">
              <p className="text-center text-sm text-red-900 font-medium italic mb-3">
                Document comptable — À conserver
              </p>
              <div
                className="flex items-center justify-center gap-4 py-2 px-4 rounded-sm"
                style={{ backgroundColor: '#7f1d1d' }}
              >
                {companyInfo.email && (
                  <div className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span className="text-white text-xs">{companyInfo.email}</span>
                  </div>
                )}
                {companyInfo.phone && (
                  <div className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.13 6.13l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span className="text-white text-xs">{companyInfo.phone}</span>
                  </div>
                )}
                {companyInfo.city && (
                  <div className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-white text-xs">{companyInfo.city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
