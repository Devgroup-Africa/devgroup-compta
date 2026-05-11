import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Importer tous les modèles pour créer les collections
import { User } from '../models/User.js';
import { Account } from '../models/Account.js';
import { JournalEntry } from '../models/JournalEntry.js';
import { Client } from '../models/Client.js';
import { Supplier } from '../models/Supplier.js';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { BankAccount } from '../models/BankAccount.js';
import { Transaction } from '../models/Transaction.js';

const setupDatabase = async () => {
  try {
    console.log('🔗 Connexion à MongoDB Atlas...');
    console.log('URL:', process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connexion à MongoDB Atlas établie');
    
    // Créer les collections en insérant un document temporaire puis en le supprimant
    const collections = [
      { name: 'users', model: User },
      { name: 'accounts', model: Account },
      { name: 'journalentries', model: JournalEntry },
      { name: 'clients', model: Client },
      { name: 'suppliers', model: Supplier },
      { name: 'invoices', model: Invoice },
      { name: 'payments', model: Payment },
      { name: 'bankaccounts', model: BankAccount },
      { name: 'transactions', model: Transaction }
    ];
    
    console.log('📊 Création des collections...');
    
    for (const collection of collections) {
      try {
        // Vérifier si la collection existe déjà
        const exists = await mongoose.connection.db.listCollections({ name: collection.name }).hasNext();
        
        if (!exists) {
          // Créer la collection en insérant puis supprimant un document temporaire
          const tempDoc = new collection.model({});
          await tempDoc.validate().catch(() => {}); // Ignorer les erreurs de validation
          
          // Créer la collection avec les index
          await mongoose.connection.db.createCollection(collection.name);
          console.log(`✅ Collection '${collection.name}' créée`);
        } else {
          console.log(`ℹ️  Collection '${collection.name}' existe déjà`);
        }
        
        // Créer les index pour cette collection
        await collection.model.createIndexes();
        
      } catch (error) {
        console.log(`⚠️  Erreur pour la collection '${collection.name}':`, error.message);
      }
    }
    
    console.log('🎉 Toutes les collections ont été créées avec succès!');
    
    // Afficher les collections créées
    const collectionsList = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Collections dans la base de données:');
    collectionsList.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des collections:', error.message);
    
    if (error.name === 'MongoNetworkError') {
      console.error('🔗 Vérifiez votre connexion internet et les credentials MongoDB Atlas');
    } else if (error.name === 'MongoServerError' && error.code === 8000) {
      console.error('🔐 Erreur d\'authentification - Vérifiez vos credentials MongoDB');
    }
    
    return false;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
};

// Exécuter le script si appelé directement
if (process.argv[1] === new URL(import.meta.url).pathname) {
  setupDatabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default setupDatabase;