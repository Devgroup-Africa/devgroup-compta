import { Client } from '../models/Client.js';
import { asyncHandler } from '../middleware/validation.js';

export const getClients = asyncHandler(async (req, res) => {
  const { search, isActive } = req.query;
  
  let filter = {};
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }
  
  const clients = await Client.find(filter).sort({ name: 1 });
  
  res.json({
    clients,
    total: clients.length
  });
});

export const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  
  if (!client) {
    return res.status(404).json({ message: 'Client non trouvé' });
  }
  
  // Calculer les statistiques
  await client.calculateStats();
  
  res.json({ client });
});

export const createClient = asyncHandler(async (req, res) => {
  const { name, email, phone, company, address, paymentTerms, creditLimit, taxNumber } = req.body;
  
  // Vérifier si l'email existe déjà
  if (email) {
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: 'Un client avec cet email existe déjà' });
    }
  }
  
  const client = await Client.create({
    name,
    email,
    phone,
    company,
    address,
    paymentTerms: paymentTerms || 30,
    creditLimit: creditLimit || 0,
    taxNumber
  });
  
  res.status(201).json({
    message: 'Client créé avec succès',
    client
  });
});

export const updateClient = asyncHandler(async (req, res) => {
  const { name, email, phone, company, address, paymentTerms, creditLimit, taxNumber, isActive } = req.body;
  
  const client = await Client.findById(req.params.id);
  if (!client) {
    return res.status(404).json({ message: 'Client non trouvé' });
  }
  
  // Vérifier si l'email existe déjà (sauf pour ce client)
  if (email && email !== client.email) {
    const existingClient = await Client.findOne({ email, _id: { $ne: client._id } });
    if (existingClient) {
      return res.status(400).json({ message: 'Un client avec cet email existe déjà' });
    }
  }
  
  // Mettre à jour les champs
  if (name) client.name = name;
  if (email !== undefined) client.email = email;
  if (phone !== undefined) client.phone = phone;
  if (company !== undefined) client.company = company;
  if (address !== undefined) client.address = address;
  if (paymentTerms !== undefined) client.paymentTerms = paymentTerms;
  if (creditLimit !== undefined) client.creditLimit = creditLimit;
  if (taxNumber !== undefined) client.taxNumber = taxNumber;
  if (isActive !== undefined) client.isActive = isActive;
  
  await client.save();
  
  res.json({
    message: 'Client mis à jour',
    client
  });
});

export const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    return res.status(404).json({ message: 'Client non trouvé' });
  }
  
  // Vérifier s'il y a des factures liées
  const Invoice = (await import('../models/Invoice.js')).Invoice;
  const invoicesCount = await Invoice.countDocuments({ client: client._id });
  
  if (invoicesCount > 0) {
    return res.status(400).json({ 
      message: 'Impossible de supprimer un client avec des factures existantes' 
    });
  }
  
  await client.deleteOne();
  
  res.json({ message: 'Client supprimé' });
});

export const getClientStats = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    return res.status(404).json({ message: 'Client non trouvé' });
  }
  
  await client.calculateStats();
  
  res.json({
    clientId: client._id,
    name: client.name,
    totalInvoiced: client.totalInvoiced,
    totalPaid: client.totalPaid,
    currentBalance: client.currentBalance
  });
});