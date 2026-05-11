import { Info, TrendingUp, AlertCircle, CheckCircle, FileText, Users, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContextualSidebarProps {
  type: "clients" | "invoices" | "suppliers" | "dashboard" | "treasury";
  stats?: {
    total?: number;
    active?: number;
    pending?: number;
    amount?: string;
    [key: string]: any;
  };
}

const ContextualSidebar = ({ type, stats }: ContextualSidebarProps) => {
  const getContent = () => {
    switch (type) {
      case "clients":
        return {
          title: "Gestion Clients",
          icon: <Users className="w-5 h-5 text-blue-600" />,
          tips: [
            {
              icon: <Info className="w-4 h-4 text-blue-500" />,
              title: "Informations complètes",
              description: "Renseignez toutes les informations du client pour faciliter la facturation"
            },
            {
              icon: <TrendingUp className="w-4 h-4 text-green-500" />,
              title: "Suivi des paiements",
              description: "Le solde client est calculé automatiquement selon les factures et paiements"
            },
            {
              icon: <AlertCircle className="w-4 h-4 text-orange-500" />,
              title: "Limite de crédit",
              description: "Définissez une limite de crédit pour contrôler les encours clients"
            }
          ],
          quickActions: [
            "Créer une facture pour un client",
            "Consulter l'historique des paiements",
            "Exporter la liste des clients"
          ]
        };

      case "invoices":
        return {
          title: "Gestion Factures",
          icon: <FileText className="w-5 h-5 text-indigo-600" />,
          tips: [
            {
              icon: <CheckCircle className="w-4 h-4 text-green-500" />,
              title: "Statuts des factures",
              description: "Brouillon → Envoyée → Payée. Le statut se met à jour automatiquement"
            },
            {
              icon: <Info className="w-4 h-4 text-blue-500" />,
              title: "TVA et remises",
              description: "La TVA (19.25%) et les remises sont calculées automatiquement"
            },
            {
              icon: <AlertCircle className="w-4 h-4 text-orange-500" />,
              title: "Exports multiples",
              description: "Exportez vos factures en PDF, Word ou Excel selon vos besoins"
            }
          ],
          quickActions: [
            "Envoyer une facture par email",
            "Exporter en PDF/Word/Excel",
            "Marquer comme payée"
          ]
        };

      case "suppliers":
        return {
          title: "Gestion Fournisseurs",
          icon: <Building2 className="w-5 h-5 text-amber-600" />,
          tips: [
            {
              icon: <Info className="w-4 h-4 text-blue-500" />,
              title: "Coordonnées bancaires complètes",
              description: "Enregistrez RIB, IBAN et code SWIFT pour automatiser les virements et éviter les erreurs de paiement"
            },
            {
              icon: <TrendingUp className="w-4 h-4 text-green-500" />,
              title: "Conditions de paiement",
              description: "Respectez les délais négociés (30, 45, 60 jours) pour maintenir de bonnes relations commerciales"
            },
            {
              icon: <AlertCircle className="w-4 h-4 text-orange-500" />,
              title: "Conformité fiscale",
              description: "Le numéro fiscal (NIF) est obligatoire pour la déductibilité de la TVA sur vos achats"
            }
          ],
          quickActions: [
            "Enregistrer une facture d'achat",
            "Programmer un paiement fournisseur",
            "Consulter le solde dû"
          ]
        };

      case "dashboard":
        return {
          title: "Tableau de bord",
          icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
          tips: [
            {
              icon: <Info className="w-4 h-4 text-blue-500" />,
              title: "Vue d'ensemble",
              description: "Consultez vos indicateurs clés en un coup d'œil"
            },
            {
              icon: <TrendingUp className="w-4 h-4 text-green-500" />,
              title: "Graphiques interactifs",
              description: "Analysez vos performances avec des graphiques détaillés"
            },
            {
              icon: <AlertCircle className="w-4 h-4 text-orange-500" />,
              title: "Alertes importantes",
              description: "Soyez notifié des factures en retard et des échéances"
            }
          ],
          quickActions: [
            "Créer une nouvelle facture",
            "Enregistrer un paiement",
            "Consulter les rapports"
          ]
        };

      case "treasury":
        return {
          title: "Gestion Trésorerie",
          icon: <TrendingUp className="w-5 h-5 text-indigo-600" />,
          tips: [
            {
              icon: <Info className="w-4 h-4 text-blue-500" />,
              title: "Suivi en temps réel",
              description: "Consultez vos soldes bancaires et mouvements de trésorerie en temps réel"
            },
            {
              icon: <TrendingUp className="w-4 h-4 text-green-500" />,
              title: "Rapprochement bancaire",
              description: "Rapprochez régulièrement vos comptes avec les relevés bancaires pour éviter les écarts"
            },
            {
              icon: <AlertCircle className="w-4 h-4 text-orange-500" />,
              title: "Prévisions de trésorerie",
              description: "Anticipez vos besoins de trésorerie pour éviter les découverts et optimiser votre gestion"
            }
          ],
          quickActions: [
            "Enregistrer un encaissement",
            "Enregistrer un décaissement",
            "Rapprochement bancaire",
            "Consulter les prévisions"
          ]
        };

      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div className="w-80 bg-gradient-to-b from-slate-50 to-white border-l border-slate-200 p-6 space-y-6 overflow-y-auto h-screen sticky top-0">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-200">
          {content.icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{content.title}</h3>
          <p className="text-xs text-slate-500">Aide et conseils</p>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700">Résumé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 capitalize">{key}:</span>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                  {value}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Conseils utiles
        </h4>
        {content.tips.map((tip, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{tip.icon}</div>
              <div className="flex-1">
                <h5 className="text-sm font-medium text-slate-900 mb-1">{tip.title}</h5>
                <p className="text-xs text-slate-600 leading-relaxed">{tip.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Actions rapides
        </h4>
        <div className="space-y-2">
          {content.quickActions.map((action, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100 text-sm text-slate-700 hover:from-blue-100 hover:to-indigo-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                {action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <h5 className="text-sm font-semibold text-indigo-900 mb-1">Besoin d'aide ?</h5>
            <p className="text-xs text-indigo-700 leading-relaxed mb-3">
              Consultez notre documentation ou contactez le support pour toute question.
            </p>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 underline">
              Voir la documentation →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextualSidebar;
