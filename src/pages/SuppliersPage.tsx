import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import SupplierForm from "@/components/forms/SupplierForm";
import ContextualSidebar from "@/components/ContextualSidebar";
import { formatXAF } from "@/data/mockData";
import { Mail, Phone, Edit, Trash2, Search, Building2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import apiService from "@/services/api";

interface Supplier {
  _id: string;
  name: string;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const SuppliersPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getSuppliers({ search: searchTerm });
      // Handle the nested response structure from backend
      const responseData = response.data as { suppliers?: Supplier[] } | Supplier[];
      const suppliersData = Array.isArray(responseData) ? responseData : (responseData?.suppliers || []);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de charger les fournisseurs.";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      setSuppliers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [searchTerm, toast]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleDelete = async () => {
    if (!deletingSupplier) return;

    try {
      await apiService.deleteSupplier(deletingSupplier._id);
      toast({
        title: "Fournisseur supprimé",
        description: `${deletingSupplier.name} a été supprimé avec succès.`
      });
      setDeletingSupplier(null);
      loadSuppliers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de supprimer le fournisseur.";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSupplier(null);
    loadSuppliers();
  };

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setShowForm(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const filteredSuppliers = Array.isArray(suppliers) ? suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const stats = {
    total: Array.isArray(suppliers) ? suppliers.length : 0,
    active: Array.isArray(suppliers) ? suppliers.filter(s => s.isActive).length : 0,
    inactive: Array.isArray(suppliers) ? suppliers.filter(s => !s.isActive).length : 0
  };

  // If form is shown, display only the form
  if (showForm) {
    return (
      <div className="space-y-6">
        <SupplierForm
          supplier={editingSupplier ? {
            _id: editingSupplier._id,
            name: editingSupplier.name,
            email: editingSupplier.email || "",
            phone: editingSupplier.phone || "",
            company: editingSupplier.company || "",
            address: {
              street: editingSupplier.address?.street || "",
              city: editingSupplier.address?.city || "",
              country: editingSupplier.address?.country || "Cameroun"
            },
            paymentTerms: editingSupplier.paymentTerms || 30,
            taxNumber: editingSupplier.taxNumber || "",
            bankDetails: {
              bankName: editingSupplier.bankDetails?.bankName || "",
              accountNumber: editingSupplier.bankDetails?.accountNumber || "",
              iban: editingSupplier.bankDetails?.iban || ""
            }
          } : undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 space-y-6">
        <PageHeader title="Fournisseurs" description="Gestion des fournisseurs et règlements">
          <Button onClick={handleCreateSupplier}>
            <Building2 className="w-4 h-4 mr-2" />
            Nouveau fournisseur
          </Button>
        </PageHeader>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total fournisseurs</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Actifs</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{stats.inactive}</p>
              <p className="text-sm text-muted-foreground">Inactifs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher un fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-muted"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded mb-1"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            {searchTerm ? "Aucun fournisseur trouvé" : "Aucun fournisseur"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Essayez avec d'autres termes de recherche." : "Commencez par créer votre premier fournisseur."}
          </p>
          {!searchTerm && (
            <Button onClick={handleCreateSupplier}>
              <Building2 className="w-4 h-4 mr-2" />
              Nouveau fournisseur
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier._id} className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-warning/8 flex items-center justify-center text-warning font-bold text-sm border border-warning/10">
                  {supplier.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-sm text-card-foreground">{supplier.name}</h3>
                  <p className="text-xs text-muted-foreground">{supplier.company || "Entreprise non renseignée"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/fournisseurs/${supplier._id}`)}
                    className="h-8 w-8 p-0"
                    title="Voir les détails"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditSupplier(supplier)}
                    className="h-8 w-8 p-0"
                    title="Modifier"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeletingSupplier(supplier)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 text-xs text-muted-foreground mb-4">
                {supplier.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Délai paiement:</span>
                  <span className="font-medium">{supplier.paymentTerms || 30} jours</span>
                </div>
                {supplier.taxNumber && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-muted-foreground">N° fiscal:</span>
                    <span className="font-medium">{supplier.taxNumber}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSupplier} onOpenChange={() => setDeletingSupplier(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le fournisseur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {deletingSupplier?.name} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    
    {/* Temporairement désactivé */}
    {/* <ContextualSidebar 
      type="suppliers" 
      stats={{
        total: stats.total,
        actifs: stats.active,
        inactifs: stats.inactive
      }}
    /> */}
  </div>
  );
};

export default SuppliersPage;
