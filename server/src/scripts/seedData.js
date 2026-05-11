import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🔗 Connexion à MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion établie');
    
    const db = mongoose.connection.db;
    
    // 1. Créer l'utilisateur admin
    console.log('👤 Création de l\'utilisateur admin...');
    
    const usersCollection = db.collection('users');
    const existingAdmin = await usersCollection.findOne({ email: 'admin@devgroup.cm' });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await usersCollection.insertOne({
        name: 'Administrateur DevGroup',
        email: 'admin@devgroup.cm',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Utilisateur admin créé');
      console.log('   Email: admin@devgroup.cm');
      console.log('   Mot de passe: admin123');
    } else {
      console.log('ℹ️  Utilisateur admin existe déjà');
    }
    
    // 2. Créer le plan comptable SYSCOHADA
    console.log('📊 Création du plan comptable SYSCOHADA...');
    
    const accountsCollection = db.collection('accounts');
    const existingAccounts = await accountsCollection.countDocuments();
    
    if (existingAccounts === 0) {
      const chartOfAccounts = [
        // CLASSE 1 - COMPTES DE CAPITAUX
        { code: '101', name: 'Capital social', type: 'equity', currentBalance: 0, isActive: true },
        { code: '106', name: 'Réserves', type: 'equity', currentBalance: 0, isActive: true },
        { code: '110', name: 'Report à nouveau', type: 'equity', currentBalance: 0, isActive: true },
        { code: '120', name: 'Résultat de l\'exercice', type: 'equity', currentBalance: 0, isActive: true },
        { code: '164', name: 'Emprunts auprès des établissements de crédit', type: 'liability', currentBalance: 0, isActive: true },
        { code: '168', name: 'Autres emprunts et dettes assimilées', type: 'liability', currentBalance: 0, isActive: true },
        
        // CLASSE 2 - COMPTES D'IMMOBILISATIONS
        { code: '211', name: 'Terrains', type: 'asset', currentBalance: 0, isActive: true },
        { code: '213', name: 'Constructions', type: 'asset', currentBalance: 0, isActive: true },
        { code: '215', name: 'Installations techniques, matériel et outillage industriels', type: 'asset', currentBalance: 0, isActive: true },
        { code: '218', name: 'Autres immobilisations corporelles', type: 'asset', currentBalance: 0, isActive: true },
        { code: '221', name: 'Immobilisations incorporelles', type: 'asset', currentBalance: 0, isActive: true },
        
        // CLASSE 3 - COMPTES DE STOCKS
        { code: '311', name: 'Matières premières', type: 'asset', currentBalance: 0, isActive: true },
        { code: '321', name: 'Matières consommables', type: 'asset', currentBalance: 0, isActive: true },
        { code: '331', name: 'En-cours de production de biens', type: 'asset', currentBalance: 0, isActive: true },
        { code: '351', name: 'Produits finis', type: 'asset', currentBalance: 0, isActive: true },
        { code: '371', name: 'Marchandises', type: 'asset', currentBalance: 0, isActive: true },
        
        // CLASSE 4 - COMPTES DE TIERS
        { code: '401', name: 'Fournisseurs', type: 'liability', currentBalance: 0, isActive: true },
        { code: '403', name: 'Fournisseurs - Effets à payer', type: 'liability', currentBalance: 0, isActive: true },
        { code: '408', name: 'Fournisseurs - Factures non parvenues', type: 'liability', currentBalance: 0, isActive: true },
        { code: '409', name: 'Fournisseurs débiteurs', type: 'asset', currentBalance: 0, isActive: true },
        { code: '411', name: 'Clients', type: 'asset', currentBalance: 0, isActive: true },
        { code: '413', name: 'Clients - Effets à recevoir', type: 'asset', currentBalance: 0, isActive: true },
        { code: '416', name: 'Clients douteux ou litigieux', type: 'asset', currentBalance: 0, isActive: true },
        { code: '418', name: 'Clients - Produits non encore facturés', type: 'asset', currentBalance: 0, isActive: true },
        { code: '419', name: 'Clients créditeurs', type: 'liability', currentBalance: 0, isActive: true },
        { code: '421', name: 'Personnel - Rémunérations dues', type: 'liability', currentBalance: 0, isActive: true },
        { code: '428', name: 'Personnel - Charges à payer et produits à recevoir', type: 'liability', currentBalance: 0, isActive: true },
        { code: '431', name: 'Sécurité sociale', type: 'liability', currentBalance: 0, isActive: true },
        { code: '437', name: 'Autres organismes sociaux', type: 'liability', currentBalance: 0, isActive: true },
        { code: '441', name: 'État - Subventions à recevoir', type: 'asset', currentBalance: 0, isActive: true },
        { code: '445', name: 'État - TVA collectée', type: 'liability', currentBalance: 0, isActive: true },
        { code: '446', name: 'État - TVA déductible', type: 'asset', currentBalance: 0, isActive: true },
        { code: '447', name: 'État - Autres taxes sur le chiffre d\'affaires', type: 'liability', currentBalance: 0, isActive: true },
        { code: '451', name: 'Associés - Comptes courants', type: 'liability', currentBalance: 0, isActive: true },
        { code: '455', name: 'Associés - Dividendes à payer', type: 'liability', currentBalance: 0, isActive: true },
        { code: '467', name: 'Autres comptes débiteurs ou créditeurs', type: 'asset', currentBalance: 0, isActive: true },
        
        // CLASSE 5 - COMPTES FINANCIERS
        { code: '512', name: 'Banques', type: 'asset', currentBalance: 0, isActive: true },
        { code: '513', name: 'Chèques postaux', type: 'asset', currentBalance: 0, isActive: true },
        { code: '514', name: 'Chèques à encaisser', type: 'asset', currentBalance: 0, isActive: true },
        { code: '515', name: 'Caisses d\'épargne', type: 'asset', currentBalance: 0, isActive: true },
        { code: '516', name: 'Autres organismes financiers', type: 'asset', currentBalance: 0, isActive: true },
        { code: '518', name: 'Intérêts courus', type: 'asset', currentBalance: 0, isActive: true },
        { code: '519', name: 'Concours bancaires courants', type: 'liability', currentBalance: 0, isActive: true },
        { code: '531', name: 'Caisse', type: 'asset', currentBalance: 0, isActive: true },
        { code: '532', name: 'Régie d\'avances et accréditifs', type: 'asset', currentBalance: 0, isActive: true },
        
        // CLASSE 6 - COMPTES DE CHARGES
        { code: '601', name: 'Achats de matières premières', type: 'expense', currentBalance: 0, isActive: true },
        { code: '602', name: 'Achats de matières et fournitures consommables', type: 'expense', currentBalance: 0, isActive: true },
        { code: '606', name: 'Achats non stockés de matières et fournitures', type: 'expense', currentBalance: 0, isActive: true },
        { code: '607', name: 'Achats de marchandises', type: 'expense', currentBalance: 0, isActive: true },
        { code: '611', name: 'Sous-traitance générale', type: 'expense', currentBalance: 0, isActive: true },
        { code: '613', name: 'Locations', type: 'expense', currentBalance: 0, isActive: true },
        { code: '614', name: 'Charges locatives et de copropriété', type: 'expense', currentBalance: 0, isActive: true },
        { code: '615', name: 'Entretien et réparations', type: 'expense', currentBalance: 0, isActive: true },
        { code: '616', name: 'Primes d\'assurances', type: 'expense', currentBalance: 0, isActive: true },
        { code: '618', name: 'Autres services extérieurs', type: 'expense', currentBalance: 0, isActive: true },
        { code: '621', name: 'Personnel extérieur à l\'entreprise', type: 'expense', currentBalance: 0, isActive: true },
        { code: '622', name: 'Rémunérations d\'intermédiaires et honoraires', type: 'expense', currentBalance: 0, isActive: true },
        { code: '623', name: 'Publicité, publications, relations publiques', type: 'expense', currentBalance: 0, isActive: true },
        { code: '624', name: 'Transports de biens et transports collectifs du personnel', type: 'expense', currentBalance: 0, isActive: true },
        { code: '625', name: 'Déplacements, missions et réceptions', type: 'expense', currentBalance: 0, isActive: true },
        { code: '626', name: 'Frais postaux et de télécommunications', type: 'expense', currentBalance: 0, isActive: true },
        { code: '627', name: 'Services bancaires et assimilés', type: 'expense', currentBalance: 0, isActive: true },
        { code: '628', name: 'Divers', type: 'expense', currentBalance: 0, isActive: true },
        { code: '641', name: 'Rémunérations du personnel', type: 'expense', currentBalance: 0, isActive: true },
        { code: '645', name: 'Charges de sécurité sociale et de prévoyance', type: 'expense', currentBalance: 0, isActive: true },
        { code: '647', name: 'Autres charges sociales', type: 'expense', currentBalance: 0, isActive: true },
        { code: '651', name: 'Redevances pour concessions, brevets, licences', type: 'expense', currentBalance: 0, isActive: true },
        { code: '661', name: 'Charges d\'intérêts', type: 'expense', currentBalance: 0, isActive: true },
        { code: '665', name: 'Escomptes accordés', type: 'expense', currentBalance: 0, isActive: true },
        { code: '667', name: 'Charges nettes sur cessions de valeurs mobilières', type: 'expense', currentBalance: 0, isActive: true },
        { code: '681', name: 'Dotations aux amortissements et aux provisions', type: 'expense', currentBalance: 0, isActive: true },
        { code: '687', name: 'Dotations aux provisions pour risques et charges', type: 'expense', currentBalance: 0, isActive: true },
        
        // CLASSE 7 - COMPTES DE PRODUITS
        { code: '701', name: 'Ventes de produits finis', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '702', name: 'Ventes de produits intermédiaires', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '703', name: 'Ventes de produits résiduels', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '706', name: 'Prestations de services', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '707', name: 'Ventes de marchandises', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '708', name: 'Produits des activités annexes', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '709', name: 'Rabais, remises et ristournes accordés', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '721', name: 'Production immobilisée - Immobilisations incorporelles', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '722', name: 'Production immobilisée - Immobilisations corporelles', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '731', name: 'Variation des stocks - Matières premières', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '735', name: 'Variation des stocks - Produits', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '741', name: 'Subventions d\'exploitation', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '751', name: 'Redevances pour concessions, brevets, licences', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '754', name: 'Ristournes perçues des coopératives', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '758', name: 'Produits divers de gestion courante', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '761', name: 'Produits de participations', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '762', name: 'Produits des autres immobilisations financières', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '764', name: 'Revenus des valeurs mobilières de placement', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '765', name: 'Escomptes obtenus', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '767', name: 'Produits nets sur cessions de valeurs mobilières', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '781', name: 'Reprises sur amortissements et provisions', type: 'revenue', currentBalance: 0, isActive: true },
        { code: '787', name: 'Reprises sur provisions pour risques et charges', type: 'revenue', currentBalance: 0, isActive: true }
      ];
      
      // Ajouter les timestamps
      const accountsWithTimestamps = chartOfAccounts.map(account => ({
        ...account,
        level: 1,
        parent: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      await accountsCollection.insertMany(accountsWithTimestamps);
      console.log(`✅ ${chartOfAccounts.length} comptes créés`);
    } else {
      console.log(`ℹ️  ${existingAccounts} comptes existent déjà`);
    }
    
    console.log('\n🎉 Données initiales créées avec succès!');
    console.log('\n📋 Résumé:');
    console.log(`   - Utilisateur admin: admin@devgroup.cm`);
    console.log(`   - Plan comptable: ${await accountsCollection.countDocuments()} comptes`);
    console.log(`   - Collections: ${(await db.listCollections().toArray()).length}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
};

seedData();