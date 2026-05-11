import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { asyncHandler } from '../middleware/validation.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
  
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  });
  
  return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Utilisateur déjà existant' });
  }
  
  // Créer l'utilisateur
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'manager'
  });
  
  // Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user._id);
  
  res.status(201).json({
    message: 'Utilisateur créé avec succès',
    user,
    accessToken,
    refreshToken
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Vérifier l'utilisateur
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }
  
  // Vérifier le mot de passe
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }
  
  // Mettre à jour la dernière connexion
  user.lastLogin = new Date();
  await user.save();
  
  // Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user._id);
  
  res.json({
    message: 'Connexion réussie',
    user,
    accessToken,
    refreshToken
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token requis' });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    
    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ message: 'Refresh token invalide' });
  }
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json({
    user: req.user
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  
  const user = await User.findById(req.user._id);
  
  if (name) user.name = name;
  if (email) user.email = email;
  
  await user.save();
  
  res.json({
    message: 'Profil mis à jour',
    user
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user._id).select('+password');
  
  // Vérifier le mot de passe actuel
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
  }
  
  // Mettre à jour le mot de passe
  user.password = newPassword;
  await user.save();
  
  res.json({ message: 'Mot de passe mis à jour' });
});