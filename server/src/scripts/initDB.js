import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔗 Tentative de connexion à MongoDB Atlas...');
console.log('URI:', MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

const initDB = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connexion réussie à MongoDB Atlas!');
    
    // Obtenir la base de données
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`📊 Base de données: ${dbName}`);
    
    // Lister les collections existantes
    const collections = await db.listCollections().toArray();
    console.log(`📋 Collections existantes (${collections.length}):`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Créer les collections de base si elles n'existent pas
    const requiredCollections = [
      'users',
      'accounts', 
      'journalentries',
      'clients',
      'suppliers',
      'invoices',
      'payments',
      'bankaccounts',
      'transactions'
    ];
    
    console.log('\n🏗️  Création des collections manquantes...');
    
    for (const collectionName of requiredCollections) {
      const exists = collections.some(col => col.name === collectionName);
      
      if (!exists) {
        await db.createCollection(collectionName);
        console.log(`✅ Collection '${collectionName}' créée`);
      } else {
        console.log(`ℹ️  Collection '${collectionName}' existe déjà`);
      }
    }  hbb
    
    // Vérifier les collections après création
    const finalCollections = await db.listCollections().toArray();
    console.log(`\n📋 Collections finales (${finalCollections.length}):`);
    finalCollections.forEach(col => console.log(`   - ${col.name}`));
    
    console.log('\n🎉 Base de données initialisée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.name === 'MongoNetworkError') {
      console.error('🌐 Problème de réseau - Vérifiez votre connexion internet');
    } else if (error.name === 'MongoServerError') {
      console.error('🔐 Erreur serveur MongoDB - Vérifiez vos credentials');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
};

initDB();