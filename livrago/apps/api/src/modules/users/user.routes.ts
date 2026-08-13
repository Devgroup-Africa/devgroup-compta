import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import * as userController from "./user.controller.js";

export const userRoutes = Router();

userRoutes.get("/me", authenticate, userController.me);
userRoutes.patch("/me", authenticate, (_req, res) =>
  res.status(501).json({ success: false, message: "Mise à jour profil à finaliser", code: "NOT_IMPLEMENTED" }),
);
userRoutes.patch("/me/avatar", authenticate, (_req, res) =>
  res.status(501).json({ success: false, message: "Upload avatar à finaliser", code: "NOT_IMPLEMENTED" }),
);
userRoutes.delete("/me", authenticate, (_req, res) =>
  res.status(501).json({ success: false, message: "Suppression compte à finaliser", code: "NOT_IMPLEMENTED" }),
);
