import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { useError } from '@/contexts/ErrorContext';
import api from '@/services/api';
import { Plus, Search, FileText, Download, TrendingDown, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatXAF } from '@/data/mockData';

interface Purchase {
  _id: string;
  purchaseNumber: string;
  supplier: {
    _id: string;
    name: string;
    company?: string;
  };
  date: string;
  dueDate?: string;
  total: number;
  status: 'draft' | 'pending' | 'paid' | 'cancelled';
  bankAccount?: {
    _id: string;
    name: string;
  };
}

export default function PurchasesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showError } = useError();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadPurchases();
  }, [statusFilter]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const response = await api.getPurchases({ status: statusFilter || undefined });
      setPurchases(response.data || []);
    } catch (error: any) {
      console.error('Error loading purchases:', error);
      showError(error.message || 'Impossible de charger les factures fournisseurs');
    } finally {
      setLoading(false);
    }
  };

  const handleExportList = async () => {
    try {
      setExporting(true);
      const response = await api.exportPurchasesListExcel({ status: statusFilter || undefined });
      
      if (response.data && response.data instanceof Blob) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Factures_Fournisseurs.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: 'Export réussi',
          description: 'Liste des factures exportée en Excel'
        });
      }
    } catch (error: any) {
      console.error('Error exporting purchases:', error);
      showError(error.message || 'Impossible d\'exporter la liste');
    } finally {
      setExporting(false);
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

  const filteredPurchases = purchases.filter(purchase =>
    purchase.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplier.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: purchases.length,
    draft: purchases.filter(p => p.status === 'draft').length,
    pending: purchases.filter(p => p.status === 'pending').length,
    paid: purchases.filter(p => p.status === 'paid').length,
    totalAmount: purchases.reduce((sum, p) => sum + p.total, 0),
    paidAmount: purchases
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.total, 0),
    pendingAmount: purchases
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.total, 0)
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factures Fournisseurs"
        description="Gestion des achats et paiements fournisseurs"
      >
        <Button variant="outline" onClick={handleExportList} disabled={exporting}>
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Export...' : 'Exporter la liste'}
        </Button>
        <Button onClick={() => navigate('/achats/creer')}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle facture
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{stats.total}</p>
          <p className="text-xs text-gray-500 font-medium">Total factures</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{stats.pending}</p>
          <p className="text-xs text-gray-500 font-medium">En attente</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{formatXAF(stats.paidAmount)}</p>
          <p className="text-xs text-gray-500 font-medium">Montant payé</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{formatXAF(stats.pendingAmount)}</p>
          <p className="text-xs text-gray-500 font-medium">À payer</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2 bg-white"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="pending">En attente</option>
            <option value="paid">Payée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Compte</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  Aucune facture fournisseur trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchases.map((purchase) => (
                <TableRow
                  key={purchase._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/achats/${purchase._id}`)}
                >
                  <TableCell className="font-medium">{purchase.purchaseNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{purchase.supplier.name}</div>
                      {purchase.supplier.company && (
                        <div className="text-sm text-muted-foreground">{purchase.supplier.company}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(purchase.date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    {purchase.dueDate ? new Date(purchase.dueDate).toLocaleDateString('fr-FR') : '-'}
                  </TableCell>
                  <TableCell className="font-medium">{purchase.total.toLocaleString()} FCFA</TableCell>
                  <TableCell>{purchase.bankAccount?.name || '-'}</TableCell>
                  <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/achats/${purchase._id}`);
                      }}
                    >
                      Voir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
