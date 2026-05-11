import { useState, useEffect, useCallback, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import InvoiceForm from "@/components/forms/InvoiceForm";
import ContextualSidebar from "@/components/ContextualSidebar";
import { formatXAF } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Search, Edit, Trash2, Send, FileText, Eye, Download,
  Mail, CheckCircle, ChevronLeft, ChevronRight, ArrowUpDown,
  ArrowUp, ArrowDown, ChevronsLeft, ChevronsRight,
  TrendingUp, Clock, AlertCircle, LayoutGrid, List, XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import apiService from "@/services/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EmailDialog from "@/components/EmailDialog";
import { CancelInvoiceDialog } from "@/components/CancelInvoiceDialog";

interface Invoice {
  _id: string;
  number: string;
  clientId: string;
  client?: { name: string; company: string; email?: string; };
  items: Array<{ description: string; quantity: number; price?: number; unitPrice?: number; }>;
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
  createdAt: string;
  updatedAt: string;
}

type SortField = "number" | "client" | "total" | "issueDate" | "dueDate" | "status";
type SortDir = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  draft:     { label: "Brouillon",           color: "text-slate-600",  bg: "bg-slate-100",  dot: "bg-slate-400" },
  sent:      { label: "Envoyée",             color: "text-blue-700",   bg: "bg-blue-50",    dot: "bg-blue-500" },
  paid:      { label: "Payée",               color: "text-emerald-700",bg: "bg-emerald-50", dot: "bg-emerald-500" },
  partial:   { label: "Partiellement payée", color: "text-amber-700",  bg: "bg-amber-50",   dot: "bg-amber-400" },
  overdue:   { label: "En retard",           color: "text-red-700",    bg: "bg-red-50",     dot: "bg-red-500" },
  cancelled: { label: "Annulée",             color: "text-gray-600",   bg: "bg-gray-100",   dot: "bg-gray-500" },
};

