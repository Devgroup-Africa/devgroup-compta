export const getTransferFormConfig = (bankAccounts: any[] = []) => ({
  steps: [
    {
      stepNumber: 1,
      title: 'Sélection des comptes',
      description: 'Comptes source et destination',
      fields: [
        {
          name: 'sourceAccount',
          label: 'Compte source',
          type: 'select',
          required: true,
          options: bankAccounts.map((ba: any) => ({
            value: ba._id,
            label: `${ba.name} (${ba.bank}) - ${ba.currentBalance || 0} XAF`
          })),
          guide: {
            title: 'Compte source',
            description: 'Compte depuis lequel l\'argent sera débité',
            tips: [
              'Sélectionnez le compte à débiter',
              'Vérifiez que le solde est suffisant'
            ]
          },
          validation: [{ type: 'required', message: 'Le compte source est obligatoire' }]
        },
        {
          name: 'destinationAccount',
          label: 'Compte destination',
          type: 'select',
          required: true,
          options: bankAccounts.map((ba: any) => ({
            value: ba._id,
            label: `${ba.name} (${ba.bank})`
          })),
          guide: {
            title: 'Compte destination',
            description: 'Compte sur lequel l\'argent sera crédité',
            tips: [
              'Sélectionnez le compte à créditer',
              'Doit être différent du compte source'
            ]
          },
          validation: [{ type: 'required', message: 'Le compte destination est obligatoire' }]
        }
      ]
    },
    {
      stepNumber: 2,
      title: 'Détails du virement',
      description: 'Montant et informations',
      fields: [
        {
          name: 'amount',
          label: 'Montant',
          type: 'number',
          required: true,
          guide: {
            title: 'Montant du virement',
            description: 'Montant à transférer',
            example: '100000'
          },
          validation: [{ type: 'required', message: 'Le montant est obligatoire' }]
        },
        {
          name: 'date',
          label: 'Date',
          type: 'date',
          required: true,
          guide: {
            title: 'Date du virement',
            description: 'Date à laquelle le virement est effectué'
          },
          validation: [{ type: 'required', message: 'La date est obligatoire' }]
        },
        {
          name: 'reference',
          label: 'Référence (optionnel)',
          type: 'text',
          required: false,
          guide: {
            title: 'Référence du virement',
            description: 'Numéro de référence unique',
            example: 'VIR-202603-001'
          }
        },
        {
          name: 'description',
          label: 'Description (optionnel)',
          type: 'textarea',
          required: false,
          guide: {
            title: 'Description du virement',
            description: 'Motif ou raison du transfert',
            example: 'Approvisionnement compte épargne'
          }
        }
      ]
    },
    {
      stepNumber: 3,
      title: 'Vérification',
      description: 'Vérifiez toutes les informations',
      fields: []
    }
  ]
});

export default getTransferFormConfig;
