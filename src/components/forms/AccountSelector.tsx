import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Account {
  _id: string;
  code: string;
  name: string;
  type: string;
}

interface AccountSelectorProps {
  accounts: Account[];
  value?: string;
  onChange: (value: string) => void;
  transactionType?: "income" | "expense";
  placeholder?: string;
}

export function AccountSelector({
  accounts,
  value,
  onChange,
  transactionType,
  placeholder = "Sélectionner un compte",
}: AccountSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Grouper les comptes par catégorie
  const groupedAccounts = useMemo(() => {
    const filtered = accounts.filter(
      (acc) =>
        acc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtrer selon le type de transaction si spécifié
    let relevantAccounts = filtered;
    if (transactionType === "income") {
      // Pour les recettes, privilégier les comptes de produits (classe 7)
      relevantAccounts = filtered.sort((a, b) => {
        const aIsProduct = a.code.startsWith("7");
        const bIsProduct = b.code.startsWith("7");
        if (aIsProduct && !bIsProduct) return -1;
        if (!aIsProduct && bIsProduct) return 1;
        return a.code.localeCompare(b.code);
      });
    } else if (transactionType === "expense") {
      // Pour les dépenses, privilégier les comptes de charges (classe 6)
      relevantAccounts = filtered.sort((a, b) => {
        const aIsExpense = a.code.startsWith("6");
        const bIsExpense = b.code.startsWith("6");
        if (aIsExpense && !bIsExpense) return -1;
        if (!aIsExpense && bIsExpense) return 1;
        return a.code.localeCompare(b.code);
      });
    }

    const groups: Record<string, Account[]> = {
      "Classe 1 - Capitaux": [],
      "Classe 2 - Immobilisations": [],
      "Classe 3 - Stocks": [],
      "Classe 4 - Tiers": [],
      "Classe 5 - Trésorerie": [],
      "Classe 6 - Charges": [],
      "Classe 7 - Produits": [],
      "Classe 8 - Autres": [],
    };

    relevantAccounts.forEach((acc) => {
      const firstDigit = acc.code.charAt(0);
      switch (firstDigit) {
        case "1":
          groups["Classe 1 - Capitaux"].push(acc);
          break;
        case "2":
          groups["Classe 2 - Immobilisations"].push(acc);
          break;
        case "3":
          groups["Classe 3 - Stocks"].push(acc);
          break;
        case "4":
          groups["Classe 4 - Tiers"].push(acc);
          break;
        case "5":
          groups["Classe 5 - Trésorerie"].push(acc);
          break;
        case "6":
          groups["Classe 6 - Charges"].push(acc);
          break;
        case "7":
          groups["Classe 7 - Produits"].push(acc);
          break;
        default:
          groups["Classe 8 - Autres"].push(acc);
      }
    });

    // Retirer les groupes vides
    return Object.entries(groups).filter(([, accs]) => accs.length > 0);
  }, [accounts, searchTerm, transactionType]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Rechercher un compte..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {groupedAccounts.map(([groupName, accs]) => (
            <SelectGroup key={groupName}>
              <SelectLabel className="font-semibold text-slate-700">
                {groupName}
              </SelectLabel>
              {accs.map((acc) => (
                <SelectItem key={acc._id} value={acc._id}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500 min-w-[60px]">
                      {acc.code}
                    </span>
                    <span className="text-sm">{acc.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
          {groupedAccounts.length === 0 && (
            <div className="py-6 text-center text-sm text-slate-500">
              Aucun compte trouvé
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
