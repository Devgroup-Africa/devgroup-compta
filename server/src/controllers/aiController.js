import { asyncHandler } from '../middleware/validation.js';
import { Invoice } from '../models/Invoice.js';
import { Purchase } from '../models/Purchase.js';
import { Transaction } from '../models/Transaction.js';
import { BankAccount } from '../models/BankAccount.js';
import { Client } from '../models/Client.js';
import { Supplier } from '../models/Supplier.js';
import Groq from 'groq-sdk';

// Fonction pour obtenir l'instance Groq (lazy initialization)
let groqInstance = null;
const getGroq = () => {
  if (!groqInstance && process.env.GROQ_API_KEY) {
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return groqInstance;
};

// Fonction pour analyser les données financières
const analyzeFinancialData = async () => {
  const [invoices, purchases, transactions, bankAccounts, clients, suppliers] = await Promise.all([
    Invoice.find(),
    Purchase.find(),
    Transaction.find(),
    BankAccount.find(),
    Client.find(),
    Supplier.find()
  ]);

  // Calculs statistiques
  const totalRevenue = invoices
    .filter(inv => inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);
  
  const totalExpenses = purchases
    .filter(p => p.status !== 'cancelled')
    .reduce((sum, p) => sum + (p.total || 0), 0);

  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const pendingInvoices = invoices.filter(inv => ['sent', 'overdue'].includes(inv.status)).length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

  const totalCash = bankAccounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);

  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    totalCash,
    invoicesCount: invoices.length,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    purchasesCount: purchases.length,
    transactionsCount: transactions.length,
    incomeTransactionsCount: incomeTransactions.length,
    expenseTransactionsCount: expenseTransactions.length,
    clientsCount: clients.length,
    suppliersCount: suppliers.length,
    bankAccountsCount: bankAccounts.length
  };
};

// Fonction pour générer des suggestions basées sur les données
const generateSuggestions = (data) => {
  const suggestions = [];

  // Suggestion sur les factures en retard
  if (data.overdueInvoices > 0) {
    suggestions.push({
      type: 'warning',
      title: 'Factures en retard',
      message: `Vous avez ${data.overdueInvoices} facture(s) en retard. Pensez à relancer vos clients pour améliorer votre trésorerie.`
    });
  }

  // Suggestion sur la rentabilité
  if (data.netProfit < 0) {
    suggestions.push({
      type: 'alert',
      title: 'Attention à la rentabilité',
      message: `Vos dépenses (${data.totalExpenses.toLocaleString()} FCFA) dépassent vos revenus (${data.totalRevenue.toLocaleString()} FCFA). Analysez vos coûts.`
    });
  } else if (data.netProfit > 0) {
    suggestions.push({
      type: 'success',
      title: 'Bonne rentabilité',
      message: `Votre bénéfice net est de ${data.netProfit.toLocaleString()} FCFA. Continuez sur cette lancée !`
    });
  }

  // Suggestion sur la trésorerie
  if (data.totalCash < data.totalExpenses * 0.1) {
    suggestions.push({
      type: 'warning',
      title: 'Trésorerie faible',
      message: `Votre trésorerie (${data.totalCash.toLocaleString()} FCFA) est faible. Assurez-vous d'avoir suffisamment de liquidités.`
    });
  }

  // Suggestion sur les factures en attente
  if (data.pendingInvoices > data.paidInvoices) {
    suggestions.push({
      type: 'info',
      title: 'Factures en attente',
      message: `Vous avez plus de factures en attente (${data.pendingInvoices}) que payées (${data.paidInvoices}). Suivez vos encaissements.`
    });
  }

  return suggestions;
};

