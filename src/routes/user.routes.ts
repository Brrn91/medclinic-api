import { Router } from "express";

import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/auth.middleware";

const userRoutes: Router = Router();
const userController: UserController = new UserController();

userRoutes.get("/me", authMiddleware, userController.me);

export default userRoutes;
