import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as authService from "./auth.service.js";

export const register: RequestHandler = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    sendSuccess(res, "Inscription effectuée avec succès", data, 201);
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    sendSuccess(res, "Connexion effectuée avec succès", data);
  } catch (error) {
    next(error);
  }
};

export const verifyOtp: RequestHandler = async (req, res, next) => {
  try {
    const user = await authService.verifyOtp(req.body.phone, req.body.code);
    sendSuccess(res, "Numéro vérifié avec succès", { user });
  } catch (error) {
    next(error);
  }
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, "Profil récupéré avec succès", { user });
  } catch (error) {
    next(error);
  }
};
