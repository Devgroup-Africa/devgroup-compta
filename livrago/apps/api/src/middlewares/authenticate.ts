import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { getMe, verifyAccessToken } from "../modules/auth/auth.service.js";

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) {
      throw new AppError("Authentification requise", 401, "AUTH_REQUIRED");
    }

    const payload = verifyAccessToken(token);
    req.user = await getMe(payload.sub);
    next();
  } catch (error) {
    next(error);
  }
}
