import { Router } from "express";

import { PacienteController } from "../controllers/PacienteController";
import { UserRole } from "../entities/User";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const pacienteRoutes: Router = Router();
const pacienteController: PacienteController = new PacienteController();

pacienteRoutes.get(
  "/",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT),
  pacienteController.list,
);

pacienteRoutes.get(
  "/:id",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT),
  pacienteController.findById,
);

pacienteRoutes.post(
  "/",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT),
  pacienteController.create,
);

pacienteRoutes.put(
  "/:id",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT),
  pacienteController.update,
);

pacienteRoutes.delete(
  "/:id",
  authMiddleware,
  authorize(UserRole.ADMIN),
  pacienteController.remove,
);

export default pacienteRoutes;
