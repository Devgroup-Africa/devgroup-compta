import { AuthUser } from "@livrago/shared-types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
