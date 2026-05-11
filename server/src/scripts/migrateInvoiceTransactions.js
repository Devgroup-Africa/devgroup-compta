import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Invoice } from '../models/Invoice.js';
import { Transaction } from '../models/Transaction.js';
import { BankAccount } from '../models/BankAccount.js';
import { User } from '../models/User.js';
import { Payment } from '../models/Payment.js';

dotenv.config();

const migrateInvoiceTransactions = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB');

    // Récupérer toutes les factures payées
    const paidInvoices = await Invoice.find({ 
      status: 'paid',
      bankAccount: { $exists: true, $ne: null }
    }).populate('bankAccount');

    console.log(`📊 ${paidInvoices.length} factures payées trouvées avec un compte bancaire`);

    // Récupérer un utilisateur admin pour créer les transactions
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ Aucun utilisateur admin trouvé');
      process.exit(1);
    }

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const invoice of paidInvoices) {
      try {
        // Vérifier si une transaction existe déjà pour cette facture
        const existingTransaction = await Transaction.findOne({ invoice: invoice._id });
        
        if (existingTransaction) {
          console.log(`⏭️  Transaction déjà existante pour facture ${invoice.number}`);
          skipped++;
          continue;
        }

        // Créer la transaction
        const transaction = await Transaction.create({
          type: 'income',
          amount: invoice.total,
          date: invoice.updatedAt || invoice.issueDate,
          description: `Paiement facture ${invoice.number}`,
          category: 'Ventes',
          bankAccount: invoice.bankAccount._id,
          invoice: invoice._id,
          createdBy: adminUser._id,
          status: 'confirmed'
        });

        console.log(`✅ Transaction créée pour facture ${invoice.number} - ${invoice.total} FCFA`);
        created++;

      } catch (error) {
        console.error(`❌ Erreur pour facture ${invoice.number}:`, error.message);
        errors++;
      }
    }

    // Mettre à jour les soldes de tous les comptes bancaires
    console.log('\n📊 Mise à jour des soldes des comptes bancaires...');
    const bankAccounts = await BankAccount.find({ isActive: true });
    
    for (const account of bankAccounts) {
      try {
        await account.calculateBalance();
        await account.save();
        console.log(`✅ Solde mis à jour pour ${account.name}: ${account.currentBalance} FCFA`);
      } catch (error) {
        console.error(`❌ Erreur mise à jour solde ${account.name}:`, error.message);
      }
    }

    console.log('\n📈 Résumé de la migration:');
    console.log(`   ✅ Transactions créées: ${created}`);
    console.log(`   ⏭️  Transactions ignorées (déjà existantes): ${skipped}`);
    console.log(`   ❌ Erreurs: ${errors}`);
    console.log(`   📊 Total factures traitées: ${paidInvoices.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
};

// Exécuter la migration
migrateInvoiceTransactions();
