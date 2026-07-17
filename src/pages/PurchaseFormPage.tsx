import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useError } from '@/contexts/ErrorContext';
import api from '@/services/api';
import { ArrowLeft, Plus, Trash2, FileText } from 'lucide-react';

interface PurchaseItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PurchaseForm {
  supplier: string;
  bankAccount: string;
  date: string;
  dueDate: string;
  items: PurchaseItem[];
  taxRate: number;
  notes: string;
  status: string;
  attachment?: string;
  attachmentName?: string;
}

export default function PurchaseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showError } = useError();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  
  const [form, setForm] = useState<PurchaseForm>({
    supplier: '',
    bankAccount: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    taxRate: 18,
    notes: '',
    status: 'pending',
    attachment: '',
    attachmentName: ''
  });

  useEffect(() => {
    loadSuppliers();
    loadBankAccounts();
    if (id && id !== 'creer') {
      loadPurchase();
    }
  }, [id]);

  const loadSuppliers = async () => {
    try {
      const response = await api.getSuppliers();
      const responseData = response.data as { suppliers?: any[] } | any[];
      const suppliersData = Array.isArray(responseData) ? responseData : (responseData?.suppliers || []);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setSuppliers([]);
    }
  };

  const loadBankAccounts = async () => {
    try {
      const response = await api.getBankAccounts();
      const responseData = response.data as { bankAccounts?: any[] } | any[];
      const bankAccountsData = Array.isArray(responseData) ? responseData : (responseData?.bankAccounts || []);
      setBankAccounts(Array.isArray(bankAccountsData) ? bankAccountsData : []);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      setBankAccounts([]);
    }
  };

  const loadPurchase = async () => {
    try {
      setLoading(true);
      const response = await api.getPurchaseById(id!);
      const purchase = response.data as any; 
      setForm({
        supplier: purchase.supplier?._id || '',
        bankAccount: purchase.bankAccount?._id || '',
        date: purchase.date.split('T')[0],
        dueDate: purchase.dueDate ? purchase.dueDate.split('T')[0] : '',
        items: purchase.items,
        taxRate: purchase.taxRate,
        notes: purchase.notes || '',
        status: purchase.status,
        attachment: purchase.attachment || '',
        attachmentName: purchase.attachmentName || ''
      });
    } catch (error) {
      console.error('Error loading purchase:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la facture',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (form.items.length > 1) {
      setForm({
        ...form,
        items: form.items.filter((_, i) => i !== index)
      });
    }
  };

  const calculateTotals = () => {
    const subtotal = form.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (form.taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.bankAccount) {
      showError('Veuillez sélectionner un compte bancaire', 'Champ requis');
      return;
    }

    if (form.items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      showError('Veuillez remplir tous les articles correctement', 'Articles invalides');
      return;
    }

    try {
      setSaving(true);
      const { subtotal, taxAmount, total } = calculateTotals();
      
      const purchaseData = {
        ...form,
        supplier: form.supplier || null,
        subtotal,
        taxAmount,
        total
      };

      if (id && id !== 'creer') {
        await api.updatePurchase(id, purchaseData);
        toast({
          title: 'Succès',
          description: 'Facture mise à jour avec succès'
        });
      } else {
        await api.createPurchase(purchaseData);
        toast({
          title: 'Succès',
          description: 'Facture créée avec succès'
        });
      }
      
      navigate('/achats');
    } catch (error: any) {
      console.error('Error saving purchase:', error);
      showError(
        error.message || 'Impossible de sauvegarder la facture',
        'Erreur de sauvegarde'
      );
    } finally {
      setSaving(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/achats')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {id && id !== 'creer' ? 'Modifier la facture' : 'Nouvelle facture fournisseur'}
          </h1>
          <p className="text-muted-foreground">Enregistrez les achats et dépenses</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Fournisseur</Label>
                <select
                  id="supplier"
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Aucun fournisseur</option>
                  {Array.isArray(suppliers) && suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name} {supplier.company ? `(${supplier.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount">Compte bancaire *</Label>
                <select
                  id="bankAccount"
                  value={form.bankAccount}
                  onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                  className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">Sélectionner un compte</option>
                  {Array.isArray(bankAccounts) && bankAccounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name} ({account.currentBalance.toLocaleString()} FCFA)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Date d&apos;échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="draft">Brouillon</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Articles</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un article
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.items.map((item, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-muted/30 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs text-muted-foreground">Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Ex: Hébergement web mensuel"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Quantité *</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Prix unitaire *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 min-w-[120px]">
                  <Label className="text-xs text-muted-foreground">Total</Label>
                  <div className="font-semibold text-lg pt-1.5">{item.total.toLocaleString()} FCFA</div>
                </div>
                {form.items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="mt-7 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="border-t pt-4 space-y-3 bg-muted/20 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-medium">{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">TVA</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.taxRate}
                    onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-16 h-8 text-center"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
                <span className="font-medium">{taxAmount.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total</span>
                <span className="text-primary">{total.toLocaleString()} FCFA</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes additionnelles..."
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pièce jointe</CardTitle>
            <p className="text-sm text-muted-foreground">Joindre la facture du fournisseur (PDF, image, etc.)</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('attachment-upload')?.click()}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                {form.attachment ? 'Changer le fichier' : 'Téléverser un fichier'}
              </Button>
              <input
                id="attachment-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      showError('Le fichier est trop volumineux (max 5MB)', 'Fichier trop grand');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setForm({ 
                        ...form, 
                        attachment: reader.result as string,
                        attachmentName: file.name
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
            
            {form.attachment && form.attachmentName && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{form.attachmentName}</div>
                    <div className="text-xs text-muted-foreground">
                      {(form.attachment.length * 0.75 / 1024).toFixed(0)} KB
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setForm({ ...form, attachment: '', attachmentName: '' })}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t -mx-6 -mb-6">
          <Button type="button" variant="outline" onClick={() => navigate('/achats')}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving} className="min-w-[120px]">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