const StatusPill = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "text-gray-600", bg: "bg-gray-100", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const SortIcon = ({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) => {
  if (field !== sortField) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  return sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />;
};

const StatCard = ({ icon: Icon, value, label, iconBg, iconColor, trend }: {
  icon: any; value: string; label: string; iconBg: string; iconColor: string; trend?: string;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      {trend && (
        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
          <TrendingUp className="w-2.5 h-2.5" /> {trend}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</p>
    <p className="text-xs text-gray-500 font-medium">{label}</p>
  </div>
);

const InvoicesPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [cancellingInvoice, setCancellingInvoice] = useState<Invoice | null>(null);
  const [emailingInvoice, setEmailingInvoice] = useState<Invoice | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Sort & Pagination
  const [sortField, setSortField] = useState<SortField>("issueDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const response = await apiService.getInvoices(params);
      const data = (response.data as { invoices?: Invoice[] })?.invoices || response.data || [];
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Impossible de charger les factures.";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, sortField, sortDir, pageSize]);

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let list = Array.isArray(invoices) ? [...invoices] : [];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(i =>
        i.number?.toLowerCase().includes(q) ||
        i.client?.name?.toLowerCase().includes(q) ||
        i.client?.company?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") list = list.filter(i => i.status === statusFilter);

    list.sort((a, b) => {
      let va: any, vb: any;
      switch (sortField) {
        case "number": va = a.number; vb = b.number; break;
        case "client": va = a.client?.name || ""; vb = b.client?.name || ""; break;
        case "total": va = a.total; vb = b.total; break;
        case "issueDate": va = new Date(a.issueDate).getTime(); vb = new Date(b.issueDate).getTime(); break;
        case "dueDate": va = new Date(a.dueDate).getTime(); vb = new Date(b.dueDate).getTime(); break;
        case "status": va = a.status; vb = b.status; break;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [invoices, searchTerm, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = useMemo(() => {
    const all = Array.isArray(invoices) ? invoices : [];
    // Exclude cancelled invoices from revenue calculations
    const activeInvoices = all.filter(i => i.status !== "cancelled");
    return {
      total: all.length,
      draft: all.filter(i => i.status === "draft").length,
      sent: all.filter(i => i.status === "sent").length,
      paid: all.filter(i => i.status === "paid").length,
      overdue: all.filter(i => i.status === "overdue").length,
      totalAmount: activeInvoices.reduce((s, i) => s + (i.total || 0), 0),
      paidAmount: activeInvoices.reduce((s, i) => s + (i.paidAmount || 0), 0),
    };
  }, [invoices]);

  const handleDelete = async () => {
    if (!deletingInvoice) return;
    try {
      await apiService.deleteInvoice(deletingInvoice._id);
      toast({ title: "Facture supprimée", description: `La facture ${deletingInvoice.number} a été supprimée.` });
      setDeletingInvoice(null);
      loadInvoices();
    } catch (error) {
      toast({ title: "Erreur", description: error instanceof Error ? error.message : "Erreur", variant: "destructive" });
    }
  };

  const handleCancelInvoice = async (reason: string) => {
    if (!cancellingInvoice) return;
    try {
      await apiService.cancelInvoice(cancellingInvoice._id, reason);
      toast({ title: "Facture annulée", description: `La facture ${cancellingInvoice.number} a été annulée.` });
      setCancellingInvoice(null);
      loadInvoices();
    } catch (error) {
      toast({ title: "Erreur", description: error instanceof Error ? error.message : "Erreur", variant: "destructive" });
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      await apiService.sendInvoice(invoice._id);
      toast({ title: "Facture envoyée", description: `La facture ${invoice.number} a été envoyée.` });
      loadInvoices();
    } catch (error) {
      toast({ title: "Erreur", description: error instanceof Error ? error.message : "Erreur", variant: "destructive" });
    }
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      await apiService.markInvoiceAsPaid(invoice._id);
      toast({ title: "Facture payée", description: `La facture ${invoice.number} est marquée comme payée.` });
      loadInvoices();
    } catch (error) {
      toast({ title: "Erreur", description: error instanceof Error ? error.message : "Erreur", variant: "destructive" });
    }
  };

  const handleExport = async (invoice: Invoice, format: 'pdf' | 'word' | 'excel') => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/invoices/${invoice._id}/export/${format}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Erreur export ${format.toUpperCase()}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture_${invoice.number}.${format === 'word' ? 'docx' : format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ title: "Export réussi", description: `Facture ${invoice.number} exportée.` });
    } catch (error) {
      toast({ title: "Erreur", description: error instanceof Error ? error.message : "Erreur", variant: "destructive" });
    }
  };

  const handleEmailSend = async (emailData: { recipientEmail: string; subject: string; message: string }) => {
    if (!emailingInvoice) return;
    try {
      await apiService.sendInvoiceByEmail(emailingInvoice._id, emailData);
      toast({ title: "Email envoyé", description: `Facture ${emailingInvoice.number} envoyée par email.` });
      setEmailingInvoice(null);
      loadInvoices();
    } catch (error) {
      toast({ title: "Erreur", description: error instanceof Error ? error.message : "Erreur", variant: "destructive" });
      throw error;
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <InvoiceForm
          invoice={editingInvoice ? {
            _id: editingInvoice._id,
            clientId: editingInvoice.clientId,
            items: editingInvoice.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.price,
              total: item.quantity * (item.price || 0)
            })),
            taxRate: editingInvoice.taxRate,
            discountRate: editingInvoice.discountRate,
            issueDate: editingInvoice.issueDate,
            dueDate: editingInvoice.dueDate,
            notes: editingInvoice.notes || "",
            terms: editingInvoice.terms || ""
          } : undefined}
          onSuccess={() => { setShowForm(false); setEditingInvoice(null); loadInvoices(); }}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  const ThCol = ({ field, children, className = "" }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <th
      className={`py-3 px-4 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-blue-600 transition-colors group ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </div>
    </th>
  );

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <div className="flex-1 space-y-5 p-1">
        <PageHeader
          title="Factures"
          description="Gestion des factures clients avec suivi TVA et paiements"
        >
          <Button
            onClick={() => { setEditingInvoice(null); setShowForm(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 gap-2 px-5"
          >
            <FileText className="w-4 h-4" />
            Nouvelle facture
          </Button>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FileText} value={String(stats.total)} label="Total factures" iconBg="bg-blue-50" iconColor="text-blue-600" />
          <StatCard icon={Clock} value={String(stats.draft + stats.sent)} label="En attente" iconBg="bg-amber-50" iconColor="text-amber-600" />
          <StatCard icon={TrendingUp} value={formatXAF(stats.paidAmount)} label="Encaissé" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
          <StatCard icon={AlertCircle} value={formatXAF(stats.totalAmount - stats.paidAmount)} label="À encaisser" iconBg="bg-red-50" iconColor="text-red-500" />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par N°, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 border-gray-200 bg-gray-50 focus:bg-white text-sm rounded-xl"
              />
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 h-9 border-gray-200 bg-gray-50 text-sm rounded-xl">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="sent">Envoyée</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="partial">Partiellement payée</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>

            {/* Page size */}
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-28 h-9 border-gray-200 bg-gray-50 text-sm rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(n => (
                  <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Results count */}
            <span className="text-xs text-gray-400 font-medium ml-auto">
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
            </span>

            {/* View toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-100 rounded w-40" />
                    <div className="h-4 bg-gray-100 rounded w-56" />
                  </div>
                  <div className="h-8 bg-gray-100 rounded w-28" />
                </div>
                <div className="h-24 bg-gray-100 rounded mb-3" />
                <div className="h-2 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              {searchTerm || statusFilter !== "all" ? "Aucune facture trouvée" : "Aucune facture"}
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              {searchTerm || statusFilter !== "all" ? "Modifiez vos critères de recherche." : "Créez votre première facture pour commencer."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => { setEditingInvoice(null); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <FileText className="w-4 h-4" /> Nouvelle facture
              </Button>
            )}
          </div>
        ) : viewMode === "list" ? (
          /* ── TABLE VIEW ── */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <ThCol field="number">N° Facture</ThCol>
                  <ThCol field="client">Client</ThCol>
                  <ThCol field="status">Statut</ThCol>
                  <ThCol field="issueDate">Date émission</ThCol>
                  <ThCol field="dueDate">Échéance</ThCol>
                  <ThCol field="total" className="text-right">Montant</ThCol>
                  <th className="py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((invoice, idx) => {
                  const paidPct = invoice.total > 0 ? Math.round((invoice.paidAmount / invoice.total) * 100) : 0;
                  const isOverdue = invoice.status === "overdue";
                  return (
                    <tr
                      key={invoice._id}
                      className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? "" : "bg-gray-50/30"} ${invoice.status === "cancelled" ? "opacity-60" : ""}`}
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-sm font-bold text-blue-700">{invoice.number}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-sm font-semibold text-gray-800">{invoice.client?.name}</p>
                        <p className="text-xs text-gray-400">{invoice.client?.company}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusPill status={invoice.status} />
                      </td>
                      <td className="py-3.5 px-4 text-sm text-gray-600">
                        {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-sm ${isOverdue ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                          {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <p className="text-sm font-bold text-gray-900">{formatXAF(invoice.total)}</p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <Progress value={paidPct} className="h-1 w-16" />
                          <span className="text-[10px] text-gray-400">{paidPct}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {invoice.status === "draft" && (
                            <Button size="sm" variant="ghost" onClick={() => handleSendInvoice(invoice)}
                              className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50 gap-1">
                              <Send className="w-3 h-3" /> Envoyer
                            </Button>
                          )}
                          {["sent", "overdue", "partial"].includes(invoice.status) && (
                            <Button size="sm" variant="ghost" onClick={() => handleMarkAsPaid(invoice)}
                              className="h-7 px-2 text-xs text-emerald-600 hover:bg-emerald-50 gap-1">
                              <CheckCircle className="w-3 h-3" /> Payée
                            </Button>
                          )}
                          {invoice.status !== "cancelled" && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setEmailingInvoice(invoice)}
                                className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                                <Mail className="w-3.5 h-3.5" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                                    <Download className="w-3.5 h-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem onClick={() => handleExport(invoice, 'pdf')}>📄 Exporter en PDF</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleExport(invoice, 'word')}>📝 Exporter en Word</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleExport(invoice, 'excel')}>📊 Exporter en Excel</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button size="sm" variant="ghost" onClick={() => navigate(`/factures/${invoice._id}`)}
                                className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              {invoice.status === "draft" && (
                                <Button size="sm" variant="ghost" onClick={() => { setEditingInvoice(invoice); setShowForm(true); }}
                                  className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </>
                          )}
                          {invoice.status === "draft" && (
                            <Button size="sm" variant="ghost" onClick={() => setDeletingInvoice(invoice)}
                              className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {["sent", "paid", "overdue", "partial"].includes(invoice.status) && (
                            <Button size="sm" variant="ghost" onClick={() => setCancellingInvoice(invoice)}
                              className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 gap-1">
                              <XCircle className="w-3 h-3" /> Annuler
                            </Button>
                          )}
                          {invoice.status === "cancelled" && (
                            <Button size="sm" variant="ghost" onClick={() => setDeletingInvoice(invoice)}
                              className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 gap-1">
                              <Trash2 className="w-3 h-3" /> Supprimer
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── GRID VIEW ── */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map(invoice => {
              const paidPct = invoice.total > 0 ? Math.round((invoice.paidAmount / invoice.total) * 100) : 0;
              return (
                <div key={invoice._id}
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group ${invoice.status === "cancelled" ? "opacity-60" : ""}`}>
                  {/* Card top accent */}
                  <div className={`h-1 w-full ${STATUS_CONFIG[invoice.status]?.dot.replace("bg-", "bg-") || "bg-gray-300"}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className={`font-mono text-sm font-bold text-blue-700 ${invoice.status === "cancelled" ? "line-through" : ""}`}>{invoice.number}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{invoice.client?.name}</p>
                      </div>
                      <StatusPill status={invoice.status} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{formatXAF(invoice.total)}</p>
                    <p className="text-xs text-gray-400 mb-4">
                      Émise: {new Date(invoice.issueDate).toLocaleDateString('fr-FR')} ·
                      Éch: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                    </p>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Paiement</span><span>{paidPct}%</span>
                      </div>
                      <Progress value={paidPct} className="h-1.5" />
                    </div>
                    <div className="flex items-center gap-1 pt-3 border-t border-gray-50">
                      {invoice.status === "draft" && (
                        <Button size="sm" variant="ghost" onClick={() => handleSendInvoice(invoice)}
                          className="h-7 flex-1 text-xs text-blue-600 hover:bg-blue-50 gap-1">
                          <Send className="w-3 h-3" /> Envoyer
                        </Button>
                      )}
                      {["sent", "overdue", "partial"].includes(invoice.status) && (
                        <Button size="sm" variant="ghost" onClick={() => handleMarkAsPaid(invoice)}
                          className="h-7 flex-1 text-xs text-emerald-600 hover:bg-emerald-50 gap-1">
                          <CheckCircle className="w-3 h-3" /> Payée
                        </Button>
                      )}
                      {invoice.status !== "cancelled" && (
                        <div className="flex items-center gap-1 ml-auto">
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/factures/${invoice._id}`)}
                            className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {invoice.status === "draft" && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => { setEditingInvoice(invoice); setShowForm(true); }}
                                className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setDeletingInvoice(invoice)}
                                className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          {["sent", "paid", "overdue", "partial"].includes(invoice.status) && (
                            <Button size="sm" variant="ghost" onClick={() => setCancellingInvoice(invoice)}
                              className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50">
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      )}
                      {invoice.status === "cancelled" && (
                        <Button size="sm" variant="ghost" onClick={() => setDeletingInvoice(invoice)}
                          className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 gap-1 ml-auto">
                          <Trash2 className="w-3 h-3" /> Supprimer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {!loading && filtered.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Affichage{" "}
              <span className="font-semibold text-gray-700">
                {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)}
              </span>{" "}
              sur <span className="font-semibold text-gray-700">{filtered.length}</span>
            </p>

            <div className="flex items-center gap-1">
              <Button
                size="sm" variant="ghost"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-lg disabled:opacity-30"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm" variant="ghost"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-lg disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-all ${
                        currentPage === p
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <Button
                size="sm" variant="ghost"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-lg disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                size="sm" variant="ghost"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-lg disabled:opacity-30"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - Temporairement désactivé */}
      {/* <ContextualSidebar
        type="invoices"
        stats={{
          total: stats.total,
          "en attente": stats.draft + stats.sent,
          payées: stats.paid,
          "en retard": stats.overdue,
          encaissé: formatXAF(stats.paidAmount),
          "à encaisser": formatXAF(stats.totalAmount - stats.paidAmount)
        }}
      /> */}

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingInvoice} onOpenChange={() => setDeletingInvoice(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deletingInvoice?.status === "cancelled" ? "Supprimer définitivement la facture" : "Supprimer la facture"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deletingInvoice?.status === "cancelled" ? (
                <>
                  Êtes-vous sûr de vouloir supprimer définitivement la facture <strong>{deletingInvoice?.number}</strong> ?
                  Cette facture annulée sera supprimée de la base de données. Cette action est irréversible.
                </>
              ) : (
                <>
                  Êtes-vous sûr de vouloir supprimer la facture <strong>{deletingInvoice?.number}</strong> ?
                  Cette action est irréversible.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl">
              {deletingInvoice?.status === "cancelled" ? "Supprimer définitivement" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Dialog */}
      <EmailDialog
        open={!!emailingInvoice}
        onOpenChange={(open) => !open && setEmailingInvoice(null)}
        onSend={handleEmailSend}
        defaultEmail={emailingInvoice?.client?.email || ""}
        defaultSubject={`Facture ${emailingInvoice?.number || ""}`}
        defaultMessage={`Bonjour,\n\nVeuillez trouver ci-joint la facture ${emailingInvoice?.number || ""}.\n\nCordialement`}
        title="Envoyer la facture par email"
        description={`Envoyez la facture ${emailingInvoice?.number || ""} par email au client`}
      />

      {/* Cancel Invoice Dialog */}
      <CancelInvoiceDialog
        open={!!cancellingInvoice}
        onOpenChange={(open) => !open && setCancellingInvoice(null)}
        onConfirm={handleCancelInvoice}
        invoiceNumber={cancellingInvoice?.number || ""}
      />
    </div>
  );
};

export default InvoicesPage;