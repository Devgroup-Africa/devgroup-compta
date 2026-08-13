import { UserRole } from "@livrago/shared-types";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentification requise", 401, "AUTH_REQUIRED"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("Accès refusé", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
}
