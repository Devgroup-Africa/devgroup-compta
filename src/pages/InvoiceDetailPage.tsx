import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Trash2, Send, Download, Mail, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import InvoiceForm from "@/components/forms/InvoiceForm";
import InvoiceTemplate from "@/components/invoice/InvoiceTemplate";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CancelInvoiceDialog } from "@/components/CancelInvoiceDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  price?: number; // For backward compatibility
  total: number;
}

interface Invoice {
  _id: string;
  number: string;
  clientId: string;
  client?: {
    _id?: string;
    name: string;
    company: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
    };
    taxNumber?: string;
  };
  bankAccount?: {
    _id: string;
    name: string;
    accountNumber: string;
    bankName: string;
  } | string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidAmount: number;
  taxRate: number;
  discountRate: number;
  notes?: string;
  terms?: string;
  object?: string;
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
  companyInfo?: {
    name?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    registrationNumber?: string;
    taxNumber?: string;
  };
  cancelledBy?: {
    _id: string;
    name: string;
    email: string;
  };
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailData, setEmailData] = useState({
    recipientEmail: "",
    subject: "",
    message: ""
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  const loadInvoice = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await apiService.getInvoice(id);
      const data = response as { data?: { invoice?: Invoice } | Invoice };
      const invoiceData = (data.data && 'invoice' in data.data) ? data.data.invoice : data.data;
      setInvoice(invoiceData as Invoice);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de charger la facture";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      navigate("/factures");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const handleDelete = async () => {
    if (!invoice) return;

    try {
      await apiService.deleteInvoice(invoice._id);
      toast({
        title: "Succès",
        description: "Facture supprimée avec succès",
      });
      navigate("/factures");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de supprimer la facture";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCancelInvoice = async (reason: string) => {
    if (!invoice) return;

    try {
      await apiService.cancelInvoice(invoice._id, reason);
      toast({
        title: "Facture annulée",
        description: `La facture ${invoice.number} a été annulée.`,
      });
      loadInvoice();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible d'annuler la facture";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice) return;

    try {
      await apiService.sendInvoice(invoice._id);
      toast({
        title: "Facture envoyée",
        description: `La facture ${invoice.number} a été envoyée au client.`,
      });
      loadInvoice();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible d'envoyer la facture.";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;

    try {
      await apiService.markInvoiceAsPaid(invoice._id);
      toast({
        title: "Facture payée",
        description: `La facture ${invoice.number} a été marquée comme payée.`,
      });
      loadInvoice();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de marquer la facture comme payée.";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleExport = async (format: 'pdf' | 'word' | 'excel' | 'jpeg') => {
    if (!invoice) return;

    try {
      let response;
      switch (format) {
        case 'pdf':
          response = await apiService.exportInvoicePDF(invoice._id);
          break;
        case 'word':
          response = await apiService.exportInvoiceWord(invoice._id);
          break;
        case 'excel':
          response = await apiService.exportInvoiceExcel(invoice._id);
          break;
        case 'jpeg':
          response = await apiService.exportInvoiceJPEG(invoice._id);
          break;
      }
      
      // Handle blob response for file download
      if (response.data && response.data instanceof Blob) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Set filename based on format
        const extension = format === 'word' ? 'docx' : format === 'excel' ? 'xlsx' : format === 'jpeg' ? 'jpg' : format;
        link.download = `facture-${invoice.number}.${extension}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Export réussi",
          description: `La facture a été exportée en ${format.toUpperCase()}`,
        });
      } else {
        // Fallback for non-blob responses
        const data = response as { data?: { message?: string } };
        toast({
          title: "Export en cours",
          description: data.data?.message || `Export ${format.toUpperCase()} en cours de développement`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible d'exporter la facture";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async () => {
    if (!invoice) return;

    setSendingEmail(true);
    try {
      await apiService.sendInvoiceByEmail(invoice._id, emailData);
      toast({
        title: "Email envoyé",
        description: `La facture a été envoyée à ${emailData.recipientEmail}`,
      });
      setShowEmailDialog(false);
      setEmailData({ recipientEmail: "", subject: "", message: "" });
      loadInvoice();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible d'envoyer l'email";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const openEmailDialog = () => {
    setEmailData({
      recipientEmail: invoice?.client?.email || "",
      subject: `Facture ${invoice?.number}`,
      message: `Bonjour,\n\nVeuillez trouver ci-joint la facture ${invoice?.number}.\n\nCordialement`
    });
    setShowEmailDialog(true);
  };

  const handleFormSuccess = () => {
    setShowEditForm(false);
    loadInvoice();
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

  if (!invoice) {
    return null;
  }

  if (showEditForm) {
    // Transform invoice data for the form
    const invoiceForForm = {
      ...invoice,
      bankAccountId: invoice.bankAccount?._id || invoice.bankAccount,
      clientId: invoice.client?._id || invoice.clientId
    };
    
    return (
      <div className="space-y-6">
        <InvoiceForm
          invoice={invoiceForForm}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowEditForm(false)}
        />
      </div>
    );
  }

  const paidPercent = invoice.total > 0 ? Math.round((invoice.paidAmount / invoice.total) * 100) : 0;

  console.log('Invoice status:', invoice.status, 'Is cancelled:', invoice.status === "cancelled");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/factures")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{invoice.number}</h1>
            <p className="text-sm text-gray-600">Détails de la facture</p>
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Exporter en PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('word')}>
                Exporter en Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                Exporter en Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('jpeg')}>
                Exporter en JPEG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            onClick={openEmailDialog}
          >
            <Mail className="w-4 h-4 mr-2" />
            Envoyer par email
          </Button>
          
          {invoice.status === "draft" && (
            <Button
              variant="outline"
              onClick={handleSendInvoice}
            >
              <Send className="w-4 h-4 mr-2" />
              Marquer comme envoyée
            </Button>
          )}
          
          {(invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "partial") && (
            <Button
              variant="outline"
              onClick={handleMarkAsPaid}
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Marquer comme payée
            </Button>
          )}
          
          {invoice.status !== "cancelled" && (
            <Button
              variant="outline"
              onClick={() => setShowEditForm(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          )}
          
          {invoice.status === "draft" && (
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          )}
          
          {invoice.status === "cancelled" && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer définitivement
            </Button>
          )}
          
          {(invoice.status === "sent" || invoice.status === "paid" || invoice.status === "overdue" || invoice.status === "partial") && (
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          )}
        </div>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu de la facture</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceTemplate invoice={invoice} />
        </CardContent>
      </Card>

      {/* Cancellation Metadata Display */}
      {invoice.status === "cancelled" && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Facture annulée
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoice.cancelledBy && (
              <div>
                <Label className="text-sm font-medium text-red-900">Annulée par</Label>
                <p className="text-sm text-red-800">
                  {invoice.cancelledBy.name} ({invoice.cancelledBy.email})
                </p>
              </div>
            )}
            {invoice.cancelledAt && (
              <div>
                <Label className="text-sm font-medium text-red-900">Date d'annulation</Label>
                <p className="text-sm text-red-800">
                  {new Date(invoice.cancelledAt).toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
            {invoice.cancellationReason && (
              <div>
                <Label className="text-sm font-medium text-red-900">Raison de l'annulation</Label>
                <p className="text-sm text-red-800">{invoice.cancellationReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Envoyer la facture par email</DialogTitle>
            <DialogDescription>
              Envoyez la facture {invoice.number} par email au client
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email du destinataire</Label>
              <Input
                id="email"
                type="email"
                value={emailData.recipientEmail}
                onChange={(e) => setEmailData({ ...emailData, recipientEmail: e.target.value })}
                placeholder="client@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Objet</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                placeholder="Facture..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                placeholder="Votre message..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSendEmail} disabled={sendingEmail || !emailData.recipientEmail}>
              {sendingEmail ? "Envoi..." : "Envoyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {invoice.status === "cancelled" ? "Supprimer définitivement la facture" : "Supprimer la facture"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {invoice.status === "cancelled" ? (
                <>
                  Êtes-vous sûr de vouloir supprimer définitivement la facture {invoice.number} ? 
                  Cette facture annulée sera supprimée de la base de données. Cette action est irréversible.
                </>
              ) : (
                <>
                  Êtes-vous sûr de vouloir supprimer la facture {invoice.number} ? 
                  Cette action est irréversible.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {invoice.status === "cancelled" ? "Supprimer définitivement" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invoice Dialog */}
      <CancelInvoiceDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelInvoice}
        invoiceNumber={invoice.number}
      />
    </div>
  );
};

export default InvoiceDetailPage;
