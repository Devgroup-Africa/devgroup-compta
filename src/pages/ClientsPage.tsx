import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import ClientForm from "@/components/forms/ClientForm";
import ContextualSidebar from "@/components/ContextualSidebar";
import { apiService } from "@/services/api";
import { formatXAF } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, Mail, Phone, Building, User, Eye, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Client {
  _id: string;
  clientType?: "particulier" | "entreprise" | "administration" | "association";
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  totalInvoiced: number;
  totalPaid: number;
  currentBalance: number;
  isActive: boolean;
  paymentTerms: number;
  creditLimit: number;
}

const ClientsPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await apiService.getClients({
        search: searchTerm || undefined,
      });
      
      if (response.data) {
        // Handle the nested response structure from backend
        const clientsData = response.data.clients || response.data || [];
        setClients(Array.isArray(clientsData) ? clientsData : []);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les clients",
        variant: "destructive",
      });
      setClients([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadClients();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleCreateClient = () => {
    setSelectedClient(null);
    setShowForm(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      await apiService.deleteClient(clientToDelete._id);
      toast({
        title: "Succès",
        description: "Client supprimé avec succès",
      });
      loadClients();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le client",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setClientToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedClient(null);
    loadClients();
  };

  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.company?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Clients" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Si le formulaire est affiché, afficher uniquement le formulaire
  if (showForm) {
    return (
      <div className="space-y-6">
        <ClientForm
          client={selectedClient}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 space-y-6">
        <PageHeader title="Clients" description="Gestion de vos clients et prospects">
          <Button onClick={handleCreateClient}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </Button>
        </PageHeader>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par nom, entreprise ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des clients */}
      <div className="grid gap-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                {clients.length === 0 ? "Aucun client trouvé" : "Aucun client ne correspond à la recherche"}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {client.clientType && client.clientType !== "particulier" ? (
                          <Building className="w-5 h-5 text-primary" />
                        ) : (
                          <User className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        {client.company && (
                          <p className="text-sm text-gray-600">{client.company}</p>
                        )}
                      </div>
                      <Badge variant={client.isActive ? "default" : "secondary"}>
                        {client.isActive ? "Actif" : "Inactif"}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {client.clientType || (client.company ? "entreprise" : "particulier")}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}

                      <div className="text-sm">
                        <span className="text-gray-600">Total facturé: </span>
                        <span className="font-medium">{formatXAF(client.totalInvoiced)}</span>
                      </div>

                      <div className="text-sm">
                        <span className="text-gray-600">Solde: </span>
                        <span className={`font-medium ${client.currentBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {formatXAF(client.currentBalance)}
                        </span>
                      </div>
                    </div>

                    {client.address?.city && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{client.address.city}{client.address.country && `, ${client.address.country}`}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/clients/${client._id}`)}
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClient(client)}
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClient(client)}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le client "{clientToDelete?.name}" ? 
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={confirmDelete}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Statistiques */}
      {clients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{clients.length}</div>
                <div className="text-sm text-gray-600">Total clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {clients.filter(c => c.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Clients actifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatXAF(clients.reduce((sum, c) => sum + c.totalInvoiced, 0))}
                </div>
                <div className="text-sm text-gray-600">Total facturé</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatXAF(clients.reduce((sum, c) => sum + c.currentBalance, 0))}
                </div>
                <div className="text-sm text-gray-600">Solde total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    
    {/* Temporairement désactivé */}
    {/* <ContextualSidebar 
      type="clients" 
      stats={{
        total: clients.length,
        actifs: clients.filter(c => c.isActive).length,
        "total facturé": formatXAF(clients.reduce((sum, c) => sum + c.totalInvoiced, 0)),
        "solde total": formatXAF(clients.reduce((sum, c) => sum + c.currentBalance, 0))
      }}
    /> */}
  </div>
  );
};

export default ClientsPage;
