import { Router } from "express";
import { loginSchema, registerSchema, verifyOtpSchema } from "@livrago/validation";
import { authenticate } from "../../middlewares/authenticate.js";
import { validateBody } from "../../middlewares/validate.js";
import * as authController from "./auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/register", validateBody(registerSchema), authController.register);
authRoutes.post("/login", validateBody(loginSchema), authController.login);
authRoutes.post("/verify-otp", validateBody(verifyOtpSchema), authController.verifyOtp);
authRoutes.get("/me", authenticate, authController.me);

authRoutes.post("/refresh-token", (_req, res) =>
  res.status(501).json({ success: false, message: "Refresh token à finaliser", code: "NOT_IMPLEMENTED" }),
);
authRoutes.post("/forgot-password", (_req, res) =>
  res.status(501).json({ success: false, message: "Récupération à finaliser", code: "NOT_IMPLEMENTED" }),
);
authRoutes.post("/reset-password", (_req, res) =>
  res.status(501).json({ success: false, message: "Réinitialisation à finaliser", code: "NOT_IMPLEMENTED" }),
);
