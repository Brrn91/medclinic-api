import { Router } from "express";

import { MedicoController } from "../controllers/MedicoController";
import { UserRole } from "../entities/User";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const medicoRoutes: Router = Router();
const medicoController: MedicoController = new MedicoController();

medicoRoutes.get(
  "/",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT),
  medicoController.list,
);

medicoRoutes.get(
  "/:id",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT),
  medicoController.findById,
);

medicoRoutes.post(
  "/",
  authMiddleware,
  authorize(UserRole.ADMIN),
  medicoController.create,
);

medicoRoutes.put(
  "/:id",
  authMiddleware,
  authorize(UserRole.ADMIN),
  medicoController.update,
);

medicoRoutes.delete(
  "/:id",
  authMiddleware,
  authorize(UserRole.ADMIN),
  medicoController.remove,
);

export default medicoRoutes;
