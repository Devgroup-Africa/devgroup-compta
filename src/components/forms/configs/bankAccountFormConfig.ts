export const bankAccountFormConfig = {
  steps: [
    {
      stepNumber: 1,
      title: 'Informations de base',
      description: 'Informations principales du compte',
      fields: [
        {
          name: 'name',
          label: 'Nom du compte',
          type: 'text',
          required: true,
          guide: {
            title: 'Nom du compte',
            description: 'Donnez un nom descriptif à votre compte bancaire',
            example: 'Compte Principal',
            tips: [
              'Utilisez un nom facile à identifier',
              'Exemple: "Compte Principal", "Compte Épargne", "Caisse"'
            ]
          },
          validation: [{ type: 'required', message: 'Le nom du compte est obligatoire' }]
        },
        {
          name: 'bank',
          label: 'Nom de la banque',
          type: 'text',
          required: true,
          guide: {
            title: 'Nom de la banque',
            description: 'Nom de l\'établissement bancaire',
            example: 'Afriland First Bank',
            tips: [
              'Nom complet de la banque',
              'Pour la caisse, indiquez "Caisse physique"'
            ]
          },
          validation: [{ type: 'required', message: 'Le nom de la banque est obligatoire' }]
        },
        {
          name: 'type',
          label: 'Type de compte',
          type: 'select',
          required: true,
          options: [
            { value: 'checking', label: 'Compte courant' },
            { value: 'savings', label: 'Compte épargne' },
            { value: 'business', label: 'Compte professionnel' }
          ],
          guide: {
            title: 'Type de compte',
            description: 'Sélectionnez le type de compte bancaire',
            tips: [
              'Compte courant: pour les opérations quotidiennes',
              'Compte épargne: pour l\'épargne',
              'Compte professionnel: compte dédié à l\'entreprise'
            ]
          },
          validation: [{ type: 'required', message: 'Le type de compte est obligatoire' }]
        },
        {
          name: 'currency',
          label: 'Devise',
          type: 'select',
          required: true,
          options: [
            { value: 'XAF', label: 'XAF (Franc CFA)' },
            { value: 'EUR', label: 'EUR (Euro)' },
            { value: 'USD', label: 'USD (Dollar)' }
          ],
          guide: {
            title: 'Devise du compte',
            description: 'Devise dans laquelle le compte est libellé',
            tips: [
              'XAF: Franc CFA (devise locale)',
              'EUR: Euro',
              'USD: Dollar américain'
            ]
          },
          validation: [{ type: 'required', message: 'La devise est obligatoire' }]
        }
      ]
    },
    {
      stepNumber: 2,
      title: 'Détails bancaires',
      description: 'Numéros de compte et solde initial',
      fields: [
        {
          name: 'accountNumber',
          label: 'Numéro de compte',
          type: 'text',
          required: true,
          guide: {
            title: 'Numéro de compte',
            description: 'Numéro unique du compte bancaire',
            example: 'CM21 1000 0000 0000 0000 0001',
            tips: [
              'Numéro fourni par votre banque',
              'Peut être au format IBAN ou numéro local',
              'Doit être unique dans le système'
            ]
          },
          validation: [{ type: 'required', message: 'Le numéro de compte est obligatoire' }]
        },
        {
          name: 'iban',
          label: 'IBAN (optionnel)',
          type: 'text',
          required: false,
          guide: {
            title: 'IBAN',
            description: 'International Bank Account Number',
            example: 'CM21 1000 0000 0000 0000 0001',
            tips: [
              'Format international du numéro de compte',
              'Nécessaire pour les virements internationaux',
              'Commence par le code pays (CM pour Cameroun)'
            ]
          }
        },
        {
          name: 'swift',
          label: 'Code SWIFT/BIC (optionnel)',
          type: 'text',
          required: false,
          guide: {
            title: 'Code SWIFT/BIC',
            description: 'Code d\'identification de la banque',
            example: 'AFRIXXXX',
            tips: [
              'Code international de la banque',
              'Nécessaire pour les virements internationaux',
              '8 ou 11 caractères'
            ]
          }
        },
        {
          name: 'initialBalance',
          label: 'Solde initial',
          type: 'number',
          required: true,
          guide: {
            title: 'Solde initial',
            description: 'Solde du compte au moment de sa création dans le système',
            example: '1000000',
            tips: [
              'Montant actuel sur le compte bancaire',
              'Le solde sera mis à jour automatiquement avec les transactions',
              'Utilisez 0 pour un nouveau compte vide'
            ]
          },
          validation: [
            { type: 'required', message: 'Le solde initial est obligatoire' },
            { type: 'min', value: 0, message: 'Le solde ne peut pas être négatif' }
          ]
        },
        {
          name: 'accountCode',
          label: 'Code comptable',
          type: 'text',
          required: false,
          guide: {
            title: 'Code comptable',
            description: 'Code du compte dans le plan comptable',
            example: '512',
            tips: [
              'Code 512: Banque',
              'Code 531: Caisse',
              'Laissez vide pour utiliser le code par défaut (512)'
            ]
          }
        }
      ]
    },
    {
      stepNumber: 3,
      title: 'Informations complémentaires',
      description: 'Description et statut du compte',
      fields: [
        {
          name: 'description',
          label: 'Description (optionnel)',
          type: 'textarea',
          required: false,
          guide: {
            title: 'Description',
            description: 'Notes ou informations supplémentaires sur le compte',
            example: 'Compte principal pour les opérations courantes de l\'entreprise',
            tips: [
              'Ajoutez des détails utiles pour identifier le compte',
              'Mentionnez l\'usage prévu du compte',
              'Ces informations sont visibles uniquement en interne'
            ]
          }
        },
        {
          name: 'isActive',
          label: 'Compte actif',
          type: 'checkbox',
          required: false,
          guide: {
            title: 'Statut du compte',
            description: 'Indique si le compte est actif ou non',
            tips: [
              'Cochez pour activer le compte',
              'Les comptes inactifs ne peuvent pas être utilisés pour de nouvelles transactions',
              'Utile pour archiver d\'anciens comptes sans les supprimer'
            ]
          }
        }
      ]
    },
    {
      stepNumber: 4,
      title: 'Vérification',
      description: 'Vérifiez toutes les informations avant de créer le compte',
      fields: []
    }
  ]
};
