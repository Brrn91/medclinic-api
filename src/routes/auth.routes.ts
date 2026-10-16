import { Router } from "express";

import { AuthController } from "../controllers/AuthController";
import { authRateLimiter } from "../middlewares/rate-limiter.middleware";

const authRoutes: Router = Router();
const authController: AuthController = new AuthController();

authRoutes.post("/register", authRateLimiter, authController.register);
authRoutes.post("/login", authRateLimiter, authController.login);

export default authRoutes;
