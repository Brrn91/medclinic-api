import { Router } from "express";

import { AuthController } from "../controllers/AuthController";

const authRoutes: Router = Router();
const authController: AuthController = new AuthController();

authRoutes.post("/register", authController.register);

export default authRoutes;
