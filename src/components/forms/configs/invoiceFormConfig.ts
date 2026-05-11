export const invoiceFormConfig = {
  steps: [
    {
      stepNumber: 1,
      title: 'Informations de l\'entreprise',
      description: 'Renseignez les informations de votre entreprise',
      fields: [
        {
          name: 'companyInfo',
          label: 'Informations de l\'entreprise',
          type: 'companyInfo',
          required: false,
          guide: {
            title: 'Informations de l\'entreprise',
            description: 'Ces informations apparaîtront sur vos factures',
            tips: [
              'Tous les champs sont optionnels',
              'Le logo peut être téléchargé ou saisi via URL',
              'Ces informations seront sauvegardées pour vos prochaines factures'
            ]
          }
        }
      ]
    },
    {
      stepNumber: 2,
      title: 'Client et dates',
      description: 'Sélectionnez le client et les dates',
      fields: [
        {
          name: 'object',
          label: 'Objet de la facture',
          type: 'text',
          required: false,
          guide: {
            title: 'Objet de la facture',
            description: 'Décrivez brièvement l\'objet de cette facture',
            example: 'Formation React et TypeScript',
            tips: ['Ce champ est optionnel', 'Il aide à identifier rapidement la facture']
          }
        },
        {
          name: 'clientId',
          label: 'Client',
          type: 'select',
          required: true,
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
            example: new Date().toISOString().split('T')[0],
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
            tips: ['Doit être postérieure à la date d\'émission', 'Standard: 30 jours après émission']
          },
          validation: [{ type: 'required', message: 'La date d\'échéance est obligatoire' }]
        },
        {
          name: 'bankAccountId',
          label: 'Compte bancaire',
          type: 'select',
          required: false,
          guide: {
            title: 'Compte bancaire de destination',
            description: 'Sélectionnez le compte bancaire sur lequel l\'argent sera transféré',
            tips: ['Ce compte sera utilisé pour créer automatiquement une transaction lors du paiement', 'Optionnel - peut être défini plus tard']
          }
        }
      ]
    },
    {
      stepNumber: 3,
      title: 'Articles et montants',
      description: 'Ajoutez les articles de la facture',
      fields: [
        {
          name: 'items',
          label: 'Articles',
          type: 'items',
          required: true,
          guide: {
            title: 'Articles de la facture',
            description: 'Ajoutez les produits ou services facturés au client',
            tips: [
              'Cliquez sur "Ajouter un article" pour commencer',
              'Remplissez la description, quantité et prix unitaire pour chaque article',
              'Ajoutez une description détaillée pour plus de clarté (optionnel)',
              'Le total de chaque ligne se calcule automatiquement',
              'Vous pouvez ajouter autant d\'articles que nécessaire'
            ]
          },
          validation: [
            { 
              type: 'required', 
              message: 'Ajoutez au moins un article à la facture',
              validator: (value: any[]) => value && value.length > 0
            }
          ]
        },
        {
          name: 'taxRate',
          label: 'Taux de TVA (%)',
          type: 'number',
          required: false,
          guide: {
            title: 'Taux de TVA',
            description: 'Taux de taxe sur la valeur ajoutée appliqué',
            example: '19.25',
            tips: [
              'Taux standard au Cameroun: 19.25%',
              'Utilisez 0% pour les produits/services exonérés',
              'La TVA est calculée sur le montant après remise'
            ]
          }
        },
        {
          name: 'discountRate',
          label: 'Remise (%)',
          type: 'number',
          required: false,
          guide: {
            title: 'Remise globale',
            description: 'Pourcentage de remise appliqué sur le sous-total',
            example: '5',
            tips: [
              'La remise s\'applique sur le sous-total HT',
              'Laissez à 0 si aucune remise',
              'La TVA est calculée après application de la remise'
            ]
          }
        }
      ]
    },
    {
      stepNumber: 4,
      title: 'Informations de paiement',
      description: 'Ajoutez vos méthodes de paiement',
      fields: [
        {
          name: 'paymentInfo',
          label: 'Méthodes de paiement',
          type: 'paymentInfo',
          required: false,
          guide: {
            title: 'Informations de paiement',
            description: 'Ajoutez vos comptes Mobile Money et bancaires',
            tips: [
              'Ces informations seront affichées sur la facture',
              'Vous pouvez ajouter plusieurs méthodes de paiement',
              'Tous les champs sont optionnels'
            ]
          }
        }
      ]
    },
    {
      stepNumber: 5,
      title: 'Notes et conditions',
      description: 'Ajoutez des informations complémentaires',
      fields: [
        {
          name: 'notes',
          label: 'Notes internes',
          type: 'textarea',
          required: false,
          guide: {
            title: 'Notes internes',
            description: 'Notes visibles uniquement par votre équipe',
            example: 'Facture pour le projet XYZ - Phase 1',
            tips: [
              'Ces notes ne sont PAS visibles sur la facture client',
              'Utilisez-les pour des rappels internes',
              'Mentionnez des détails sur le contexte de la facture'
            ]
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
            example: 'Paiement à 30 jours net.\nPénalités de retard: 10% par mois de retard.\nEscompte de 2% pour paiement sous 8 jours.',
            tips: [
              'Ces conditions SONT visibles sur la facture client',
              'Incluez les modalités de paiement acceptées',
              'Mentionnez les pénalités de retard si applicable',
              'Indiquez les escomptes pour paiement anticipé'
            ]
          }
        }
      ]
    },
    {
      stepNumber: 6,
      title: 'Vérification',
      description: 'Vérifiez toutes les informations avant de créer la facture',
      fields: []
    }
  ]
};
