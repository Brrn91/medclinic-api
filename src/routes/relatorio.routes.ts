import { Router } from "express";

import { RelatorioController } from "../controllers/RelatorioController";
import { UserRole } from "../entities/User";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const relatorioRoutes: Router = Router();
const relatorioController: RelatorioController = new RelatorioController();

relatorioRoutes.get(
  "/consultas-por-status",
  authMiddleware,
  authorize(UserRole.ADMIN),
  relatorioController.consultasPorStatus,
);

relatorioRoutes.get(
  "/consultas-por-medico",
  authMiddleware,
  authorize(UserRole.ADMIN),
  relatorioController.consultasPorMedico,
);

relatorioRoutes.get(
  "/medicos-por-especialidade",
  authMiddleware,
  authorize(UserRole.ADMIN),
  relatorioController.medicosPorEspecialidade,
);

relatorioRoutes.get(
  "/pacientes-com-consultas-agendadas",
  authMiddleware,
  authorize(UserRole.ADMIN),
  relatorioController.pacientesComConsultasAgendadas,
);

export default relatorioRoutes;
