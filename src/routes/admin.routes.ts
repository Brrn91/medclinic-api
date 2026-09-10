import { Router } from "express";

import { AdminController } from "../controllers/AdminController";
import { UserRole } from "../entities/User";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const adminRoutes: Router = Router();
const adminController: AdminController = new AdminController();

adminRoutes.get(
  "/ping",
  authMiddleware,
  authorize(UserRole.ADMIN),
  adminController.ping,
);

export default adminRoutes;
