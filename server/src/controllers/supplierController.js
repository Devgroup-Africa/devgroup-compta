import { Supplier } from '../models/Supplier.js';
import { asyncHandler } from '../middleware/validation.js';

export const getSuppliers = asyncHandler(async (req, res) => {
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
  
  const suppliers = await Supplier.find(filter).sort({ name: 1 });
  
  res.json({
    suppliers,
    total: suppliers.length
  });
});

export const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  
  if (!supplier) {
    return res.status(404).json({ message: 'Fournisseur non trouvé' });
  }
  
  // Calculer les statistiques
  await supplier.calculateStats();
  
  res.json({ supplier });
});

export const createSupplier = asyncHandler(async (req, res) => {
  const { name, email, phone, company, address, paymentTerms, taxNumber, bankDetails } = req.body;
  
  // Vérifier si l'email existe déjà
  if (email) {
    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return res.status(400).json({ message: 'Un fournisseur avec cet email existe déjà' });
    }
  }
  
  const supplier = await Supplier.create({
    name,
    email,
    phone,
    company,
    address,
    paymentTerms: paymentTerms || 30,
    taxNumber,
    bankDetails
  });
  
  res.status(201).json({
    message: 'Fournisseur créé avec succès',
    supplier
  });
});

export const updateSupplier = asyncHandler(async (req, res) => {
  const { name, email, phone, company, address, paymentTerms, taxNumber, bankDetails, isActive } = req.body;
  
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    return res.status(404).json({ message: 'Fournisseur non trouvé' });
  }
  
  // Vérifier si l'email existe déjà (sauf pour ce fournisseur)
  if (email && email !== supplier.email) {
    const existingSupplier = await Supplier.findOne({ email, _id: { $ne: supplier._id } });
    if (existingSupplier) {
      return res.status(400).json({ message: 'Un fournisseur avec cet email existe déjà' });
    }
  }
  
  // Mettre à jour les champs
  if (name) supplier.name = name;
  if (email !== undefined) supplier.email = email;
  if (phone !== undefined) supplier.phone = phone;
  if (company !== undefined) supplier.company = company;
  if (address !== undefined) supplier.address = address;
  if (paymentTerms !== undefined) supplier.paymentTerms = paymentTerms;
  if (taxNumber !== undefined) supplier.taxNumber = taxNumber;
  if (bankDetails !== undefined) supplier.bankDetails = bankDetails;
  if (isActive !== undefined) supplier.isActive = isActive;
  
  await supplier.save();
  
  res.json({
    message: 'Fournisseur mis à jour',
    supplier
  });
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    return res.status(404).json({ message: 'Fournisseur non trouvé' });
  }
  
  await supplier.deleteOne();
  
  res.json({ message: 'Fournisseur supprimé' });
});

export const getSupplierStats = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    return res.status(404).json({ message: 'Fournisseur non trouvé' });
  }
  
  await supplier.calculateStats();
  
  res.json({
    supplierId: supplier._id,
    name: supplier.name,
    totalPurchases: supplier.totalPurchases,
    totalPaid: supplier.totalPaid,
    currentBalance: supplier.currentBalance
  });
});