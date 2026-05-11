import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Invoice } from '../models/Invoice.js';
import { Transaction } from '../models/Transaction.js';
import { BankAccount } from '../models/BankAccount.js';
import { User } from '../models/User.js';
import { Payment } from '../models/Payment.js';

dotenv.config();

const assignBankAccountToInvoices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver le compte "Factures"
    const facturesAccount = await BankAccount.findOne({ name: 'Factures' });
    if (!facturesAccount) {
      console.error('❌ Compte "Factures" non trouvé');
      process.exit(1);
    }

    console.log(`📦 Compte trouvé: ${facturesAccount.name} (${facturesAccount._id})\n`);

    // Récupérer toutes les factures payées sans compte bancaire
    const paidInvoicesWithoutAccount = await Invoice.find({ 
      status: 'paid',
      $or: [
        { bankAccount: { $exists: false } },
        { bankAccount: null }
      ]
    });

    console.log(`📊 ${paidInvoicesWithoutAccount.length} factures payées sans compte bancaire trouvées\n`);

    // Récupérer un utilisateur admin pour créer les transactions
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ Aucun utilisateur admin trouvé');
      process.exit(1);
    }

    let updated = 0;
    let transactionsCreated = 0;
    let errors = 0;

    for (const invoice of paidInvoicesWithoutAccount) {
      try {
        console.log(`\n📝 Traitement facture ${invoice.number}...`);
        
        // Assigner le compte bancaire à la facture
        invoice.bankAccount = facturesAccount._id;
        await invoice.save();
        console.log(`  ✅ Compte bancaire assigné`);
        updated++;

        // Vérifier si une transaction existe déjà
        const existingTransaction = await Transaction.findOne({ invoice: invoice._id });
        
        if (existingTransaction) {
          console.log(`  ⏭️  Transaction déjà existante`);
        } else {
          // Créer la transaction
          const transaction = await Transaction.create({
            type: 'income',
            amount: invoice.total,
            date: invoice.updatedAt || invoice.issueDate,
            description: `Paiement facture ${invoice.number}`,
            category: 'Ventes',
            bankAccount: facturesAccount._id,
            invoice: invoice._id,
            createdBy: adminUser._id,
            status: 'confirmed'
          });

          console.log(`  ✅ Transaction créée: ${transaction.amount} FCFA`);
          transactionsCreated++;
        }

      } catch (error) {
        console.error(`  ❌ Erreur pour facture ${invoice.number}:`, error.message);
        errors++;
      }
    }

    // Mettre à jour le solde du compte "Factures"
    console.log('\n\n📊 Mise à jour du solde du compte "Factures"...');
    try {
      await facturesAccount.calculateBalance();
      await facturesAccount.save();
      console.log(`✅ Solde mis à jour: ${facturesAccount.currentBalance} FCFA`);
    } catch (error) {
      console.error(`❌ Erreur mise à jour solde:`, error.message);
    }

    console.log('\n\n📈 Résumé:');
    console.log('='.repeat(80));
    console.log(`   ✅ Factures mises à jour: ${updated}`);
    console.log(`   ✅ Transactions créées: ${transactionsCreated}`);
    console.log(`   ❌ Erreurs: ${errors}`);
    console.log(`   📊 Total factures traitées: ${paidInvoicesWithoutAccount.length}`);
    console.log(`   💰 Nouveau solde compte "Factures": ${facturesAccount.currentBalance} FCFA`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

assignBankAccountToInvoices();
