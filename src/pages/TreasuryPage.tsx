import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import ContextualSidebar from "@/components/ContextualSidebar";
import { formatXAF } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Building2,
  CreditCard,
  Calendar,
  Filter,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useError } from "@/contexts/ErrorContext";
import { useApiError } from "@/hooks/use-api-error";
import { useErrorModal } from "@/hooks/use-error-modal";
import apiService from "@/services/api";
import BankAccountForm from "@/components/forms/BankAccountForm";
import TransactionForm from "@/components/forms/TransactionForm";
import TransferForm from "@/components/forms/TransferForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface BankAccount {
  _id: string;
  name: string;
  accountNumber: string;
  bank: string;
  currentBalance: number;
  initialBalance: number;
  currency: string;
  type: "checking" | "savings" | "cash";
  isActive: boolean;
  iban?: string;
  swift?: string;
  accountCode?: string;
  description?: string;
}

interface Transaction {
  _id: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  account: {
    _id: string;
    name: string;
  };
  reference?: string;
}

const TresoreriePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showSuccess } = useError();
  const { handleApiError } = useApiError();
  const { errorModal, setErrorModal } = useErrorModal();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | undefined>();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  
  // Pagination et tri pour les transactions
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const itemsPerPage = 10;

  // Dialogues de confirmation
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

  // Stats calculées
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const cashFlow = totalIncome - totalExpense;

  useEffect(() => {
    loadTreasuryData();
  }, [selectedPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTreasuryData = async () => {
    try {
      setLoading(true);
      // Charger les données réelles depuis l'API
      const dashboardResponse = await apiService.getTreasuryDashboard({ period: selectedPeriod });
      
      if (dashboardResponse.data) {
        const data = dashboardResponse.data as { accounts?: BankAccount[]; recentTransactions?: Transaction[] };
        setAccounts(data.accounts || []);
        setTransactions(data.recentTransactions || []);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewBankAccount = () => {
    setEditingBankAccount(undefined);
    setShowBankAccountForm(true);
  };

  const handleEditBankAccount = (account: BankAccount) => {
    setEditingBankAccount(account);
    setShowBankAccountForm(true);
  };

  const handleBankAccountSuccess = () => {
    setShowBankAccountForm(false);
    setEditingBankAccount(undefined);
    loadTreasuryData();
  };

  const handleNewTransaction = () => {
    setEditingTransaction(undefined);
    setShowTransactionForm(true);
  };

  const handleTransactionSuccess = () => {
    setShowTransactionForm(false);
    setEditingTransaction(undefined);
    loadTreasuryData();
  };

  const handleNewTransfer = () => {
    setShowTransferForm(true);
  };

  const handleTransferSuccess = () => {
    setShowTransferForm(false);
    loadTreasuryData();
  };

  const handleDeleteBankAccount = async (id: string) => {
    setConfirmDialog({
      open: true,
      title: "Supprimer le compte bancaire",
      description: "Êtes-vous sûr de vouloir supprimer ce compte bancaire ? Cette action est irréversible.",
      onConfirm: async () => {
        try {
          await apiService.deleteBankAccount(id);
          setConfirmDialog({ ...confirmDialog, open: false });
          showSuccess("Compte bancaire supprimé avec succès");
          loadTreasuryData();
        } catch (error) {
          setConfirmDialog({ ...confirmDialog, open: false });
          handleApiError(error);
        }
      },
    });
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
          loadTreasuryData();
        } catch (error) {
          setConfirmDialog({ ...confirmDialog, open: false });
          handleApiError(error);
        }
      },
    });
  };

  // Tri et pagination des transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
    }
  });

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSortChange = (newSortBy: "date" | "amount") => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 space-y-6">
          <PageHeader title="Trésorerie" description="Gestion de trésorerie et flux de trésorerie" />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher le formulaire de compte bancaire si actif
  if (showBankAccountForm) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 p-6">
          <BankAccountForm
            bankAccount={editingBankAccount}
            onSuccess={handleBankAccountSuccess}
            onCancel={() => setShowBankAccountForm(false)}
          />
        </div>
      </div>
    );
  }

  // Afficher le formulaire de transaction si actif
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

  // Afficher le formulaire de virement si actif
  if (showTransferForm) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 p-6">
          <TransferForm
            onSuccess={handleTransferSuccess}
            onCancel={() => setShowTransferForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 space-y-6">
        <PageHeader title="Trésorerie" description="Gestion de trésorerie et flux de trésorerie">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleNewTransfer}>
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Virement
            </Button>
            <Button onClick={handleNewTransaction}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle opération
            </Button>
          </div>
        </PageHeader>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Solde Total</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{formatXAF(totalBalance)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Entrées</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{formatXAF(totalIncome)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Sorties</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">{formatXAF(totalExpense)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${cashFlow >= 0 ? 'from-purple-50 to-violet-50 border-purple-100' : 'from-orange-50 to-amber-50 border-orange-100'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${cashFlow >= 0 ? 'text-purple-700' : 'text-orange-700'}`}>Flux Net</p>
                  <p className={`text-2xl font-bold mt-1 ${cashFlow >= 0 ? 'text-purple-900' : 'text-orange-900'}`}>
                    {formatXAF(cashFlow)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cashFlow >= 0 ? 'bg-purple-100' : 'bg-orange-100'}`}>
                  {cashFlow >= 0 ? (
                    <ArrowUpRight className={`w-6 h-6 ${cashFlow >= 0 ? 'text-purple-600' : 'text-orange-600'}`} />
                  ) : (
                    <ArrowDownRight className="w-6 h-6 text-orange-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="accounts" className="space-y-4">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="accounts">Comptes bancaires</TabsTrigger>
            <TabsTrigger value="transactions">Flux de trésorerie</TabsTrigger>
            <TabsTrigger value="forecast">Prévisions</TabsTrigger>
          </TabsList>

          {/* Comptes bancaires */}
          <TabsContent value="accounts" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Mes comptes</h3>
              <Button onClick={handleNewBankAccount}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau compte
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <Card key={account._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          account.type === 'cash' ? 'bg-amber-100' : 'bg-blue-100'
                        }`}>
                          {account.type === 'cash' ? (
                            <Wallet className="w-5 h-5 text-amber-600" />
                          ) : (
                            <Building2 className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base">{account.name}</CardTitle>
                          <p className="text-xs text-slate-500 mt-0.5">{account.bank}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditBankAccount(account)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteBankAccount(account._id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Numéro de compte</p>
                        <p className="text-sm font-mono text-slate-700">{account.accountNumber}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Solde actuel</p>
                        <p className="text-2xl font-bold text-slate-900">{formatXAF(account.currentBalance || 0)}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => navigate(`/compte/${account._id}`)}
                        >
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Mouvements récents</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={(value) => handleSortChange(value as "date" | "amount")}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Trier par" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                          </div>
                        </SelectItem>
                        <SelectItem value="amount">
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4" />
                            Montant {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                          </div>
                        </SelectItem>
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
                          className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
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
                              <p className="text-xs text-slate-500 mt-1">{transaction.category}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingTransaction(transaction);
                                  setShowTransactionForm(true);
                                }}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteTransaction(transaction._id)}
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
                      Page {currentPage} sur {totalPages} ({sortedTransactions.length} transactions)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prévisions */}
          <TabsContent value="forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Prévisions de trésorerie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p>Les prévisions de trésorerie seront disponibles prochainement</p>
                  <p className="text-sm mt-2">Anticipez vos besoins de trésorerie sur les 3 prochains mois</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Temporairement désactivé */}
      {/* <ContextualSidebar 
        type="treasury" 
        stats={{
          "solde total": formatXAF(totalBalance),
          "comptes actifs": accounts.filter(a => a.isActive).length,
          entrées: formatXAF(totalIncome),
          sorties: formatXAF(totalExpense),
          "flux net": formatXAF(cashFlow)
        }}
      /> */}

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

export default TresoreriePage;
