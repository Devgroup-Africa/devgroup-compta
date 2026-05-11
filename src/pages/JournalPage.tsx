import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import JournalEntryForm from "@/components/forms/JournalEntryForm";
import { formatXAF } from "@/data/mockData";
import { CheckCircle, Clock, Edit, Trash2, Search, BookOpen, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/api";

interface JournalEntry {
  _id: string;
  date: string;
  reference: string;
  description: string;
  entries: Array<{
    account: {
      _id: string;
      code: string;
      name: string;
    };
    debit?: number;
    credit?: number;
  }>;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  validated: boolean;
  createdAt: string;
  updatedAt: string;
}

const JournalPage = () => {
  const { toast } = useToast();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<JournalEntry | null>(null);

  const loadJournalEntries = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "all") {
        params.status = statusFilter === "validated" ? "validated" : "draft";
      }
      
      const response = await apiService.getJournalEntries(params);
      // Handle the nested response structure from backend
      const entriesData = response.data?.journalEntries || response.data || [];
      setJournalEntries(Array.isArray(entriesData) ? entriesData : []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les écritures comptables.",
        variant: "destructive"
      });
      setJournalEntries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJournalEntries();
  }, [searchTerm, statusFilter]);

  const handleDelete = async () => {
    if (!deletingEntry) return;

    try {
      await apiService.deleteJournalEntry(deletingEntry._id);
      toast({
        title: "Écriture supprimée",
        description: `L'écriture ${deletingEntry.reference} a été supprimée avec succès.`
      });
      setDeletingEntry(null);
      loadJournalEntries();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'écriture.",
        variant: "destructive"
      });
    }
  };

  const handleValidate = async (entry: JournalEntry) => {
    try {
      await apiService.validateJournalEntry(entry._id);
      toast({
        title: "Écriture validée",
        description: `L'écriture ${entry.reference} a été validée avec succès.`
      });
      loadJournalEntries();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de valider l'écriture.",
        variant: "destructive"
      });
    }
  };

  const handleFormSuccess = () => {
    setEditingEntry(null);
    loadJournalEntries();
  };

  const filteredEntries = Array.isArray(journalEntries) ? journalEntries.filter(entry => {
    const matchesSearch = entry.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "validated" && entry.validated) ||
                         (statusFilter === "draft" && !entry.validated);
    return matchesSearch && matchesStatus;
  }) : [];

  const stats = {
    total: Array.isArray(journalEntries) ? journalEntries.length : 0,
    validated: Array.isArray(journalEntries) ? journalEntries.filter(e => e.validated).length : 0,
    draft: Array.isArray(journalEntries) ? journalEntries.filter(e => !e.validated).length : 0,
    totalAmount: Array.isArray(journalEntries) ? journalEntries.reduce((sum, e) => sum + (e.totalDebit || 0), 0) : 0
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Journal comptable" description="Écritures comptables en partie double (débit/crédit)">
        <Button onClick={() => setEditingEntry(null)}>
          <BookOpen className="w-4 h-4 mr-2" />
          Nouvelle écriture
        </Button>
      </PageHeader>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total écritures</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{stats.validated}</p>
              <p className="text-sm text-muted-foreground">Validées</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{stats.draft}</p>
              <p className="text-sm text-muted-foreground">Brouillons</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{formatXAF(stats.totalAmount)}</p>
              <p className="text-sm text-muted-foreground">Montant total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher une écriture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
            <SelectItem value="validated">Validées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Journal Entries */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
              <div className="px-5 py-3.5 border-b border-border bg-muted/20">
                <div className="h-6 bg-muted rounded mb-2 w-1/3"></div>
              </div>
              <div className="p-4">
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            {searchTerm || statusFilter !== "all" ? "Aucune écriture trouvée" : "Aucune écriture"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all" ? "Essayez avec d'autres critères de recherche." : "Commencez par créer votre première écriture comptable."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button onClick={() => setEditingEntry(null)}>
              <BookOpen className="w-4 h-4 mr-2" />
              Nouvelle écriture
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const totalDebit = entry.entries.reduce((s, l) => s + (l.debit || 0), 0);
            const totalCredit = entry.entries.reduce((s, l) => s + (l.credit || 0), 0);
            const balanced = totalDebit === totalCredit;

            return (
              <div key={entry._id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    {entry.validated ? (
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-success" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-warning" />
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-sm text-card-foreground">{entry.reference}</span>
                      <span className="mx-2 text-border">|</span>
                      <span className="text-sm text-muted-foreground">{entry.description}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-full">
                      {new Date(entry.date).toLocaleDateString('fr-FR')}
                    </span>
                    {!entry.validated && balanced && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleValidate(entry)}
                        className="gap-1.5 text-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Valider
                      </Button>
                    )}
                    {!entry.validated && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingEntry(entry)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeletingEntry(entry)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-2.5 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20">Compte</th>
                      <th className="text-left py-2.5 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Libellé</th>
                      <th className="text-right py-2.5 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Débit</th>
                      <th className="text-right py-2.5 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Crédit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.entries.map((line, i) => (
                      <tr key={i} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                        <td className="py-2.5 px-5 font-mono text-xs font-semibold text-primary">{line.account.code}</td>
                        <td className="py-2.5 px-5 text-card-foreground">{line.account.name}</td>
                        <td className="py-2.5 px-5 text-right text-card-foreground">{line.debit && line.debit > 0 ? formatXAF(line.debit) : ""}</td>
                        <td className="py-2.5 px-5 text-right text-card-foreground">{line.credit && line.credit > 0 ? formatXAF(line.credit) : ""}</td>
                      </tr>
                    ))}
                    <tr className="font-semibold bg-muted/30">
                      <td colSpan={2} className="py-2.5 px-5 text-right text-[11px] uppercase text-muted-foreground tracking-wider">Total</td>
                      <td className="py-2.5 px-5 text-right text-card-foreground">{formatXAF(totalDebit)}</td>
                      <td className={cn("py-2.5 px-5 text-right", balanced ? "text-success" : "text-destructive")}>
                        {formatXAF(totalCredit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <JournalEntryForm
              journalEntry={editingEntry}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingEntry(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingEntry} onOpenChange={() => setDeletingEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'écriture</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'écriture {deletingEntry?.reference} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JournalPage;
