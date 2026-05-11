import PageHeader from "@/components/PageHeader";
import { accounts, journalEntries, formatXAF } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

const BalancePage = () => {
  // Compute trial balance from journal entries
  const balanceData = accounts.map((acc) => {
    const movements = journalEntries.flatMap((je) =>
      je.lines.filter((l) => l.accountCode === acc.code)
    );
    const totalDebit = movements.reduce((s, l) => s + l.debit, 0);
    const totalCredit = movements.reduce((s, l) => s + l.credit, 0);
    const solde = totalDebit - totalCredit;
    return { ...acc, totalDebit, totalCredit, soldeDebit: solde > 0 ? solde : 0, soldeCredit: solde < 0 ? -solde : 0 };
  }).filter((a) => a.totalDebit > 0 || a.totalCredit > 0);

  const sumDebit = balanceData.reduce((s, a) => s + a.totalDebit, 0);
  const sumCredit = balanceData.reduce((s, a) => s + a.totalCredit, 0);
  const sumSoldeDebit = balanceData.reduce((s, a) => s + a.soldeDebit, 0);
  const sumSoldeCredit = balanceData.reduce((s, a) => s + a.soldeCredit, 0);
  const isBalanced = sumDebit === sumCredit;

  // Income statement
  const revenueAccounts = balanceData.filter((a) => a.type === "revenue");
  const expenseAccounts = balanceData.filter((a) => a.type === "expense");
  const totalRevenue = revenueAccounts.reduce((s, a) => s + a.totalCredit, 0);
  const totalExpenses = expenseAccounts.reduce((s, a) => s + a.totalDebit, 0);
  const netResult = totalRevenue - totalExpenses;

  // Balance sheet
  const assetAccounts = accounts.filter((a) => a.type === "asset");
  const liabilityAccounts = accounts.filter((a) => a.type === "liability");
  const equityAccounts = accounts.filter((a) => a.type === "equity");
  const totalAssets = assetAccounts.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((s, a) => s + a.balance, 0);
  const totalEquity = equityAccounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Balance & États financiers" description="Balance générale, compte de résultat et bilan" />

      <Tabs defaultValue="balance" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="balance">Balance générale</TabsTrigger>
          <TabsTrigger value="income">Compte de résultat</TabsTrigger>
          <TabsTrigger value="bilan">Bilan</TabsTrigger>
        </TabsList>

        {/* === BALANCE GÉNÉRALE === */}
        <TabsContent value="balance" className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            {isBalanced ? (
              <><CheckCircle2 className="w-4 h-4 text-success" /><span className="text-success font-medium">Balance équilibrée</span></>
            ) : (
              <><AlertCircle className="w-4 h-4 text-destructive" /><span className="text-destructive font-medium">Balance déséquilibrée — Écart: {formatXAF(Math.abs(sumDebit - sumCredit))}</span></>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                  <th className="text-left py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Intitulé</th>
                  <th className="text-right py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Mouv. Débit</th>
                  <th className="text-right py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Mouv. Crédit</th>
                  <th className="text-right py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Solde Débit</th>
                  <th className="text-right py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Solde Crédit</th>
                </tr>
              </thead>
              <tbody>
                {balanceData.map((a) => (
                  <tr key={a.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-5 font-mono text-xs font-semibold text-primary">{a.code}</td>
                    <td className="py-2.5 px-5 text-card-foreground">{a.name}</td>
                    <td className="py-2.5 px-5 text-right text-card-foreground">{a.totalDebit > 0 ? formatXAF(a.totalDebit) : "—"}</td>
                    <td className="py-2.5 px-5 text-right text-card-foreground">{a.totalCredit > 0 ? formatXAF(a.totalCredit) : "—"}</td>
                    <td className="py-2.5 px-5 text-right font-medium text-card-foreground">{a.soldeDebit > 0 ? formatXAF(a.soldeDebit) : "—"}</td>
                    <td className="py-2.5 px-5 text-right font-medium text-card-foreground">{a.soldeCredit > 0 ? formatXAF(a.soldeCredit) : "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/40 font-bold text-sm">
                  <td colSpan={2} className="py-3 px-5 text-right text-muted-foreground uppercase text-xs">Totaux</td>
                  <td className="py-3 px-5 text-right text-card-foreground">{formatXAF(sumDebit)}</td>
                  <td className="py-3 px-5 text-right text-card-foreground">{formatXAF(sumCredit)}</td>
                  <td className="py-3 px-5 text-right text-card-foreground">{formatXAF(sumSoldeDebit)}</td>
                  <td className="py-3 px-5 text-right text-card-foreground">{formatXAF(sumSoldeCredit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </TabsContent>

        {/* === COMPTE DE RÉSULTAT === */}
        <TabsContent value="income" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Produits */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-border bg-success/5">
                <h3 className="font-heading font-semibold text-success text-sm">Produits (Revenus)</h3>
              </div>
              <div className="divide-y divide-border/30">
                {revenueAccounts.map((a) => (
                  <div key={a.id} className="flex justify-between px-5 py-2.5 text-sm">
                    <span className="text-card-foreground"><span className="font-mono text-xs text-primary mr-2">{a.code}</span>{a.name}</span>
                    <span className="font-medium text-card-foreground">{formatXAF(a.totalCredit)}</span>
                  </div>
                ))}
                <div className="flex justify-between px-5 py-3 bg-success/5 font-bold text-sm">
                  <span className="text-success">Total Produits</span>
                  <span className="text-success">{formatXAF(totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Charges */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-border bg-destructive/5">
                <h3 className="font-heading font-semibold text-destructive text-sm">Charges (Dépenses)</h3>
              </div>
              <div className="divide-y divide-border/30">
                {expenseAccounts.map((a) => (
                  <div key={a.id} className="flex justify-between px-5 py-2.5 text-sm">
                    <span className="text-card-foreground"><span className="font-mono text-xs text-primary mr-2">{a.code}</span>{a.name}</span>
                    <span className="font-medium text-card-foreground">{formatXAF(a.totalDebit)}</span>
                  </div>
                ))}
                <div className="flex justify-between px-5 py-3 bg-destructive/5 font-bold text-sm">
                  <span className="text-destructive">Total Charges</span>
                  <span className="text-destructive">{formatXAF(totalExpenses)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net result */}
          <div className={cn(
            "rounded-xl border-2 p-5 flex items-center justify-between",
            netResult >= 0 ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
          )}>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Résultat net de l'exercice</p>
              <p className={cn("text-xs mt-0.5", netResult >= 0 ? "text-success" : "text-destructive")}>
                {netResult >= 0 ? "Bénéfice" : "Perte"}
              </p>
            </div>
            <p className={cn("text-3xl font-heading font-bold", netResult >= 0 ? "text-success" : "text-destructive")}>
              {formatXAF(Math.abs(netResult))}
            </p>
          </div>
        </TabsContent>

        {/* === BILAN === */}
        <TabsContent value="bilan" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Actif */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-border bg-primary/5">
                <h3 className="font-heading font-semibold text-primary text-sm">ACTIF</h3>
              </div>
              <div className="divide-y divide-border/30">
                {assetAccounts.map((a) => (
                  <div key={a.id} className="flex justify-between px-5 py-2.5 text-sm">
                    <span className="text-card-foreground"><span className="font-mono text-xs text-primary mr-2">{a.code}</span>{a.name}</span>
                    <span className="font-medium text-card-foreground">{formatXAF(a.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between px-5 py-3 bg-primary/5 font-bold text-sm">
                  <span className="text-primary">Total Actif</span>
                  <span className="text-primary">{formatXAF(totalAssets)}</span>
                </div>
              </div>
            </div>

            {/* Passif */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-border bg-warning/5">
                <h3 className="font-heading font-semibold text-warning text-sm">PASSIF</h3>
              </div>
              <div className="divide-y divide-border/30">
                {equityAccounts.map((a) => (
                  <div key={a.id} className="flex justify-between px-5 py-2.5 text-sm">
                    <span className="text-card-foreground"><span className="font-mono text-xs text-primary mr-2">{a.code}</span>{a.name}</span>
                    <span className="font-medium text-card-foreground">{formatXAF(a.balance)}</span>
                  </div>
                ))}
                {liabilityAccounts.map((a) => (
                  <div key={a.id} className="flex justify-between px-5 py-2.5 text-sm">
                    <span className="text-card-foreground"><span className="font-mono text-xs text-primary mr-2">{a.code}</span>{a.name}</span>
                    <span className="font-medium text-card-foreground">{formatXAF(a.balance)}</span>
                  </div>
                ))}
                {netResult !== 0 && (
                  <div className="flex justify-between px-5 py-2.5 text-sm">
                    <span className="text-card-foreground italic">Résultat de l'exercice</span>
                    <span className={cn("font-medium", netResult >= 0 ? "text-success" : "text-destructive")}>{formatXAF(netResult)}</span>
                  </div>
                )}
                <div className="flex justify-between px-5 py-3 bg-warning/5 font-bold text-sm">
                  <span className="text-warning">Total Passif</span>
                  <span className="text-warning">{formatXAF(totalLiabilities + totalEquity + netResult)}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BalancePage;
