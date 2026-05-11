import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../../.env');

const MONGODB_ATLAS = 'mongodb+srv://devgroupentreprise_db_user:LWC5S7GRgfB2KN84@cluster-dga-1.xylzvke.mongodb.net/devgroup_compta';
const MONGODB_LOCAL = 'mongodb://localhost:27017/devgroup_compta';

function switchToLocal() {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Commenter Atlas, décommenter Local
  envContent = envContent.replace(
    /^MONGODB_URI=mongodb\+srv:\/\/.+$/m,
    '# MONGODB_URI=mongodb+srv://devgroupentreprise_db_user:LWC5S7GRgfB2KN84@cluster-dga-1.xylzvke.mongodb.net/devgroup_compta'
  );
  
  envContent = envContent.replace(
    /^# MONGODB_URI=mongodb:\/\/localhost.+$/m,
    'MONGODB_URI=mongodb://localhost:27017/devgroup_compta'
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Basculé vers MongoDB LOCAL');
  console.log('📍 Base de données: mongodb://localhost:27017/devgroup_compta');
  console.log('⚠️  Redémarrez le serveur pour appliquer les changements');
}

function switchToAtlas() {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Décommenter Atlas, commenter Local
  envContent = envContent.replace(
    /^# MONGODB_URI=mongodb\+srv:\/\/.+$/m,
    'MONGODB_URI=mongodb+srv://devgroupentreprise_db_user:LWC5S7GRgfB2KN84@cluster-dga-1.xylzvke.mongodb.net/devgroup_compta'
  );
  
  envContent = envContent.replace(
    /^MONGODB_URI=mongodb:\/\/localhost.+$/m,
    '# MONGODB_URI=mongodb://localhost:27017/devgroup_compta'
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Basculé vers MongoDB ATLAS (Cloud)');
  console.log('📍 Base de données: MongoDB Atlas');
  console.log('⚠️  Redémarrez le serveur pour appliquer les changements');
}

function showCurrent() {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^MONGODB_URI=(.+)$/m);
  
  if (match) {
    const uri = match[1];
    if (uri.includes('localhost')) {
      console.log('📍 Base de données actuelle: LOCAL (mongodb://localhost:27017/devgroup_compta)');
    } else if (uri.includes('mongodb+srv')) {
      console.log('📍 Base de données actuelle: ATLAS (Cloud)');
    }
  }
}

// Récupérer l'argument de la ligne de commande
const command = process.argv[2];

console.log('\n🔄 Gestionnaire de Base de Données\n');

switch (command) {
  case 'local':
    switchToLocal();
    break;
  case 'atlas':
  case 'cloud':
    switchToAtlas();
    break;
  case 'status':
  case 'current':
    showCurrent();
    break;
  default:
    console.log('Usage:');
    console.log('  npm run db:local   - Basculer vers MongoDB local');
    console.log('  npm run db:atlas   - Basculer vers MongoDB Atlas (cloud)');
    console.log('  npm run db:status  - Voir la base de données actuelle');
    console.log('');
    showCurrent();
}

console.log('');
