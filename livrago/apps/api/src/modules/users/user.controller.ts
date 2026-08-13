import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";

export const me: RequestHandler = (req, res) => {
  sendSuccess(res, "Profil récupéré avec succès", { user: req.user });
};
