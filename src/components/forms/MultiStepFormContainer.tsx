import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormStep from './FormStep';
import LivePreviewPanel from './LivePreviewPanel';
import StepNavigator from './StepNavigator';
import { FormConfiguration, MultiStepFormState, FormFieldConfig } from './types';
import { formatXAF } from '@/data/mockData';

interface MultiStepFormContainerProps<T> {
  formType: 'client' | 'supplier' | 'invoice' | 'journalEntry' | 'bankAccount' | 'transaction' | 'transfer';
  initialData?: T;
  onSubmit: (data: T) => Promise<void>;
  onCancel: () => void;
  config?: Partial<FormConfiguration<T>> | { steps: any[] };
}

const MultiStepFormContainer = <T,>({
  formType,
  initialData,
  onSubmit,
  onCancel,
  config
}: MultiStepFormContainerProps<T>) => {
  const { toast } = useToast();
  const [state, setState] = useState<MultiStepFormState<T>>({
    currentStep: 1,
    formData: initialData || ({} as T),
    errors: {},
    isSubmitting: false,
    isDirty: false
  });
  const [focusedField, setFocusedField] = useState<string | undefined>(undefined);
  const [clients, setClients] = useState<Array<{ value: string; label: string }>>([]);

  // Load clients for invoice form
  useEffect(() => {
    if (formType === 'invoice') {
      loadClients();
    }
  }, [formType]);

  const loadClients = async () => {
    try {
      const response = await apiService.getClients();
      const clientList = response.data?.clients || response.data || [];
      setClients(clientList.map((client: any) => ({
        value: client._id,
        label: client.name
      })));
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  // Default configurations for each form type
  const getDefaultConfig = useCallback(() => {
    const configs: Record<string, any> = {
    client: {
      steps: [
        {
          stepNumber: 1,
          title: 'Informations du client',
          description: 'Saisissez les informations de base du client',
          fields: [
            {
              name: 'name',
              label: 'Nom complet',
              type: 'text',
              required: true,
              guide: {
                title: 'Nom du client',
                description: 'Entrez le nom complet du client ou de l\'entreprise',
                example: 'Jean Dupont ou SARL Dupont',
                tips: [
                  'Utilisez le nom officiel pour les entreprises',
                  'Vérifiez l\'orthographe avant de continuer'
                ]
              },
              validation: [
                { type: 'required', message: 'Le nom est obligatoire' },
                { type: 'min', value: 2, message: 'Le nom doit contenir au moins 2 caractères' }
              ]
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              required: false,
              guide: {
                title: 'Adresse email',
                description: 'Email de contact principal du client',
                example: 'contact@exemple.com'
              },
              validation: [{ type: 'email', message: 'Email invalide' }]
            },
            {
              name: 'phone',
              label: 'Téléphone',
              type: 'text',
              required: false,
              guide: {
                title: 'Numéro de téléphone',
                description: 'Téléphone de contact du client',
                example: '+237 6XX XXX XXX',
                tips: ['Format: +237 suivi du numéro']
              }
            },
            {
              name: 'company',
              label: 'Entreprise',
              type: 'text',
              required: false,
              guide: {
                title: 'Nom de l\'entreprise',
                description: 'Nom de l\'entreprise si différent du nom du client',
                example: 'SARL Dupont ou SAS Jean Dupont'
              }
            },
            {
              name: 'address.street',
              label: 'Rue',
              type: 'text',
              required: false,
              guide: {
                title: 'Adresse postale',
                description: 'Adresse complète du client',
                example: '123 Rue de la Paix'
              }
            },
            {
              name: 'address.city',
              label: 'Ville',
              type: 'text',
              required: false,
              guide: {
                title: 'Ville',
                description: 'Ville du client',
                example: 'Douala'
              }
            },
            {
              name: 'address.country',
              label: 'Pays',
              type: 'text',
              required: false,
              guide: {
                title: 'Pays',
                description: 'Pays du client',
                example: 'Cameroun'
              }
            },
            {
              name: 'paymentTerms',
              label: 'Délai de paiement',
              type: 'number',
              required: false,
              guide: {
                title: 'Délai de paiement (jours)',
                description: 'Nombre de jours accordés au client pour payer',
                example: '30',
                tips: ['Standard: 30 jours', 'Peut varier selon le client']
              }
            },
            {
              name: 'creditLimit',
              label: 'Limite de crédit',
              type: 'number',
              required: false,
              guide: {
                title: 'Limite de crédit',
                description: 'Montant maximum de crédit accordé au client',
                example: '1000000',
                tips: ['0 pour aucune limite', 'Montant en XAF']
              }
            },
            {
              name: 'taxNumber',
              label: 'Numéro fiscal',
              type: 'text',
              required: false,
              guide: {
                title: 'Numéro fiscal',
                description: 'Numéro d\'identification fiscale du client',
                example: 'M051234567890A'
              }
            }
          ]
        },
        {
          stepNumber: 2,
          title: 'Vérification',
          description: 'Vérifiez les informations avant de créer le client',
          fields: []
        }
      ]
    },
    supplier: {
      steps: [
        {
          stepNumber: 1,
          title: 'Informations du fournisseur',
          description: 'Saisissez les informations de base du fournisseur',
          fields: [
            {
              name: 'name',
              label: 'Nom complet',
              type: 'text',
              required: true,
              guide: {
                title: 'Nom du fournisseur',
                description: 'Entrez le nom complet du fournisseur',
                example: 'Jean Dupont',
                tips: ['Nom commercial ou nom personnel']
              },
              validation: [
                { type: 'required', message: 'Le nom est obligatoire' },
                { type: 'min', value: 2, message: 'Le nom doit contenir au moins 2 caractères' }
              ]
            },
            {
              name: 'company',
              label: 'Entreprise',
              type: 'text',
              required: true,
              guide: {
                title: 'Nom de l\'entreprise',
                description: 'Nom de l\'entreprise du fournisseur',
                example: 'SARL Dupont',
                tips: ['Obligatoire pour les entreprises']
              },
              validation: [{ type: 'required', message: 'L\'entreprise est obligatoire' }]
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              required: false,
              guide: {
                title: 'Adresse email',
                description: 'Email de contact du fournisseur',
                example: 'contact@fournisseur.com'
              },
              validation: [{ type: 'email', message: 'Email invalide' }]
            },
            {
              name: 'phone',
              label: 'Téléphone',
              type: 'text',
              required: false,
              guide: {
                title: 'Numéro de téléphone',
                description: 'Téléphone du fournisseur',
                example: '+237 6XX XXX XXX'
              }
            },
            {
              name: 'taxNumber',
              label: 'Numéro fiscal',
              type: 'text',
              required: false,
              guide: {
                title: 'Numéro fiscal',
                description: 'Numéro d\'identification fiscale',
                example: 'M051234567890A'
              }
            },
            {
              name: 'paymentTerms',
              label: 'Délai de paiement',
              type: 'number',
              required: false,
              guide: {
                title: 'Délai de paiement (jours)',
                description: 'Nombre de jours pour payer les factures',
                example: '30'
              }
            },
            {
              name: 'address.street',
              label: 'Rue',
              type: 'text',
              required: false,
              guide: {
                title: 'Adresse postale',
                description: 'Adresse complète du fournisseur',
                example: '123 Avenue de l\'Indépendance'
              }
            },
            {
              name: 'address.city',
              label: 'Ville',
              type: 'text',
              required: false,
              guide: {
                title: 'Ville',
                description: 'Ville du fournisseur',
                example: 'Douala'
              }
            },
            {
              name: 'address.country',
              label: 'Pays',
              type: 'text',
              required: false,
              guide: {
                title: 'Pays',
                description: 'Pays du fournisseur',
                example: 'Cameroun'
              }
            },
            {
              name: 'bankDetails.bankName',
              label: 'Banque',
              type: 'text',
              required: false,
              guide: {
                title: 'Nom de la banque',
                description: 'Nom de la banque du fournisseur',
                example: 'Afriland First Bank'
              }
            },
            {
              name: 'bankDetails.accountNumber',
              label: 'Numéro de compte',
              type: 'text',
              required: false,
              guide: {
                title: 'Numéro de compte',
                description: 'Numéro de compte bancaire',
                example: '10001-12345-67890'
              }
            }
          ]
        },
        {
          stepNumber: 2,
          title: 'Vérification',
          description: 'Vérifiez les informations avant de créer le fournisseur',
          fields: []
        }
      ]
    },
    invoice: {
      steps: [
        {
          stepNumber: 1,
          title: 'Détails de la facture',
          description: 'Saisissez les informations de la facture',
          fields: [
            {
              name: 'clientId',
              label: 'Client',
              type: 'select',
              required: true,
              options: clients,
              guide: {
                title: 'Sélectionner un client',
                description: 'Choisissez le client pour lequel vous créez la facture',
                tips: ['Sélectionnez un client existant', 'Créez un nouveau client si nécessaire']
              },
              validation: [{ type: 'required', message: 'Veuillez sélectionner un client' }]
            },
            {
              name: 'issueDate',
              label: 'Date d\'émission',
              type: 'date',
              required: true,
              guide: {
                title: 'Date d\'émission',
                description: 'Date à laquelle la facture est émise',
                tips: ['Généralement la date actuelle', 'Ne peut pas être dans le futur']
              },
              validation: [{ type: 'required', message: 'La date d\'émission est obligatoire' }]
            },
            {
              name: 'dueDate',
              label: 'Date d\'échéance',
              type: 'date',
              required: true,
              guide: {
                title: 'Date d\'échéance',
                description: 'Date limite de paiement de la facture',
                tips: ['Doit être postérieure à la date d\'émission', 'Standard: 30 jours']
              },
              validation: [{ type: 'required', message: 'La date d\'échéance est obligatoire' }]
            },
            {
              name: 'taxRate',
              label: 'Taux de TVA',
              type: 'number',
              required: false,
              guide: {
                title: 'Taux de TVA',
                description: 'Taux de taxe appliqué aux articles',
                example: '19.25',
                tips: ['Standard: 19.25%', '0% pour les exemptions']
              }
            },
            {
              name: 'discountRate',
              label: 'Remise',
              type: 'number',
              required: false,
              guide: {
                title: 'Remise',
                description: 'Remise globale sur la facture',
                example: '5',
                tips: ['Pourcentage de remise', 'Laissez à 0 pour aucune remise']
              }
            },
            {
              name: 'notes',
              label: 'Notes internes',
              type: 'textarea',
              required: false,
              guide: {
                title: 'Notes internes',
                description: 'Notes visibles uniquement par votre équipe',
                example: 'Facture pour projet spécifique'
              }
            },
            {
              name: 'terms',
              label: 'Conditions de paiement',
              type: 'textarea',
              required: false,
              guide: {
                title: 'Conditions de paiement',
                description: 'Conditions visibles sur la facture envoyée au client',
                example: 'Paiement à 30 jours net',
                tips: ['Inclure les modalités de paiement', 'Mentionner les pénalités de retard']
              }
            }
          ]
        },
        {
          stepNumber: 2,
          title: 'Vérification',
          description: 'Vérifiez les informations avant de créer la facture',
          fields: []
        }
      ]
    },
    journalEntry: {
      steps: [
        {
          stepNumber: 1,
          title: 'Détails de l\'écriture',
          description: 'Saisissez les informations de l\'écriture comptable',
          fields: [
            {
              name: 'date',
              label: 'Date',
              type: 'date',
              required: true,
              guide: {
                title: 'Date de l\'écriture',
                description: 'Date à laquelle l\'écriture est enregistrée',
                tips: ['Date de la transaction', 'Ne peut pas être dans le futur']
              },
              validation: [{ type: 'required', message: 'La date est obligatoire' }]
            },
            {
              name: 'reference',
              label: 'Référence',
              type: 'text',
              required: true,
              guide: {
                title: 'Référence de l\'écriture',
                description: 'Numéro ou référence unique de l\'écriture',
                example: 'JE-001',
                tips: ['Format: JE-XXXX', 'Doit être unique']
              },
              validation: [{ type: 'required', message: 'La référence est obligatoire' }]
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              required: true,
              guide: {
                title: 'Description de l\'écriture',
                description: 'Description détaillée de la transaction',
                example: 'Paiement des salaires du mois de mars',
                tips: ['Soyez précis', 'Mentionnez les détails importants']
              },
              validation: [{ type: 'required', message: 'La description est obligatoire' }]
            }
          ]
        },
        {
          stepNumber: 2,
          title: 'Vérification',
          description: 'Vérifiez les informations avant de créer l\'écriture',
          fields: []
        }
      ]
    }
  };

  return configs;
}, [clients]);

  const currentConfig = config || getDefaultConfig()[formType];
  const currentStepConfig = currentConfig.steps.find((s: any) => s.stepNumber === state.currentStep);

  // Validation functions
  const validateField = useCallback((field: FormFieldConfig, value: any): string | undefined => {
    if (field.validation) {
      for (const rule of field.validation) {
        if (rule.type === 'required' && (!value || value === '')) {
          return rule.message;
        }
        if (rule.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return rule.message;
        }
        if (rule.type === 'min' && value && String(value).length < rule.value) {
          return rule.message;
        }
        if (rule.type === 'max' && value && String(value).length > rule.value) {
          return rule.message;
        }
        if (rule.validator && !rule.validator(value)) {
          return rule.message;
        }
      }
    }
    return undefined;
  }, []);

  const validateStep = useCallback((stepFields: FormFieldConfig[], formData: T): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    stepFields.forEach(field => {
      const value = (formData as any)[field.name];
      const error = validateField(field, value);
      if (error) {
        errors[field.name] = error;
      }
    });
    
    return errors;
  }, [validateField]);

  const validateAllFields = useCallback((formData: T): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    currentConfig.steps.forEach(step => {
      step.fields.forEach(field => {
        const value = (formData as any)[field.name];
        const error = validateField(field, value);
        if (error) {
          errors[field.name] = error;
        }
      });
    });
    
    return errors;
  }, [currentConfig, validateField]);

  // Handle field changes
  const handleFieldChange = useCallback((field: string, value: any) => {
    setState(prev => {
      // Create a deep copy of formData to avoid mutation issues
      const newData = JSON.parse(JSON.stringify(prev.formData || {})) as any;
      
      // Handle nested fields (e.g., address.street)
      if (field.includes('.')) {
        const parts = field.split('.');
        let current = newData;
        
        // Navigate to the parent object, creating nested objects as needed
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        // Set the value
        current[parts[parts.length - 1]] = value;
      } else {
        newData[field] = value;
      }
      
      return {
        ...prev,
        formData: newData as T,
        isDirty: true
      };
    });
  }, []);

  // Handle field focus
  const handleFieldFocus = useCallback((field: string) => {
    setFocusedField(field);
  }, []);

  // Handle field blur
  const handleFieldBlur = useCallback((field: string) => {
    const fieldConfig = currentConfig.steps
      .flatMap((s: any) => s.fields)
      .find((f: any) => f.name === field);
    
    if (fieldConfig) {
      const error = validateField(fieldConfig, (state.formData as any)[field]);
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: error }
      }));
    }
    setFocusedField(undefined);
  }, [currentConfig, state.formData, validateField]);

  // Handle next step
  const handleNext = useCallback(() => {
    if (!currentStepConfig) return;
    
    const stepErrors = validateStep(currentStepConfig.fields, state.formData);
    
    if (Object.keys(stepErrors).length > 0) {
      setState(prev => ({ ...prev, errors: stepErrors }));
      return;
    }
    
    setState(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1,
      errors: {}
    }));
  }, [currentStepConfig, state.formData, validateStep]);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1)
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    const allErrors = validateAllFields(state.formData);
    
    if (Object.keys(allErrors).length > 0) {
      setState(prev => ({ ...prev, errors: allErrors }));
      toast({
        title: "Erreurs de validation",
        description: "Veuillez corriger les erreurs dans le formulaire.",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await onSubmit(state.formData);
      toast({
        title: "Succès",
        description: "Enregistrement effectué avec succès"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.formData, validateAllFields, onSubmit, toast]);

  // Check if can proceed to next step
  const canProceed = currentStepConfig 
    ? Object.keys(validateStep(currentStepConfig.fields, state.formData)).length === 0
    : false;

  // Check if can go back
  const canGoBack = state.currentStep > 1;

  return (
    <div className="grid grid-cols-12 gap-6 min-h-screen">
      {/* Zone de guides contextuels à gauche */}
      <div className="col-span-3 space-y-4">
        <div className="sticky top-6">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">💡</span>
                Aide contextuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              {focusedField ? (
                (() => {
                  const fieldConfig = currentConfig.steps
                    .flatMap((s: any) => s.fields)
                    .find((f: any) => f.name === focusedField);
                  
                  if (fieldConfig?.guide) {
                    return (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            {fieldConfig.guide.title}
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {fieldConfig.guide.description}
                          </p>
                        </div>
                        
                        {fieldConfig.guide.example && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                              💡 Exemple
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                              {fieldConfig.guide.example}
                            </p>
                          </div>
                        )}
                        
                        {fieldConfig.guide.tips && fieldConfig.guide.tips.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              ✓ Conseils
                            </p>
                            <ul className="space-y-1">
                              {fieldConfig.guide.tips.map((tip, index) => (
                                <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                  <span className="text-blue-500 mt-0.5">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  return (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      Aucune aide disponible pour ce champ
                    </p>
                  );
                })()
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  Cliquez sur un champ pour voir l'aide contextuelle
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Formulaire au centre */}
      <div className="col-span-5 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          {currentStepConfig && (
            <FormStep
              stepNumber={currentStepConfig.stepNumber}
              title={currentStepConfig.title}
              fields={currentStepConfig.fields}
              formData={state.formData}
              errors={state.errors}
              onChange={handleFieldChange}
              onFocus={handleFieldFocus}
              onBlur={handleFieldBlur}
              focusedField={focusedField}
            />
          )}
        </div>

        <StepNavigator
          currentStep={state.currentStep}
          totalSteps={currentConfig.steps.length}
          canProceed={canProceed}
          canGoBack={canGoBack}
          isSubmitting={state.isSubmitting}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </div>

      {/* Aperçu à droite */}
      <div className="col-span-4">
        <div className="sticky top-6">
          <LivePreviewPanel
            formType={formType}
            formData={state.formData}
            currentStep={state.currentStep}
            changedFields={Object.keys(state.errors).length > 0 ? Object.keys(state.errors) : undefined}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default MultiStepFormContainer;
