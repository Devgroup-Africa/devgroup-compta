import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import StatusBadge from "@/components/StatusBadge";
import ContextualSidebar from "@/components/ContextualSidebar";
import { formatXAF } from "@/data/mockData";
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Users, Truck, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/api";

interface DashboardStats {
  revenue: number;
  expenses: number;
  profit: number;
  cashBalance: number;
  unpaidInvoices: number;
  unpaidAmount: number;
  clientCount: number;
  supplierCount: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
}

interface RecentInvoice {
  _id: string;
  number: string;
  client?: {
    name: string;
    company: string;
  };
  total: number;
  status: string;
  dueDate: string;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0,
    expenses: 0,
    profit: 0,
    cashBalance: 0,
    unpaidInvoices: 0,
    unpaidAmount: 0,
    clientCount: 0,
    supplierCount: 0
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [clientsRes, suppliersRes, invoicesRes] = await Promise.all([
        apiService.getClients(),
        apiService.getSuppliers(),
        apiService.getInvoices()
      ]);

      const clientsResponse = clientsRes.data as { clients?: any[] } | any[];
      const suppliersResponse = suppliersRes.data as { suppliers?: any[] } | any[];
      const invoicesResponse = invoicesRes.data as { invoices?: any[] } | any[];

      const clients = Array.isArray(clientsResponse) ? clientsResponse : (clientsResponse?.clients || []);
      const suppliers = Array.isArray(suppliersResponse) ? suppliersResponse : (suppliersResponse?.suppliers || []);
      const invoices = Array.isArray(invoicesResponse) ? invoicesResponse : (invoicesResponse?.invoices || []);

      // Calculate stats - exclude cancelled invoices
      const totalRevenue = invoices
        .filter((inv: any) => inv.status === 'paid')
        .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);

      const unpaidInvoices = invoices.filter((inv: any) => 
        inv.status === 'sent' || inv.status === 'overdue'
      );

      const unpaidAmount = unpaidInvoices.reduce((sum: number, inv: any) => 
        sum + (inv.total || 0), 0
      );

      // Mock expenses for now (could be calculated from journal entries)
      const totalExpenses = totalRevenue * 0.7; // Assume 70% expense ratio

      setStats({
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: totalRevenue - totalExpenses,
        cashBalance: totalRevenue - totalExpenses, // Simplified calculation
        unpaidInvoices: unpaidInvoices.length,
        unpaidAmount,
        clientCount: clients.length,
        supplierCount: suppliers.length
      });

      // Generate monthly data (simplified - last 6 months)
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
      const monthlyRevenue = months.map((month, index) => ({
        month,
        revenue: totalRevenue / 6 + (Math.random() - 0.5) * (totalRevenue / 10),
        expenses: totalExpenses / 6 + (Math.random() - 0.5) * (totalExpenses / 10)
      }));
      setMonthlyData(monthlyRevenue);

      // Get recent invoices (last 5)
      const recent = invoices
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentInvoices(recent);

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Vue d'ensemble financière — DevGroup Africa" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-8 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 space-y-6">
      <PageHeader title="Dashboard" description="Vue d'ensemble financière — DevGroup Africa" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Chiffre d'affaires" 
          value={formatXAF(stats.revenue)} 
          icon={TrendingUp} 
          variant="success" 
          trend="+12% ce mois" 
        />
        <KpiCard 
          title="Dépenses" 
          value={formatXAF(stats.expenses)} 
          icon={TrendingDown} 
          variant="destructive" 
        />
        <KpiCard 
          title="Résultat net" 
          value={formatXAF(stats.profit)} 
          icon={DollarSign} 
          variant="default" 
        />
        <KpiCard 
          title="Trésorerie" 
          value={formatXAF(stats.cashBalance)} 
          icon={Wallet} 
          variant="success" 
        />
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="font-heading font-semibold text-card-foreground mb-5">Revenus vs Dépenses</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) => formatXAF(value)}
                contentStyle={{ borderRadius: "12px", border: "1px solid hsl(220 13% 91%)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              />
              <Legend />
              <Bar dataKey="revenue" name="Revenus" fill="hsl(221 83% 53%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name="Dépenses" fill="hsl(0 84% 60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h2 className="font-heading font-semibold text-card-foreground">Alertes</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/15">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-card-foreground">{stats.unpaidInvoices} factures impayées</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatXAF(stats.unpaidAmount)} en attente</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-card-foreground">{stats.clientCount} clients actifs</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Truck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-card-foreground">{stats.supplierCount} fournisseurs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent invoices */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-card-foreground">Dernières factures</h2>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            Aucune facture récente
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40">
                  <th className="text-left py-3 px-6 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">N°</th>
                  <th className="text-left py-3 px-6 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                  <th className="text-right py-3 px-6 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Montant</th>
                  <th className="text-center py-3 px-6 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                  <th className="text-left py-3 px-6 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Échéance</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-6 font-medium text-card-foreground">{invoice.number}</td>
                    <td className="py-3 px-6 text-card-foreground">
                      {invoice.client?.name || 'Client supprimé'} - {invoice.client?.company || ''}
                    </td>
                    <td className="py-3 px-6 text-right font-semibold text-card-foreground">{formatXAF(invoice.total)}</td>
                    <td className="py-3 px-6 text-center"><StatusBadge status={invoice.status} /></td>
                    <td className="py-3 px-6 text-muted-foreground">
                      {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    
    {/* Temporairement désactivé */}
    {/* <ContextualSidebar 
      type="dashboard" 
      stats={{
        revenus: formatXAF(stats.revenue),
        dépenses: formatXAF(stats.expenses),
        bénéfice: formatXAF(stats.profit),
        trésorerie: formatXAF(stats.cashBalance),
        clients: stats.clientCount,
        fournisseurs: stats.supplierCount
      }}
    /> */}
  </div>
  );
};

export default Dashboard;
