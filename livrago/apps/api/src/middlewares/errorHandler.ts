import { ErrorRequestHandler } from "express";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

const { JsonWebTokenError, TokenExpiredError } = jwt;

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Données invalides",
      code: "VALIDATION_ERROR",
      errors: error.issues,
    });
    return;
  }

  if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: "Token invalide ou expiré",
      code: "INVALID_TOKEN",
      errors: [],
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      errors: error.errors,
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    success: false,
    message: "Une erreur est survenue",
    code: "INTERNAL_ERROR",
    errors: [],
  });
};
