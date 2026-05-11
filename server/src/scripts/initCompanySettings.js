import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CompanySettings } from '../models/CompanySettings.js';

dotenv.config();

const initCompanySettings = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si les paramètres existent déjà
    const existingSettings = await CompanySettings.findOne();
    
    if (existingSettings) {
      console.log('ℹ️  Les paramètres de l\'entreprise existent déjà');
      console.log('📋 Paramètres actuels:', {
        name: existingSettings.name,
        invoicePrefix: existingSettings.invoicePrefix,
        taxRate: existingSettings.taxRate,
        logo: existingSettings.logo
      });
      
      // Mettre à jour les champs manquants
      let updated = false;
      
      if (!existingSettings.logo) {
        existingSettings.logo = '/logo devgroup-1.png';
        updated = true;
      }
      
      if (!existingSettings.name || existingSettings.name === 'Mon Entreprise') {
        existingSettings.name = 'DevGroup Africa';
        updated = true;
      }
      
      if (existingSettings.taxRate === 0 || existingSettings.taxRate === 18) {
        existingSettings.taxRate = 19.25;
        updated = true;
      }
      
      if (!existingSettings.address) {
        existingSettings.address = 'Yaoundé, Cameroun';
        updated = true;
      }
      
      if (!existingSettings.phone) {
        existingSettings.phone = '+237 XXX XXX XXX';
        updated = true;
      }
      
      if (!existingSettings.email) {
        existingSettings.email = 'contact@devgroup.cm';
        updated = true;
      }
      
      if (!existingSettings.website) {
        existingSettings.website = 'www.devgroup.cm';
        updated = true;
      }
      
      if (existingSettings.invoicePrefix !== 'FA') {
        existingSettings.invoicePrefix = 'FA';
        updated = true;
      }
      
      if (updated) {
        await existingSettings.save();
        console.log('✅ Paramètres mis à jour');
        console.log('📋 Nouveaux paramètres:', {
          name: existingSettings.name,
          invoicePrefix: existingSettings.invoicePrefix,
          taxRate: existingSettings.taxRate,
          logo: existingSettings.logo
        });
      }
      
      await mongoose.connection.close();
      return;
    }

    // Créer les paramètres par défaut
    const defaultSettings = new CompanySettings({
      name: 'DevGroup Africa',
      address: 'Yaoundé, Cameroun',
      phone: '+237 XXX XXX XXX',
      email: 'contact@devgroup.cm',
      website: 'www.devgroup.cm',
      taxId: '',
      registrationNumber: '',
      logo: '/logo devgroup-1.png',
      taxRate: 19.25,
      currency: 'FCFA',
      invoicePrefix: 'FA',
      paymentTerms: 30,
      description: 'Système de gestion comptable DevGroup Africa',
      mobileMoneyAccounts: [],
      bankAccounts: []
    });

    await defaultSettings.save();
    
    console.log('✅ Paramètres de l\'entreprise créés avec succès!');
    console.log('📋 Paramètres:', {
      name: defaultSettings.name,
      invoicePrefix: defaultSettings.invoicePrefix,
      taxRate: defaultSettings.taxRate,
      logo: defaultSettings.logo
    });

    await mongoose.connection.close();
    console.log('✅ Déconnecté de MongoDB');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

initCompanySettings();