// Fonction pour générer une réponse intelligente
const generateAIResponse = async (message, data) => {
  const lowerMessage = message.toLowerCase();

  // Questions sur les factures
  if (lowerMessage.includes('facture') || lowerMessage.includes('invoice')) {
    if (lowerMessage.includes('combien') || lowerMessage.includes('nombre')) {
      return {
        type: 'analysis',
        message: `Vous avez actuellement ${data.invoicesCount} factures au total:\n- ${data.paidInvoices} payées\n- ${data.pendingInvoices} en attente\n- ${data.overdueInvoices} en retard\n\nVotre chiffre d'affaires total est de ${data.totalRevenue.toLocaleString()} FCFA.`
      };
    }
    if (lowerMessage.includes('retard') || lowerMessage.includes('overdue')) {
      return {
        type: 'analysis',
        message: `Vous avez ${data.overdueInvoices} facture(s) en retard. ${data.overdueInvoices > 0 ? 'Je vous recommande de relancer vos clients pour améliorer votre trésorerie.' : 'Excellent ! Continuez à suivre vos paiements.'}`
      };
    }
  }

  // Questions sur la trésorerie
  if (lowerMessage.includes('trésorerie') || lowerMessage.includes('cash') || lowerMessage.includes('argent')) {
    return {
      type: 'analysis',
      message: `Votre trésorerie actuelle est de ${data.totalCash.toLocaleString()} FCFA répartie sur ${data.bankAccountsCount} compte(s) bancaire(s).\n\nVous avez ${data.incomeTransactionsCount} entrées et ${data.expenseTransactionsCount} sorties d'argent.`
    };
  }

  // Questions sur la rentabilité
  if (lowerMessage.includes('rentabilité') || lowerMessage.includes('profit') || lowerMessage.includes('bénéfice')) {
    const profitMargin = data.totalRevenue > 0 ? ((data.netProfit / data.totalRevenue) * 100).toFixed(2) : 0;
    return {
      type: 'analysis',
      message: `Analyse de rentabilité:\n- Revenus: ${data.totalRevenue.toLocaleString()} FCFA\n- Dépenses: ${data.totalExpenses.toLocaleString()} FCFA\n- Bénéfice net: ${data.netProfit.toLocaleString()} FCFA\n- Marge bénéficiaire: ${profitMargin}%\n\n${data.netProfit > 0 ? 'Votre activité est rentable !' : 'Attention, vos dépenses dépassent vos revenus.'}`
    };
  }

  // Questions sur les achats
  if (lowerMessage.includes('achat') || lowerMessage.includes('dépense') || lowerMessage.includes('fournisseur')) {
    return {
      type: 'analysis',
      message: `Vous avez ${data.purchasesCount} achat(s) enregistré(s) pour un total de ${data.totalExpenses.toLocaleString()} FCFA.\n\nVous travaillez avec ${data.suppliersCount} fournisseur(s).`
    };
  }

  // Questions sur les clients
  if (lowerMessage.includes('client')) {
    return {
      type: 'analysis',
      message: `Vous avez ${data.clientsCount} client(s) enregistré(s) dans votre base.\n\nVous avez émis ${data.invoicesCount} facture(s) pour un montant total de ${data.totalRevenue.toLocaleString()} FCFA.`
    };
  }

  // Suggestions générales
  if (lowerMessage.includes('conseil') || lowerMessage.includes('suggestion') || lowerMessage.includes('recommandation')) {
    const suggestions = generateSuggestions(data);
    if (suggestions.length > 0) {
      const suggestionText = suggestions.map((s, i) => `${i + 1}. ${s.title}: ${s.message}`).join('\n\n');
      return {
        type: 'suggestion',
        message: `Voici mes recommandations:\n\n${suggestionText}`
      };
    }
    return {
      type: 'suggestion',
      message: 'Votre gestion comptable semble bien organisée ! Continuez à suivre régulièrement vos indicateurs financiers.'
    };
  }

  // Analyse globale
  if (lowerMessage.includes('analyse') || lowerMessage.includes('résumé') || lowerMessage.includes('situation')) {
    const suggestions = generateSuggestions(data);
    const suggestionText = suggestions.length > 0 
      ? '\n\nPoints d\'attention:\n' + suggestions.map((s, i) => `${i + 1}. ${s.message}`).join('\n')
      : '';

    return {
      type: 'analysis',
      message: `📊 Analyse de votre situation financière:\n\n💰 Trésorerie: ${data.totalCash.toLocaleString()} FCFA\n📈 Revenus: ${data.totalRevenue.toLocaleString()} FCFA\n📉 Dépenses: ${data.totalExpenses.toLocaleString()} FCFA\n💵 Bénéfice: ${data.netProfit.toLocaleString()} FCFA\n\n📄 Factures: ${data.invoicesCount} (${data.paidInvoices} payées, ${data.pendingInvoices} en attente, ${data.overdueInvoices} en retard)\n🛒 Achats: ${data.purchasesCount}\n👥 Clients: ${data.clientsCount}\n🏢 Fournisseurs: ${data.suppliersCount}${suggestionText}`
    };
  }

  // Réponse par défaut
  return {
    type: 'text',
    message: `Je peux vous aider avec:\n\n• Analyse de vos factures et paiements\n• Suivi de votre trésorerie\n• Analyse de rentabilité\n• Gestion des achats et fournisseurs\n• Conseils et recommandations\n\nPosez-moi une question spécifique ou demandez une "analyse" de votre situation !`
  };
};

