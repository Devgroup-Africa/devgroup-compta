import { CompanySettings } from '../models/CompanySettings.js';
import { asyncHandler } from '../middleware/validation.js';

// Obtenir les paramètres de l'entreprise
export const getCompanySettings = asyncHandler(async (req, res) => {
  const settings = await CompanySettings.getSettings();
  
  res.json({ settings });
});

// Mettre à jour les paramètres de l'entreprise
export const updateCompanySettings = asyncHandler(async (req, res) => {
  const {
    name,
    logo,
    address,
    phone,
    email,
    website,
    registrationNumber,
    taxId,
    description,
    taxRate,
    currency,
    invoicePrefix,
    invoiceStartNumber,
    paymentTerms,
    mobileMoneyAccounts,
    bankAccounts
  } = req.body;
  
  let settings = await CompanySettings.findOne();
  
  if (!settings) {
    // Créer si n'existe pas
    settings = new CompanySettings();
  }
  
  // Mettre à jour les champs
  if (name !== undefined) settings.name = name;
  if (logo !== undefined) settings.logo = logo;
  if (address !== undefined) settings.address = address;
  if (phone !== undefined) settings.phone = phone;
  if (email !== undefined) settings.email = email;
  if (website !== undefined) settings.website = website;
  if (registrationNumber !== undefined) settings.registrationNumber = registrationNumber;
  if (taxId !== undefined) settings.taxId = taxId;
  if (description !== undefined) settings.description = description;
  if (taxRate !== undefined) settings.taxRate = taxRate;
  if (currency !== undefined) settings.currency = currency;
  if (invoicePrefix !== undefined) settings.invoicePrefix = invoicePrefix;
  if (invoiceStartNumber !== undefined) settings.invoiceStartNumber = invoiceStartNumber;
  if (paymentTerms !== undefined) settings.paymentTerms = paymentTerms;
  if (mobileMoneyAccounts !== undefined) settings.mobileMoneyAccounts = mobileMoneyAccounts;
  if (bankAccounts !== undefined) settings.bankAccounts = bankAccounts;
  
  if (req.user) {
    settings.updatedBy = req.user._id;
  }
  
  await settings.save();
  
  res.json({
    message: 'Paramètres mis à jour avec succès',
    settings
  });
});

// Réinitialiser aux valeurs par défaut
export const resetCompanySettings = asyncHandler(async (req, res) => {
  await CompanySettings.deleteMany({});
  
  const settings = await CompanySettings.getSettings();
  
  res.json({
    message: 'Paramètres réinitialisés',
    settings
  });
});
