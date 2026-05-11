import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Edit,
  Trash2,
  Filter,
  Download,
  Calendar
} from "lucide-react";
import { useErrorModal } from "@/hooks/use-error-modal";
import { useError } from "@/contexts/ErrorContext";
import { useApiError } from "@/hooks/use-api-error";
import apiService from "@/services/api";
import TransactionForm from "@/components/forms/TransactionForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatXAF } from "@/data/mockData";
import { Input } from "@/components/ui/input";

interface Transaction {
  _id: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  account?: {
    _id: string;
    name: string;
    code: string;
  };
  bankAccount?: {
    _id: string;
    name: string;
  };
  reference?: string;
  notes?: string;
}

const TransactionsPage = () => {
  const navigate = useNavigate();
  const { showSuccess } = useError();
  const { handleApiError } = useApiError();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [exporting, setExporting] = useState(false);
  
  // Filtres
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Dialogue de confirmation
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
    loadTransactions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTransactions({});
      const data = response.data as { transactions?: Transaction[] };
      setTransactions(data.transactions || []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTransaction = () => {
    setEditingTransaction(undefined);
    setShowTransactionForm(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleTransactionSuccess = () => {
    setShowTransactionForm(false);
    setEditingTransaction(undefined);
    loadTransactions();
  };

  const handleDeleteTransaction = async (id: string) => {
    setConfirmDialog({
      open: true,
      title: "Supprimer la transaction",
      description: "Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible.",
      onConfirm: async () => {
        try {
          await apiService.deleteTransaction(id);
          setConfirmDialog({ ...confirmDialog, open: false });
          showSuccess("Transaction supprimée avec succès");
          loadTransactions();
        } catch (error) {
          setConfirmDialog({ ...confirmDialog, open: false });
          handleApiError(error);
        }
      },
    });
  };

  const handleExportTransactions = async () => {
    try {
      setExporting(true);
      await apiService.exportAllTransactions(
        typeFilter === 'all' ? undefined : typeFilter,
        undefined,
        undefined,
        undefined
      );
      showSuccess("Transactions exportées avec succès");
    } catch (error) {
      handleApiError(error);
    } finally {
      setExporting(false);
    }
  };

  // Filtrage et pagination
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.reference && t.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 space-y-6">
          <PageHeader title="Transactions" description="Gestion des transactions de trésorerie" />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (showTransactionForm) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 p-6">
          <TransactionForm
            transaction={editingTransaction}
            onSuccess={handleTransactionSuccess}
            onCancel={() => setShowTransactionForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 space-y-6">
        <PageHeader title="Transactions" description="Gestion des transactions de trésorerie">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportTransactions}
              disabled={exporting}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={handleNewTransaction}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle transaction
            </Button>
          </div>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total transactions</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{filteredTransactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total entrées</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{formatXAF(totalIncome)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Total sorties</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">{formatXAF(totalExpense)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Toutes les transactions</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="income">Recettes</SelectItem>
                    <SelectItem value="expense">Dépenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {paginatedTransactions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p>Aucune transaction trouvée</p>
                  </div>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/transactions/${transaction._id}`)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowDownRight className="w-5 h-5 text-green-600 rotate-180" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{transaction.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-500">{transaction.category}</p>
                            <span className="text-xs text-slate-300">•</span>
                            <p className="text-xs text-slate-500">
                              {new Date(transaction.date).toLocaleDateString('fr-FR')}
                            </p>
                            {transaction.reference && (
                              <>
                                <span className="text-xs text-slate-300">•</span>
                                <p className="text-xs text-slate-500">{transaction.reference}</p>
                              </>
                            )}
                            {transaction.bankAccount && (
                              <>
                                <span className="text-xs text-slate-300">•</span>
                                <p className="text-xs text-slate-500">{transaction.bankAccount.name}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatXAF(transaction.amount)}
                          </p>
                          {transaction.account && (
                            <p className="text-xs text-slate-500 mt-1">
                              {transaction.account.code} - {transaction.account.name}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTransaction(transaction);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTransaction(transaction._id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Page {currentPage} sur {totalPages} ({filteredTransactions.length} transactions)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="destructive"
      />
    </div>
  );
};

export default TransactionsPage;
