import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_ATLAS = 'mongodb+srv://devgroupentreprise_db_user:LWC5S7GRgfB2KN84@cluster-dga-1.xylzvke.mongodb.net/devgroup_compta';
const MONGODB_LOCAL = 'mongodb://localhost:27017/devgroup_compta';

const collections = [
  'users',
  'accounts',
  'journalentries',
  'clients',
  'suppliers',
  'invoices',
  'payments',
  'purchases',
  'bankaccounts',
  'transactions',
  'companysettings',
  'auditlogs'
];

async function syncFromAtlasToLocal() {
  console.log('\n📥 Synchronisation: Atlas → Local\n');
  
  // Connexion à Atlas
  const atlasConn = await mongoose.createConnection(MONGODB_ATLAS).asPromise();
  console.log('✅ Connecté à MongoDB Atlas');
  
  // Connexion à Local
  const localConn = await mongoose.createConnection(MONGODB_LOCAL).asPromise();
  console.log('✅ Connecté à MongoDB Local');
  
  for (const collectionName of collections) {
    try {
      console.log(`\n📦 Synchronisation de "${collectionName}"...`);
      
      // Récupérer les données d'Atlas
      const atlasCollection = atlasConn.collection(collectionName);
      const data = await atlasCollection.find({}).toArray();
      
      if (data.length === 0) {
        console.log(`   ⚠️  Collection vide, ignorée`);
        continue;
      }
      
      // Insérer dans Local (supprimer d'abord les anciennes données)
      const localCollection = localConn.collection(collectionName);
      await localCollection.deleteMany({});
      await localCollection.insertMany(data);
      
      console.log(`   ✅ ${data.length} documents synchronisés`);
    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
    }
  }
  
  await atlasConn.close();
  await localConn.close();
  
  console.log('\n✅ Synchronisation terminée!\n');
}

async function syncFromLocalToAtlas() {
  console.log('\n📤 Synchronisation: Local → Atlas\n');
  console.log('⚠️  ATTENTION: Cette opération va écraser les données sur Atlas!');
  console.log('⚠️  Assurez-vous d\'avoir une sauvegarde avant de continuer.\n');
  
  // Connexion à Local
  const localConn = await mongoose.createConnection(MONGODB_LOCAL).asPromise();
  console.log('✅ Connecté à MongoDB Local');
  
  // Connexion à Atlas
  const atlasConn = await mongoose.createConnection(MONGODB_ATLAS).asPromise();
  console.log('✅ Connecté à MongoDB Atlas');
  
  for (const collectionName of collections) {
    try {
      console.log(`\n📦 Synchronisation de "${collectionName}"...`);
      
      // Récupérer les données de Local
      const localCollection = localConn.collection(collectionName);
      const data = await localCollection.find({}).toArray();
      
      if (data.length === 0) {
        console.log(`   ⚠️  Collection vide, ignorée`);
        continue;
      }
      
      // Insérer dans Atlas (supprimer d'abord les anciennes données)
      const atlasCollection = atlasConn.collection(collectionName);
      await atlasCollection.deleteMany({});
      await atlasCollection.insertMany(data);
      
      console.log(`   ✅ ${data.length} documents synchronisés`);
    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
    }
  }
  
  await localConn.close();
  await atlasConn.close();
  
  console.log('\n✅ Synchronisation terminée!\n');
}

// Récupérer l'argument de la ligne de commande
const direction = process.argv[2];

console.log('\n🔄 Synchronisation des Bases de Données\n');

switch (direction) {
  case 'download':
  case 'pull':
  case 'atlas-to-local':
    syncFromAtlasToLocal().catch(console.error);
    break;
  case 'upload':
  case 'push':
  case 'local-to-atlas':
    syncFromLocalToAtlas().catch(console.error);
    break;
  default:
    console.log('Usage:');
    console.log('  npm run db:pull  - Télécharger les données d\'Atlas vers Local');
    console.log('  npm run db:push  - Envoyer les données de Local vers Atlas');
    console.log('');
}
