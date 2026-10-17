import { Router } from "express";

import { EspecialidadeController } from "../controllers/EspecialidadeController";
import { UserRole } from "../entities/User";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const especialidadeRoutes: Router = Router();
const especialidadeController: EspecialidadeController =
  new EspecialidadeController();

especialidadeRoutes.get(
  "/",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT),
  especialidadeController.list,
);

especialidadeRoutes.get(
  "/:id",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT),
  especialidadeController.findById,
);

especialidadeRoutes.post(
  "/",
  authMiddleware,
  authorize(UserRole.ADMIN),
  especialidadeController.create,
);

especialidadeRoutes.put(
  "/:id",
  authMiddleware,
  authorize(UserRole.ADMIN),
  especialidadeController.update,
);

especialidadeRoutes.delete(
  "/:id",
  authMiddleware,
  authorize(UserRole.ADMIN),
  especialidadeController.remove,
);

export default especialidadeRoutes;
