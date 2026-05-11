export const getTransactionFormConfig = (bankAccounts: any[] = [], accounts: any[] = []) => ({
  steps: [
    {
      stepNumber: 1,
      title: 'Détails de la transaction',
      description: 'Informations principales',
      fields: [
        {
          name: 'type',
          label: 'Type de transaction',
          type: 'select',
          required: true,
          options: [
            { value: 'income', label: 'Recette (Entrée d\'argent)' },
            { value: 'expense', label: 'Dépense (Sortie d\'argent)' }
          ],
          guide: {
            title: 'Type de transaction',
            description: 'Sélectionnez le type d\'opération',
            tips: [
              'Recette: argent qui entre dans votre compte (ventes, services, etc.)',
              'Dépense: argent qui sort de votre compte (achats, salaires, etc.)'
            ]
          },
          validation: [{ type: 'required', message: 'Le type de transaction est obligatoire' }]
        },
        {
          name: 'amount',
          label: 'Montant',
          type: 'number',
          required: true,
          guide: {
            title: 'Montant de la transaction',
            description: 'Montant en devise du compte',
            example: '50000',
            tips: [
              'Entrez le montant sans le signe + ou -',
              'Le type (recette/dépense) détermine le sens'
            ]
          },
          validation: [
            { type: 'required', message: 'Le montant est obligatoire' }
          ]
        },
        {
          name: 'description',
          label: 'Description',
          type: 'text',
          required: true,
          guide: {
            title: 'Description de la transaction',
            description: 'Décrivez brièvement l\'opération',
            example: 'Paiement facture FA-202603-001'
          },
          validation: [{ type: 'required', message: 'La description est obligatoire' }]
        },
        {
          name: 'category',
          label: 'Catégorie',
          type: 'text',
          required: true,
          guide: {
            title: 'Catégorie de transaction',
            description: 'Classez votre transaction'
          },
          validation: [{ type: 'required', message: 'La catégorie est obligatoire' }]
        },
        {
          name: 'date',
          label: 'Date',
          type: 'date',
          required: true,
          guide: {
            title: 'Date de la transaction',
            description: 'Date à laquelle l\'opération a eu lieu'
          },
          validation: [{ type: 'required', message: 'La date est obligatoire' }]
        },
        {
          name: 'reference',
          label: 'Référence (optionnel)',
          type: 'text',
          required: false,
          guide: {
            title: 'Référence',
            description: 'Numéro de référence de l\'opération',
            example: 'FA-202603-001'
          }
        }
      ]
    },
    {
      stepNumber: 2,
      title: 'Comptes',
      description: 'Sélection des comptes',
      fields: [
        {
          name: 'bankAccount',
          label: 'Compte bancaire',
          type: 'select',
          required: false,
          options: bankAccounts.map((ba: any) => ({
            value: ba._id,
            label: `${ba.name} (${ba.bank})`
          })),
          guide: {
            title: 'Compte bancaire',
            description: 'Compte sur lequel l\'opération est effectuée'
          }
        },
        {
          name: 'account',
          label: 'Compte comptable',
          type: 'select',
          required: true,
          options: accounts.map((acc: any) => ({
            value: acc._id,
            label: `${acc.code} - ${acc.name}`
          })),
          guide: {
            title: 'Compte comptable',
            description: 'Compte du plan comptable pour l\'imputation'
          },
          validation: [{ type: 'required', message: 'Le compte comptable est obligatoire' }]
        }
      ]
    },
    {
      stepNumber: 3,
      title: 'Notes',
      description: 'Informations complémentaires',
      fields: [
        {
          name: 'notes',
          label: 'Notes (optionnel)',
          type: 'textarea',
          required: false,
          guide: {
            title: 'Notes internes',
            description: 'Informations complémentaires sur la transaction'
          }
        }
      ]
    },
    {
      stepNumber: 4,
      title: 'Vérification',
      description: 'Vérifiez toutes les informations',
      fields: []
    }
  ]
});


export default getTransactionFormConfig;
