import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { apiService } from "@/services/api";
import { formatXAF } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Account {
  _id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "expense" | "revenue";
  currentBalance: number;
  isActive: boolean;
  parent?: {
    _id: string;
    code: string;
    name: string;
  };
}

const typeLabels: Record<string, { label: string; className: string }> = {
  asset: { label: "Actif", className: "bg-info/10 text-info border border-info/20" },
  liability: { label: "Passif", className: "bg-warning/10 text-warning border border-warning/20" },
  equity: { label: "Capitaux", className: "bg-primary/10 text-primary border border-primary/20" },
  expense: { label: "Charge", className: "bg-destructive/10 text-destructive border border-destructive/20" },
  revenue: { label: "Produit", className: "bg-success/10 text-success border border-success/20" },
};

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAccounts({
        search: searchTerm || undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
      });
      
      if (response.data) {
        setAccounts(response.data.accounts || []);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les comptes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadAccounts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, typeFilter]);

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = searchTerm === "" || 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.code.includes(searchTerm);
    
    const matchesType = typeFilter === "all" || account.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const grouped = filteredAccounts.reduce((acc, a) => {
    (acc[a.type] = acc[a.type] || []).push(a);
    return acc;
  }, {} as Record<string, Account[]>);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Plan comptable" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Plan comptable" 
        description="Liste des comptes organisés par catégorie (SYSCOHADA)"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau compte
          </Button>
        }
      />

      {/* Filtres */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher par nom ou code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Type de compte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="asset">Actifs</SelectItem>
              <SelectItem value="liability">Passifs</SelectItem>
              <SelectItem value="equity">Capitaux</SelectItem>
              <SelectItem value="expense">Charges</SelectItem>
              <SelectItem value="revenue">Produits</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des comptes */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">
            {accounts.length === 0 ? "Aucun compte trouvé" : "Aucun compte ne correspond aux filtres"}
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([type, accs]) => {
          const config = typeLabels[type];
          const total = accs.reduce((s, a) => s + a.currentBalance, 0);
          return (
            <div key={type} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${config.className}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{accs.length} comptes</span>
                </div>
                <span className="text-sm font-bold text-card-foreground">{formatXAF(total)}</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2.5 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-24">Code</th>
                    <th className="text-left py-2.5 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Intitulé</th>
                    <th className="text-right py-2.5 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Solde</th>
                  </tr>
                </thead>
                <tbody>
                  {accs.map((a) => (
                    <tr key={a._id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-5 font-mono text-sm font-semibold text-primary">{a.code}</td>
                      <td className="py-2.5 px-5 text-card-foreground">
                        {a.name}
                        {a.parent && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Sous-compte de: {a.parent.code} - {a.parent.name}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-5 text-right font-medium text-card-foreground">{formatXAF(a.currentBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChartOfAccounts;
