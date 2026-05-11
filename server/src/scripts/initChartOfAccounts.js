import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Account } from '../models/Account.js';
import { User } from '../models/User.js';

dotenv.config();

const chartOfAccounts = [
  // CLASSE 1 - COMPTES DE CAPITAUX
  { code: '101', name: 'Capital social', type: 'equity' },
  { code: '106', name: 'Réserves', type: 'equity' },
  { code: '110', name: 'Report à nouveau', type: 'equity' },
  { code: '120', name: 'Résultat de l\'exercice', type: 'equity' },
  { code: '164', name: 'Emprunts auprès des établissements de crédit', type: 'liability' },
  { code: '168', name: 'Autres emprunts et dettes assimilées', type: 'liability' },
  
  // CLASSE 2 - COMPTES D'IMMOBILISATIONS
  { code: '211', name: 'Terrains', type: 'asset' },
  { code: '213', name: 'Constructions', type: 'asset' },
  { code: '215', name: 'Installations techniques, matériel et outillage industriels', type: 'asset' },
  { code: '218', name: 'Autres immobilisations corporelles', type: 'asset' },
  { code: '221', name: 'Immobilisations incorporelles', type: 'asset' },
  
  // CLASSE 3 - COMPTES DE STOCKS
  { code: '311', name: 'Matières premières', type: 'asset' },
  { code: '321', name: 'Matières consommables', type: 'asset' },
  { code: '331', name: 'En-cours de production de biens', type: 'asset' },
  { code: '351', name: 'Produits finis', type: 'asset' },
  { code: '371', name: 'Marchandises', type: 'asset' },
  
  // CLASSE 4 - COMPTES DE TIERS
  { code: '401', name: 'Fournisseurs', type: 'liability' },
  { code: '403', name: 'Fournisseurs - Effets à payer', type: 'liability' },
  { code: '408', name: 'Fournisseurs - Factures non parvenues', type: 'liability' },
  { code: '409', name: 'Fournisseurs débiteurs', type: 'asset' },
  { code: '411', name: 'Clients', type: 'asset' },
  { code: '413', name: 'Clients - Effets à recevoir', type: 'asset' },
  { code: '416', name: 'Clients douteux ou litigieux', type: 'asset' },
  { code: '418', name: 'Clients - Produits non encore facturés', type: 'asset' },
  { code: '419', name: 'Clients créditeurs', type: 'liability' },
  { code: '421', name: 'Personnel - Rémunérations dues', type: 'liability' },
  { code: '428', name: 'Personnel - Charges à payer et produits à recevoir', type: 'liability' },
  { code: '431', name: 'Sécurité sociale', type: 'liability' },
  { code: '437', name: 'Autres organismes sociaux', type: 'liability' },
  { code: '441', name: 'État - Subventions à recevoir', type: 'asset' },
  { code: '445', name: 'État - TVA collectée', type: 'liability' },
  { code: '446', name: 'État - TVA déductible', type: 'asset' },
  { code: '447', name: 'État - Autres taxes sur le chiffre d\'affaires', type: 'liability' },
  { code: '451', name: 'Associés - Comptes courants', type: 'liability' },
  { code: '455', name: 'Associés - Dividendes à payer', type: 'liability' },
  { code: '467', name: 'Autres comptes débiteurs ou créditeurs', type: 'asset' },
  
  // CLASSE 5 - COMPTES FINANCIERS
  { code: '512', name: 'Banques', type: 'asset' },
  { code: '513', name: 'Chèques postaux', type: 'asset' },
  { code: '514', name: 'Chèques à encaisser', type: 'asset' },
  { code: '515', name: 'Caisses d\'épargne', type: 'asset' },
  { code: '516', name: 'Autres organismes financiers', type: 'asset' },
  { code: '518', name: 'Intérêts courus', type: 'asset' },
  { code: '519', name: 'Concours bancaires courants', type: 'liability' },
  { code: '531', name: 'Caisse', type: 'asset' },
  { code: '532', name: 'Régie d\'avances et accréditifs', type: 'asset' },
  
  // CLASSE 6 - COMPTES DE CHARGES
  { code: '601', name: 'Achats de matières premières', type: 'expense' },
  { code: '602', name: 'Achats de matières et fournitures consommables', type: 'expense' },
  { code: '606', name: 'Achats non stockés de matières et fournitures', type: 'expense' },
  { code: '607', name: 'Achats de marchandises', type: 'expense' },
  { code: '611', name: 'Sous-traitance générale', type: 'expense' },
  { code: '613', name: 'Locations', type: 'expense' },
  { code: '614', name: 'Charges locatives et de copropriété', type: 'expense' },
  { code: '615', name: 'Entretien et réparations', type: 'expense' },
  { code: '616', name: 'Primes d\'assurances', type: 'expense' },
  { code: '618', name: 'Autres services extérieurs', type: 'expense' },
  { code: '621', name: 'Personnel extérieur à l\'entreprise', type: 'expense' },
  { code: '622', name: 'Rémunérations d\'intermédiaires et honoraires', type: 'expense' },
  { code: '623', name: 'Publicité, publications, relations publiques', type: 'expense' },
  { code: '624', name: 'Transports de biens et transports collectifs du personnel', type: 'expense' },
  { code: '625', name: 'Déplacements, missions et réceptions', type: 'expense' },
  { code: '626', name: 'Frais postaux et de télécommunications', type: 'expense' },
  { code: '627', name: 'Services bancaires et assimilés', type: 'expense' },
  { code: '628', name: 'Divers', type: 'expense' },
  { code: '641', name: 'Rémunérations du personnel', type: 'expense' },
  { code: '645', name: 'Charges de sécurité sociale et de prévoyance', type: 'expense' },
  { code: '647', name: 'Autres charges sociales', type: 'expense' },
  { code: '651', name: 'Redevances pour concessions, brevets, licences', type: 'expense' },
  { code: '661', name: 'Charges d\'intérêts', type: 'expense' },
  { code: '665', name: 'Escomptes accordés', type: 'expense' },
  { code: '667', name: 'Charges nettes sur cessions de valeurs mobilières', type: 'expense' },
  { code: '681', name: 'Dotations aux amortissements et aux provisions', type: 'expense' },
  { code: '687', name: 'Dotations aux provisions pour risques et charges', type: 'expense' },
  
  // CLASSE 7 - COMPTES DE PRODUITS
  { code: '701', name: 'Ventes de produits finis', type: 'revenue' },
  { code: '702', name: 'Ventes de produits intermédiaires', type: 'revenue' },
  { code: '703', name: 'Ventes de produits résiduels', type: 'revenue' },
  { code: '706', name: 'Prestations de services', type: 'revenue' },
  { code: '707', name: 'Ventes de marchandises', type: 'revenue' },
  { code: '708', name: 'Produits des activités annexes', type: 'revenue' },
  { code: '709', name: 'Rabais, remises et ristournes accordés', type: 'revenue' },
  { code: '721', name: 'Production immobilisée - Immobilisations incorporelles', type: 'revenue' },
  { code: '722', name: 'Production immobilisée - Immobilisations corporelles', type: 'revenue' },
  { code: '731', name: 'Variation des stocks - Matières premières', type: 'revenue' },
  { code: '735', name: 'Variation des stocks - Produits', type: 'revenue' },
  { code: '741', name: 'Subventions d\'exploitation', type: 'revenue' },
  { code: '751', name: 'Redevances pour concessions, brevets, licences', type: 'revenue' },
  { code: '754', name: 'Ristournes perçues des coopératives', type: 'revenue' },
  { code: '758', name: 'Produits divers de gestion courante', type: 'revenue' },
  { code: '761', name: 'Produits de participations', type: 'revenue' },
  { code: '762', name: 'Produits des autres immobilisations financières', type: 'revenue' },
  { code: '764', name: 'Revenus des valeurs mobilières de placement', type: 'revenue' },
  { code: '765', name: 'Escomptes obtenus', type: 'revenue' },
  { code: '767', name: 'Produits nets sur cessions de valeurs mobilières', type: 'revenue' },
  { code: '781', name: 'Reprises sur amortissements et provisions', type: 'revenue' },
  { code: '787', name: 'Reprises sur provisions pour risques et charges', type: 'revenue' }
];