// Endpoint principal du chat avec OpenAI
export const chat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message requis' });
  }

  try {
    // Analyser les données financières pour le contexte
    const financialData = await analyzeFinancialData();

    // Obtenir l'instance Groq
    const groq = getGroq();

    // Si Groq n'est pas configuré, utiliser le système de base
    if (!groq) {
      const response = await generateAIResponse(message, financialData);
      return res.json({
        message: response.message + '\n\n⚠️ Note: Pour des réponses plus intelligentes, configurez votre clé API Groq (gratuite).',
        type: response.type,
        data: financialData
      });
    }

    // Créer le contexte système avec les données financières
    const systemPrompt = `Tu es un assistant comptable IA expert pour une application de gestion financière. 

Voici les données financières actuelles de l'utilisateur:
- Trésorerie totale: ${financialData.totalCash.toLocaleString()} FCFA
- Revenus totaux: ${financialData.totalRevenue.toLocaleString()} FCFA
- Dépenses totales: ${financialData.totalExpenses.toLocaleString()} FCFA
- Bénéfice net: ${financialData.netProfit.toLocaleString()} FCFA
- Nombre de factures: ${financialData.invoicesCount} (${financialData.paidInvoices} payées, ${financialData.pendingInvoices} en attente, ${financialData.overdueInvoices} en retard)
- Nombre d'achats: ${financialData.purchasesCount}
- Nombre de clients: ${financialData.clientsCount}
- Nombre de fournisseurs: ${financialData.suppliersCount}
- Nombre de comptes bancaires: ${financialData.bankAccountsCount}

Tu dois:
1. Répondre en français
2. Être professionnel mais accessible
3. Utiliser ces données pour donner des conseils personnalisés
4. Aider avec la comptabilité, la gestion financière, les questions fiscales
5. Donner des recommandations basées sur les données réelles
6. Expliquer les concepts comptables de manière simple

Tu peux répondre à des questions générales sur la comptabilité, mais privilégie toujours l'analyse des données réelles de l'utilisateur.`;

    // Construire l'historique des messages pour OpenAI
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Ajouter l'historique de conversation
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }

    // Ajouter le message actuel
    messages.push({
      role: 'user',
      content: message
    });

    // Appeler Groq (compatible avec l'API OpenAI)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Modèle gratuit et puissant de Groq
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const aiResponse = completion.choices[0].message.content;

    // Déterminer le type de réponse
    let responseType = 'text';
    if (aiResponse.includes('analyse') || aiResponse.includes('statistique') || aiResponse.includes('données')) {
      responseType = 'analysis';
    } else if (aiResponse.includes('conseil') || aiResponse.includes('recommandation') || aiResponse.includes('suggestion')) {
      responseType = 'suggestion';
    }

    res.json({
      message: aiResponse,
      type: responseType,
      data: financialData
    });
  } catch (error) {
    console.error('AI Error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Si l'API Groq n'est pas configurée, quota dépassé, ou clé invalide, utiliser le système de base
    if (error.code === 'invalid_api_key' || 
        error.code === 'insufficient_quota' || 
        error.status === 429 ||
        !process.env.GROQ_API_KEY) {
      try {
        const response = await generateAIResponse(message, await analyzeFinancialData());
        return res.json({
          message: response.message + '\n\n⚠️ Note: Assistant IA de base activé (Groq non configuré ou quota dépassé).',
          type: response.type,
          data: await analyzeFinancialData()
        });
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        return res.status(500).json({ 
          message: 'Erreur lors de l\'analyse des données.',
          type: 'error'
        });
      }
    }
    
    res.status(500).json({ 
      message: 'Désolé, je rencontre un problème technique. Veuillez réessayer.',
      type: 'error'
    });
  }
});
