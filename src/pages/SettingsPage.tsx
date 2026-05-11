import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import api from '@/services/api';
import { Building2, FileText, CreditCard, Plus, Trash2, AlertCircle } from 'lucide-react';

interface MobileMoneyAccount {
  provider: string;
  number: string;
  name: string;
}

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  taxId: string;
  registrationNumber: string;
  taxRate: number;
  currency: string;
  invoicePrefix: string;
  invoiceStartNumber: number;
  paymentTerms: number;
  mobileMoneyAccounts: MobileMoneyAccount[];
  bankAccounts: BankAccount[];
  description?: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { refreshSettings } = useCompanySettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<CompanySettings>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    taxId: '',
    registrationNumber: '',
    taxRate: 18,
    currency: 'FCFA',
    invoicePrefix: 'INV',
    invoiceStartNumber: 1,
    paymentTerms: 30,
    mobileMoneyAccounts: [],
    bankAccounts: [],
    description: ''
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getCompanySettings();
      // Backend returns { settings: {...} } so we need to extract it
      const data = (response.data as any)?.settings || response.data as CompanySettings;
      setSettings({
        name: data.name || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        logo: data.logo || '',
        taxId: data.taxId || '',
        registrationNumber: data.registrationNumber || '',
        taxRate: data.taxRate || 18,
        currency: data.currency || 'FCFA',
        invoicePrefix: data.invoicePrefix || 'INV',
        invoiceStartNumber: data.invoiceStartNumber || 1,
        paymentTerms: data.paymentTerms || 30,
        mobileMoneyAccounts: data.mobileMoneyAccounts || [],
        bankAccounts: data.bankAccounts || [],
        description: data.description || ''
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paramètres',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!settings.name.trim()) {
      newErrors.name = "Le nom de l'entreprise est requis";
    }

    if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (settings.phone && !/^[\d\s+\-()]+$/.test(settings.phone)) {
      newErrors.phone = 'Format de téléphone invalide';
    }

    if (settings.taxRate < 0 || settings.taxRate > 100) {
      newErrors.taxRate = 'Le taux de TVA doit être entre 0 et 100';
    }

    if (settings.paymentTerms < 0) {
      newErrors.paymentTerms = 'Les conditions de paiement doivent être positives';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez corriger les erreurs dans le formulaire',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      await api.updateCompanySettings(settings);
      
      // Rafraîchir les paramètres dans le contexte global
      await refreshSettings();
      
      toast({
        title: 'Succès',
        description: 'Paramètres enregistrés avec succès'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'enregistrer les paramètres",
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CompanySettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addMobileMoneyAccount = () => {
    setSettings(prev => ({
      ...prev,
      mobileMoneyAccounts: [...prev.mobileMoneyAccounts, { provider: '', number: '', name: '' }]
    }));
  };

  const removeMobileMoneyAccount = (index: number) => {
    setSettings(prev => ({
      ...prev,
      mobileMoneyAccounts: prev.mobileMoneyAccounts.filter((_, i) => i !== index)
    }));
  };

  const updateMobileMoneyAccount = (index: number, field: keyof MobileMoneyAccount, value: string) => {
    setSettings(prev => ({
      ...prev,
      mobileMoneyAccounts: prev.mobileMoneyAccounts.map((acc, i) =>
        i === index ? { ...acc, [field]: value } : acc
      )
    }));
  };

  const addBankAccount = () => {
    setSettings(prev => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, { bankName: '', accountNumber: '', accountName: '' }]
    }));
  };

  const removeBankAccount = (index: number) => {
    setSettings(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter((_, i) => i !== index)
    }));
  };

  const updateBankAccount = (index: number, field: keyof BankAccount, value: string) => {
    setSettings(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((acc, i) =>
        i === index ? { ...acc, [field]: value } : acc
      )
    }));
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paramètres de l&apos;entreprise</h1>
          <p className="text-muted-foreground mt-1">
            Configurez les informations de votre entreprise
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>

      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Veuillez corriger les erreurs dans le formulaire avant d&apos;enregistrer.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="about" className="space-y-6">
        <TabsList>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            À propos
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Informations générales
          </TabsTrigger>
          <TabsTrigger value="invoicing" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Facturation
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Modes de paiement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l&apos;entreprise</CardTitle>
              <CardDescription>
                Vue d&apos;ensemble de votre entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.logo && (
                <div className="flex justify-center">
                  <img
                    src={settings.logo}
                    alt="Logo"
                    className="h-24 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-muted-foreground">Nom de l&apos;entreprise</Label>
                  <p className="text-lg font-semibold mt-1">{settings.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="text-lg font-semibold mt-1">{settings.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Téléphone</Label>
                  <p className="text-lg font-semibold mt-1">{settings.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Site web</Label>
                  <p className="text-lg font-semibold mt-1">{settings.website || '-'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Adresse</Label>
                  <p className="text-lg font-semibold mt-1">{settings.address || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">IFU</Label>
                  <p className="text-lg font-semibold mt-1">{settings.taxId || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">RCCM</Label>
                  <p className="text-lg font-semibold mt-1">{settings.registrationNumber || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description du module comptable</CardTitle>
              <CardDescription>
                Décrivez votre système comptable et son utilisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Ex: Module de comptabilité pour la gestion des factures, achats, trésorerie et suivi des paiements..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Cette description vous aide à documenter l&apos;utilisation de votre système comptable
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l&apos;entreprise</CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur vos factures et documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nom de l&apos;entreprise <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: SARL TechCorp"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@entreprise.com"
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+226 XX XX XX XX"
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    value={settings.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.entreprise.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Adresse complète de l'entreprise"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Numéro d&apos;identification fiscale (IFU)</Label>
                  <Input
                    id="taxId"
                    value={settings.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    placeholder="Ex: 00012345A"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Numéro RCCM</Label>
                  <Input
                    id="registrationNumber"
                    value={settings.registrationNumber}
                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    placeholder="Ex: BF-OUA-01-2023-B12-00123"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo de l&apos;entreprise</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo"
                    value={settings.logo}
                    onChange={(e) => handleInputChange('logo', e.target.value)}
                    placeholder="https://exemple.com/logo.png ou téléversez un fichier"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Téléverser
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          toast({
                            title: 'Erreur',
                            description: 'Le fichier est trop volumineux (max 2MB)',
                            variant: 'destructive'
                          });
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleInputChange('logo', reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Entrez une URL ou téléversez une image (max 2MB)
                </p>
                {settings.logo && (
                  <div className="mt-2 flex items-center gap-4">
                    <img
                      src={settings.logo}
                      alt="Logo"
                      className="h-16 w-16 object-contain border rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange('logo', '')}
                    >
                      Supprimer
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoicing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration de la facturation</CardTitle>
              <CardDescription>
                Paramètres par défaut pour vos factures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    placeholder="FCFA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Taux de TVA (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.taxRate}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                    className={errors.taxRate ? 'border-destructive' : ''}
                  />
                  {errors.taxRate && (
                    <p className="text-sm text-destructive">{errors.taxRate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Délai de paiement (jours)</Label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    min="0"
                    value={settings.paymentTerms}
                    onChange={(e) => handleInputChange('paymentTerms', parseInt(e.target.value) || 0)}
                    className={errors.paymentTerms ? 'border-destructive' : ''}
                  />
                  {errors.paymentTerms && (
                    <p className="text-sm text-destructive">{errors.paymentTerms}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Préfixe des factures</Label>
                  <Input
                    id="invoicePrefix"
                    value={settings.invoicePrefix}
                    onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                    placeholder="INV"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ex: INV-001, INV-002, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceStartNumber">Numéro de départ</Label>
                  <Input
                    id="invoiceStartNumber"
                    type="number"
                    min="1"
                    value={settings.invoiceStartNumber}
                    onChange={(e) => handleInputChange('invoiceStartNumber', parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Première facture: {settings.invoicePrefix}-{String(settings.invoiceStartNumber).padStart(3, '0')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comptes Mobile Money</CardTitle>
              <CardDescription>
                Ajoutez vos comptes Mobile Money pour les afficher sur les factures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(settings.mobileMoneyAccounts || []).map((account, index) => (
                <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Opérateur</Label>
                      <Input
                        value={account.provider}
                        onChange={(e) => updateMobileMoneyAccount(index, 'provider', e.target.value)}
                        placeholder="Ex: Orange Money"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Numéro</Label>
                      <Input
                        value={account.number}
                        onChange={(e) => updateMobileMoneyAccount(index, 'number', e.target.value)}
                        placeholder="Ex: +226 XX XX XX XX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nom du compte</Label>
                      <Input
                        value={account.name}
                        onChange={(e) => updateMobileMoneyAccount(index, 'name', e.target.value)}
                        placeholder="Ex: Entreprise SARL"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMobileMoneyAccount(index)}
                    className="mt-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addMobileMoneyAccount}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un compte Mobile Money
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comptes bancaires</CardTitle>
              <CardDescription>
                Ajoutez vos comptes bancaires pour les afficher sur les factures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(settings.bankAccounts || []).map((account, index) => (
                <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Banque</Label>
                      <Input
                        value={account.bankName}
                        onChange={(e) => updateBankAccount(index, 'bankName', e.target.value)}
                        placeholder="Ex: Coris Bank"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Numéro de compte</Label>
                      <Input
                        value={account.accountNumber}
                        onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)}
                        placeholder="Ex: BF123456789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nom du compte</Label>
                      <Input
                        value={account.accountName}
                        onChange={(e) => updateBankAccount(index, 'accountName', e.target.value)}
                        placeholder="Ex: Entreprise SARL"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBankAccount(index)}
                    className="mt-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addBankAccount}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un compte bancaire
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
