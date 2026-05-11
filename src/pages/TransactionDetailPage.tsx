import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Calendar,
  FileText,
  Hash,
  User,
  Trash2,
  Edit,
  ExternalLink,
} from "lucide-react";
import { useError } from "@/contexts/ErrorContext";
import { useApiError } from "@/hooks/use-api-error";
import apiService from "@/services/api";
import { formatXAF } from "@/data/mockData";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Transaction {
  _id: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  status: string;
  account?: {
    _id: string;
    name: string;
    code: string;
  };
  bankAccount?: {
    _id: string;
    name: string;
  };
  invoice?: {
    _id: string;
    invoiceNumber: string;
    client: {
      name: string;
    };
  };
  purchase?: {
    _id: string;
    purchaseNumber: string;
    supplier: {
      name: string;
    };
  };
  reference?: string;
  notes?: string;
  createdBy?: {
    _id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const TransactionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess } = useError();
  const { handleApiError } = useApiError();
  
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (id) {
      loadTransaction();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTransaction = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTransactionById(id!);
      const data = response.data as { transaction?: Transaction };
      setTransaction(data.transaction || null);
    } catch (error) {
      handleApiError(error);
      navigate("/transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setConfirmDialog({
      open: true,
      title: "Supprimer la transaction",
      description: "Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible et affectera le solde du compte bancaire.",
      onConfirm: async () => {
        try {
          await apiService.deleteTransaction(id!);
          setConfirmDialog({ ...confirmDialog, open: false });
          showSuccess("Transaction supprimée avec succès");
          navigate("/transactions");
        } catch (error) {
          setConfirmDialog({ ...confirmDialog, open: false });
          handleApiError(error);
        }
      },
    });
  };

  const handleEdit = () => {
    // Navigate to transactions page with edit mode
    navigate("/transactions", { state: { editTransaction: transaction } });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Chargement..."
          description="Chargement des détails de la transaction"
        />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Transaction introuvable"
          description="La transaction demandée n'existe pas"
        />
        <Button onClick={() => navigate("/transactions")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux transactions
        </Button>
      </div>
    );
  }

  const isIncome = transaction.type === "income";
  const amountColor = isIncome ? "text-green-600" : "text-red-600";
  const amountIcon = isIncome ? (
    <ArrowUpRight className="h-5 w-5 text-green-600" />
  ) : (
    <ArrowDownRight className="h-5 w-5 text-red-600" />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Transaction ${transaction.reference || transaction._id.slice(-6)}`}
        description={`Détails de la transaction ${isIncome ? "d'entrée" : "de sortie"}`}
      >
        <div className="flex gap-2">
          {transaction.status === "confirmed" && (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => navigate("/transactions")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {amountIcon}
                Montant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${amountColor}`}>
                {isIncome ? "+" : "-"} {formatXAF(transaction.amount)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {isIncome ? "Entrée d'argent" : "Sortie d'argent"}
              </p>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de la transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-base">{transaction.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Catégorie</p>
                  <Badge variant="secondary">{transaction.category}</Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                    <p className="text-base">
                      {new Date(transaction.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {transaction.reference && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Référence</p>
                      <p className="text-base font-mono">{transaction.reference}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bank Account */}
          {transaction.bankAccount && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Compte bancaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium">{transaction.bankAccount.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ID: {transaction.bankAccount._id}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/compte/${transaction.bankAccount?._id}`)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Voir le compte
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Linked Invoice */}
          {transaction.invoice && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Facture liée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium">
                      Facture {transaction.invoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Client: {transaction.invoice.client.name}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/factures/${transaction.invoice?._id}`)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Voir la facture
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Linked Purchase */}
          {transaction.purchase && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Achat lié
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium">
                      Achat {transaction.purchase.purchaseNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fournisseur: {transaction.purchase.supplier.name}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/achats/${transaction.purchase?._id}`)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Voir l'achat
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {transaction.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base whitespace-pre-wrap">{transaction.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Accounting Account */}
          {transaction.account && (
            <Card>
              <CardHeader>
                <CardTitle>Compte comptable</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-base font-medium">{transaction.account.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    Code: {transaction.account.code}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statut</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={transaction.status === "confirmed" ? "default" : "secondary"}
                className="text-sm"
              >
                {transaction.status === "confirmed" ? "Confirmée" : transaction.status}
              </Badge>
            </CardContent>
          </Card>

          {/* Type Card */}
          <Card>
            <CardHeader>
              <CardTitle>Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={isIncome ? "default" : "destructive"}
                className="text-sm"
              >
                {isIncome ? "Entrée" : "Sortie"}
              </Badge>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {transaction.createdBy && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Créé par</p>
                    <p className="text-sm">{transaction.createdBy.name}</p>
                  </div>
                </div>
              )}
              {transaction.createdAt && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Créé le</p>
                    <p className="text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
              {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Modifié le</p>
                    <p className="text-sm">
                      {new Date(transaction.updatedAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {transaction.bankAccount && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`/compte/${transaction.bankAccount?._id}`)}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Voir le compte
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/tresorerie")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la trésorerie
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
};

export default TransactionDetailPage;
