import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building2, MapPin, CreditCard, Calendar, Landmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SupplierForm from "@/components/forms/SupplierForm";

interface Supplier {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  paymentTerms?: number;
  taxNumber?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    iban?: string;
    swiftCode?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const SupplierDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const loadSupplier = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await apiService.getSupplier(id);
      setSupplier((response.data?.supplier || response.data) as Supplier);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de charger le fournisseur";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      navigate("/fournisseurs");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    loadSupplier();
  }, [loadSupplier]);

  const handleDelete = async () => {
    if (!supplier) return;

    try {
      await apiService.deleteSupplier(supplier._id);
      toast({
        title: "Succès",
        description: "Fournisseur supprimé avec succès",
      });
      navigate("/fournisseurs");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de supprimer le fournisseur";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setShowEditForm(false);
    loadSupplier();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return null;
  }

  if (showEditForm) {
    return (
      <div className="space-y-6">
        <SupplierForm
          supplier={supplier ? {
            _id: supplier._id,
            name: supplier.name,
            email: supplier.email || "",
            phone: supplier.phone || "",
            company: supplier.company || "",
            address: {
              street: supplier.address?.street || "",
              city: supplier.address?.city || "",
              country: supplier.address?.country || "Cameroun"
            },
            paymentTerms: supplier.paymentTerms || 30,
            taxNumber: supplier.taxNumber || "",
            bankDetails: {
              bankName: supplier.bankDetails?.bankName || "",
              accountNumber: supplier.bankDetails?.accountNumber || "",
              iban: supplier.bankDetails?.iban || ""
            }
          } : undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowEditForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/fournisseurs")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{supplier.name}</h1>
            <p className="text-sm text-gray-600">Détails du fournisseur</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowEditForm(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-warning" />
              </div>
              <div>
                <CardTitle>{supplier.name}</CardTitle>
                {supplier.company && (
                  <p className="text-sm text-gray-600">{supplier.company}</p>
                )}
              </div>
            </div>
            <Badge variant={supplier.isActive ? "default" : "secondary"}>
              {supplier.isActive ? "Actif" : "Inactif"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-500 uppercase">Informations de contact</h3>
              
              {supplier.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{supplier.email}</p>
                  </div>
                </div>
              )}
              
              {supplier.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium">{supplier.phone}</p>
                  </div>
                </div>
              )}

              {supplier.address && (supplier.address.street || supplier.address.city) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Adresse</p>
                    <p className="font-medium">
                      {supplier.address.street && <>{supplier.address.street}<br /></>}
                      {supplier.address.postalCode} {supplier.address.city}
                      {supplier.address.country && <>, {supplier.address.country}</>}
                    </p>
                  </div>
                </div>
              )}

              {supplier.taxNumber && (
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Numéro fiscal</p>
                    <p className="font-medium">{supplier.taxNumber}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-500 uppercase">Informations de paiement</h3>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Délai de paiement</p>
                  <p className="font-medium">{supplier.paymentTerms || 30} jours</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      {supplier.bankDetails && (supplier.bankDetails.bankName || supplier.bankDetails.accountNumber || supplier.bankDetails.iban) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="w-5 h-5" />
              Coordonnées bancaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supplier.bankDetails.bankName && (
                <div>
                  <p className="text-sm text-gray-600">Banque</p>
                  <p className="font-medium">{supplier.bankDetails.bankName}</p>
                </div>
              )}
              
              {supplier.bankDetails.accountNumber && (
                <div>
                  <p className="text-sm text-gray-600">Numéro de compte</p>
                  <p className="font-medium">{supplier.bankDetails.accountNumber}</p>
                </div>
              )}
              
              {supplier.bankDetails.iban && (
                <div>
                  <p className="text-sm text-gray-600">IBAN</p>
                  <p className="font-medium">{supplier.bankDetails.iban}</p>
                </div>
              )}
              
              {supplier.bankDetails.swiftCode && (
                <div>
                  <p className="text-sm text-gray-600">Code SWIFT</p>
                  <p className="font-medium">{supplier.bankDetails.swiftCode}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le fournisseur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le fournisseur "{supplier.name}" ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SupplierDetailPage;
