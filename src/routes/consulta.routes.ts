import { Router } from "express";

import { ConsultaController } from "../controllers/ConsultaController";
import { UserRole } from "../entities/User";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const consultaRoutes: Router = Router();
const consultaController: ConsultaController = new ConsultaController();

consultaRoutes.get(
  "/",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT),
  consultaController.list,
);

consultaRoutes.get(
  "/:id",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT),
  consultaController.findById,
);

consultaRoutes.post(
  "/",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT),
  consultaController.create,
);

consultaRoutes.patch(
  "/:id/atendimento",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT),
  consultaController.registrarAtendimento,
);

consultaRoutes.patch(
  "/:id/cancelamento",
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT),
  consultaController.cancelar,
);

export default consultaRoutes;
