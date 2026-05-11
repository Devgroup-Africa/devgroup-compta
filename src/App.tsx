import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { CompanySettingsProvider } from "@/contexts/CompanySettingsContext";
import AIAssistant from "@/components/AIAssistant";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import ChartOfAccounts from "@/pages/ChartOfAccounts";
import JournalPage from "@/pages/JournalPage";
import GeneralLedger from "@/pages/GeneralLedger";
import BalancePage from "@/pages/BalancePage";
import InvoicesPage from "@/pages/InvoicesPage";
import InvoiceDetailPage from "@/pages/InvoiceDetailPage";
import ClientsPage from "@/pages/ClientsPage";
import ClientDetailPage from "@/pages/ClientDetailPage";
import SuppliersPage from "@/pages/SuppliersPage";
import SupplierDetailPage from "@/pages/SupplierDetailPage";
import PurchasesPage from "@/pages/PurchasesPage";
import PurchaseDetailPage from "@/pages/PurchaseDetailPage";
import PurchaseFormPage from "@/pages/PurchaseFormPage";
import TreasuryPage from "@/pages/TreasuryPage";
import TransactionsPage from "@/pages/TransactionsPage";
import TransactionDetailPage from "@/pages/TransactionDetailPage";
import BankAccountDetailPage from "@/pages/BankAccountDetailPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="plan-comptable" element={<ChartOfAccounts />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="grand-livre" element={<GeneralLedger />} />
        <Route path="balance" element={<BalancePage />} />
        <Route path="factures" element={<InvoicesPage />} />
        <Route path="factures/:id" element={<InvoiceDetailPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/:id" element={<ClientDetailPage />} />
        <Route path="fournisseurs" element={<SuppliersPage />} />
        <Route path="fournisseurs/:id" element={<SupplierDetailPage />} />
        <Route path="achats" element={<PurchasesPage />} />
        <Route path="achats/creer" element={<PurchaseFormPage />} />
        <Route path="achats/:id/modifier" element={<PurchaseFormPage />} />
        <Route path="achats/:id" element={<PurchaseDetailPage />} />
        <Route path="tresorerie" element={<TreasuryPage />} />
        <Route path="compte/:id" element={<BankAccountDetailPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="transactions/:id" element={<TransactionDetailPage />} />
        <Route path="parametres" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CompanySettingsProvider>
          <ErrorProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
              <AIAssistant />
            </TooltipProvider>
          </ErrorProvider>
        </CompanySettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
