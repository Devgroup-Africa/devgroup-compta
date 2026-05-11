import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft,
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Edit,
  TrendingUp,
  TrendingDown,
  Wallet,
  Download,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { useApiError } from "@/hooks/use-api-error";
import { useError } from "@/contexts/ErrorContext";
import apiService from "@/services/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatXAF } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

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
  reference?: string;
  status: string;
  createdBy?: {
    name: string;
    email: string;
  };
}

interface BankAccount {
  _id: string;
  name: string;
  bank: string;
  accountNumber: string;
  iban?: string;
  swift?: string;
  currency: string;
  type: string;
  initialBalance: number;
  currentBalance: number;
  isActive: boolean;
  accountCode: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const BankAccountDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handleApiError } = useApiError();
  const { showSuccess } = useError();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (id) {
      loadBankAccountDetails();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBankAccountDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBankAccountById(id!);
      const data = response.data as { bankAccount: BankAccount; transactions: Transaction[] };
      setBankAccount(data.bankAccount);
      setTransactions(data.transactions || []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateBalance = async () => {
    try {
      setRefreshing(true);
      await apiService.recalculateBalance(id!);
      showSuccess("Solde recalculé avec succès");
      loadBankAccountDetails();
    } catch (error) {
      handleApiError(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportStatement = async (format: 'excel' | 'pdf') => {
    try {
      setExporting(true);
      await apiService.exportBankAccountStatement(id!, format);
      showSuccess(`Relevé exporté en ${format.toUpperCase()} avec succès`);
    } catch (error) {
      handleApiError(error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportTransactions = async () => {
    try {
      setExporting(true);
      await apiService.exportTransactionsList(id!);
      showSuccess("Liste des transactions exportée avec succès");
    } catch (error) {
      handleApiError(error);
    } finally {
      setExporting(false);
    }
  };

  // Calculer les statistiques
  const totalIncome = transactions
    .filter((t) => t.type === "income" && t.status === "confirmed")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter((t) => t.type === "expense" && t.status === "confirmed")
    .reduce((sum, t) => sum + t.amount, 0);

  const netFlow = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 space-y-6">
          <PageHeader title="Détails du compte" description="Chargement..." />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!bankAccount) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 space-y-6">
          <PageHeader title="Compte non trouvé" description="Ce compte bancaire n'existe pas" />
          <div className="flex items-center justify-center h-64">
            <Button onClick={() => navigate("/treasury")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la trésorerie
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 space-y-6">
        <PageHeader 
          title={bankAccount.name} 
          description={`${bankAccount.bank} - ${bankAccount.accountNumber}`}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRecalculateBalance}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Recalculer
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportStatement('excel')}
              disabled={exporting}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Relevé Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportStatement('pdf')}
              disabled={exporting}
            >
              <FileText className="w-4 h-4 mr-2" />
              Relevé PDF
            </Button>
            <Button variant="outline" onClick={() => navigate("/treasury")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </PageHeader>

        {/* Informations du compte */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Nom du compte</p>
                <p className="font-medium">{bankAccount.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Banque</p>
                <p className="font-medium">{bankAccount.bank}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Numéro de compte</p>
                <p className="font-medium">{bankAccount.accountNumber}</p>
              </div>
              {bankAccount.iban && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">IBAN</p>
                  <p className="font-medium">{bankAccount.iban}</p>
                </div>
              )}
              {bankAccount.swift && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">SWIFT/BIC</p>
                  <p className="font-medium">{bankAccount.swift}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500 mb-1">Devise</p>
                <p className="font-medium">{bankAccount.currency}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Type de compte</p>
                <Badge variant="outline">
                  {bankAccount.type === 'checking' ? 'Courant' : 
                   bankAccount.type === 'savings' ? 'Épargne' : 'Professionnel'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Code comptable</p>
                <p className="font-medium">{bankAccount.accountCode}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Statut</p>
                <Badge variant={bankAccount.isActive ? "default" : "secondary"}>
                  {bankAccount.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>
            {bankAccount.description && (
              <div className="mt-6">
                <p className="text-sm text-slate-500 mb-1">Description</p>
                <p className="text-sm">{bankAccount.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Solde actuel</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {formatXAF(bankAccount.currentBalance)}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total entrées</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {formatXAF(totalIncome)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Total sorties</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">
                    {formatXAF(totalExpense)}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${
            netFlow >= 0 
              ? 'from-emerald-50 to-teal-50 border-emerald-100' 
              : 'from-orange-50 to-red-50 border-orange-100'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    netFlow >= 0 ? 'text-emerald-700' : 'text-orange-700'
                  }`}>
                    Flux net
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${
                    netFlow >= 0 ? 'text-emerald-900' : 'text-orange-900'
                  }`}>
                    {formatXAF(netFlow)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historique des transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Historique des transactions</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{transactions.length} transaction(s)</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportTransactions}
                  disabled={exporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p>Aucune transaction pour ce compte</p>
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
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
                              {new Date(transaction.date).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                            {transaction.reference && (
                              <>
                                <span className="text-xs text-slate-300">•</span>
                                <p className="text-xs text-slate-500">{transaction.reference}</p>
                              </>
                            )}
                            <span className="text-xs text-slate-300">•</span>
                            <Badge 
                              variant={
                                transaction.status === 'confirmed' ? 'default' : 
                                transaction.status === 'pending' ? 'secondary' : 'destructive'
                              }
                              className="text-xs"
                            >
                              {transaction.status === 'confirmed' ? 'Confirmée' : 
                               transaction.status === 'pending' ? 'En attente' : 'Annulée'}
                            </Badge>
                          </div>
                        </div>
                      </div>
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
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankAccountDetailPage;
