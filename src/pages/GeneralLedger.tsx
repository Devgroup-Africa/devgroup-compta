import PageHeader from "@/components/PageHeader";
import { accounts, journalEntries, formatXAF } from "@/data/mockData";

const GeneralLedger = () => {
  const ledger = accounts.map((acc) => {
    const lines = journalEntries.flatMap((je) =>
      je.lines
        .filter((l) => l.accountCode === acc.code)
        .map((l) => ({ date: je.date, ref: je.reference, desc: je.description, debit: l.debit, credit: l.credit }))
    );
    const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
    return { ...acc, lines, totalDebit, totalCredit };
  }).filter((a) => a.lines.length > 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Grand livre" description="Historique des mouvements par compte" />

      {ledger.map((acc) => (
        <div key={acc.id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-primary bg-primary/8 px-2 py-0.5 rounded">{acc.code}</span>
              <span className="font-heading font-semibold text-sm text-card-foreground">{acc.name}</span>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{acc.lines.length} mouvements</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-2.5 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left py-2.5 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Réf.</th>
                <th className="text-left py-2.5 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="text-right py-2.5 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Débit</th>
                <th className="text-right py-2.5 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Crédit</th>
              </tr>
            </thead>
            <tbody>
              {acc.lines.map((l, i) => (
                <tr key={i} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                  <td className="py-2.5 px-5 text-muted-foreground">{l.date}</td>
                  <td className="py-2.5 px-5 font-medium text-card-foreground">{l.ref}</td>
                  <td className="py-2.5 px-5 text-card-foreground">{l.desc}</td>
                  <td className="py-2.5 px-5 text-right text-card-foreground">{l.debit > 0 ? formatXAF(l.debit) : ""}</td>
                  <td className="py-2.5 px-5 text-right text-card-foreground">{l.credit > 0 ? formatXAF(l.credit) : ""}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-muted/30">
                <td colSpan={3} className="py-2.5 px-5 text-right text-[11px] uppercase text-muted-foreground tracking-wider">Totaux</td>
                <td className="py-2.5 px-5 text-right text-card-foreground">{formatXAF(acc.totalDebit)}</td>
                <td className="py-2.5 px-5 text-right text-card-foreground">{formatXAF(acc.totalCredit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default GeneralLedger;
