import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { AuthUser } from "@livrago/shared-types";
import { LoginInput, RegisterInput } from "@livrago/validation";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { UserDocument, UserModel } from "../users/user.model.js";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function toAuthUser(user: UserDocument): AuthUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isPhoneVerified: user.isPhoneVerified,
    isActive: user.isActive,
    status: user.status,
  };
}

function signTokens(user: UserDocument): TokenPair {
  const payload = { sub: user.id, role: user.role };
  const accessOptions: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"] };
  const refreshOptions: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"] };

  return {
    accessToken: jwt.sign(payload, env.JWT_ACCESS_SECRET, accessOptions),
    refreshToken: jwt.sign(payload, env.JWT_REFRESH_SECRET, refreshOptions),
  };
}

export async function register(input: RegisterInput) {
  const existing = await UserModel.findOne({ $or: [{ phone: input.phone }, { email: input.email }] });
  if (existing) {
    throw new AppError("Un utilisateur existe déjà avec ce téléphone ou cet email", 409, "USER_EXISTS");
  }

  const password = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
  const otpCode = "123456";
  const user = await UserModel.create({
    ...input,
    password,
    otpCode,
    otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });
  const tokens = signTokens(user);
  user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, env.BCRYPT_SALT_ROUNDS);
  await user.save();

  return { user: toAuthUser(user), tokens, simulatedOtp: otpCode };
}

export async function login(input: LoginInput) {
  const user = await UserModel.findOne({
    $or: [{ phone: input.identifier }, { email: input.identifier.toLowerCase() }],
  }).select("+password");

  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    throw new AppError("Identifiants invalides", 401, "INVALID_CREDENTIALS");
  }

  if (!user.isActive || user.status === "SUSPENDED") {
    throw new AppError("Compte inactif ou suspendu", 403, "ACCOUNT_DISABLED");
  }

  const tokens = signTokens(user);
  user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, env.BCRYPT_SALT_ROUNDS);
  await user.save();

  return { user: toAuthUser(user), tokens };
}

export async function verifyOtp(phone: string, code: string) {
  const user = await UserModel.findOne({ phone }).select("+otpCode +otpExpiresAt");
  if (!user || user.otpCode !== code || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw new AppError("Code OTP invalide ou expiré", 400, "INVALID_OTP");
  }

  user.isPhoneVerified = true;
  user.status = "ACTIVE";
  user.otpCode = undefined;
  user.otpExpiresAt = undefined;
  await user.save();
  return toAuthUser(user);
}

export async function getMe(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("Utilisateur introuvable", 404, "USER_NOT_FOUND");
  }
  return toAuthUser(user);
}

export function verifyAccessToken(token: string): { sub: string; role: AuthUser["role"] } {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; role: AuthUser["role"] };
}
