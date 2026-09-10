import jwt, { SignOptions } from "jsonwebtoken";

import { env } from "../config/env";
import { UserRole } from "../entities/User";

export interface AuthTokenPayload {
  id: string;
  role: UserRole;
}

export function generateToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
}