const initChartOfAccounts = async () => {
  try {
    console.log('🔗 Connexion à MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion à MongoDB Atlas établie');
    
    // Vérifier si des comptes existent déjà
    const existingAccounts = await Account.countDocuments();
    if (existingAccounts > 0) {
      console.log(`ℹ️  ${existingAccounts} comptes existent déjà. Arrêt de l'initialisation.`);
      console.log('💡 Pour réinitialiser, supprimez d\'abord tous les comptes existants.');
      return;
    }
    
    // Créer les comptes
    console.log('📊 Création du plan comptable SYSCOHADA...');
    const accounts = await Account.insertMany(chartOfAccounts);
    console.log(`✅ ${accounts.length} comptes créés avec succès`);
    
    // Créer un utilisateur admin par défaut
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const admin = await User.create({
        name: 'Administrateur DevGroup',
        email: 'admin@devgroup.cm',
        password: 'admin123',
        role: 'admin'
      });
      console.log(`✅ Utilisateur admin créé: ${admin.email}`);
      console.log(`🔑 Mot de passe: admin123`);
    } else {
      console.log(`ℹ️  Utilisateur admin existe déjà: ${existingAdmin.email}`);
    }
    
    console.log('🎉 Initialisation terminée avec succès!');
    console.log('🚀 Vous pouvez maintenant démarrer le serveur avec: npm run dev');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    if (error.name === 'MongoNetworkError') {
      console.error('🔗 Vérifiez votre connexion internet et les credentials MongoDB Atlas');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
    process.exit(0);
  }
};

// Exécuter le script si appelé directement
if (process.argv[1] === new URL(import.meta.url).pathname) {
  initChartOfAccounts();
}

export default initChartOfAccounts;