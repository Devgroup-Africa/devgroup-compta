import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Invoice } from '../models/Invoice.js';
import { Transaction } from '../models/Transaction.js';
import { BankAccount } from '../models/BankAccount.js';
import { Client } from '../models/Client.js';
import { Payment } from '../models/Payment.js';

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer toutes les factures
    const invoices = await Invoice.find()
      .populate('client', 'name company')
      .populate('bankAccount', 'name accountNumber')
      .sort({ createdAt: -1 });

    console.log('📊 FACTURES:');
    console.log('='.repeat(80));
    invoices.forEach(inv => {
      console.log(`\nFacture: ${inv.number}`);
      console.log(`  Status: ${inv.status}`);
      console.log(`  Client: ${inv.client?.name || 'N/A'}`);
      console.log(`  Montant: ${inv.total} FCFA`);
      console.log(`  Compte bancaire: ${inv.bankAccount?.name || 'Aucun'}`);
      console.log(`  Date création: ${inv.createdAt}`);
    });

    // Récupérer toutes les transactions
    const transactions = await Transaction.find()
      .populate('bankAccount', 'name')
      .populate('invoice', 'number')
      .sort({ createdAt: -1 });

    console.log('\n\n💰 TRANSACTIONS:');
    console.log('='.repeat(80));
    transactions.forEach(txn => {
      console.log(`\nTransaction: ${txn._id}`);
      console.log(`  Type: ${txn.type}`);
      console.log(`  Montant: ${txn.amount} FCFA`);
      console.log(`  Description: ${txn.description}`);
      console.log(`  Compte bancaire: ${txn.bankAccount?.name || 'Aucun'}`);
      console.log(`  Facture: ${txn.invoice?.number || 'Aucune'}`);
      console.log(`  Status: ${txn.status}`);
      console.log(`  Date: ${txn.date}`);
    });

    // Récupérer tous les comptes bancaires
    const bankAccounts = await BankAccount.find({ isActive: true });

    console.log('\n\n🏦 COMPTES BANCAIRES:');
    console.log('='.repeat(80));
    bankAccounts.forEach(acc => {
      console.log(`\nCompte: ${acc.name}`);
      console.log(`  Numéro: ${acc.accountNumber}`);
      console.log(`  Solde initial: ${acc.initialBalance} FCFA`);
      console.log(`  Solde actuel: ${acc.currentBalance} FCFA`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

checkData();
