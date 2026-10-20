import { NextFunction, Request, Response } from "express";

import { PaginatedResponseDTO } from "../dtos/common/PaginatedResponseDTO";
import { PaginationQueryDTO } from "../dtos/common/PaginationQueryDTO";
import { ConsultasPorMedicoItemDTO } from "../dtos/relatorio/ConsultasPorMedicoItemDTO";
import { ConsultasPorStatusResponseDTO } from "../dtos/relatorio/ConsultasPorStatusDTO";
import { MedicosPorEspecialidadeItemDTO } from "../dtos/relatorio/MedicosPorEspecialidadeItemDTO";
import { PacientesComConsultasAgendadasItemDTO } from "../dtos/relatorio/PacientesComConsultasAgendadasItemDTO";
import { RelatorioService } from "../services/RelatorioService";
import { parseWith } from "../validations/common.validation";
import { relatorioQuerySchema } from "../validations/relatorio.validation";

export class RelatorioController {
  private readonly relatorioService: RelatorioService;

  public constructor() {
    this.relatorioService = new RelatorioService();
  }

  public consultasPorStatus = async (
    _request: Request,
    response: Response<ConsultasPorStatusResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result: ConsultasPorStatusResponseDTO =
        await this.relatorioService.consultasPorStatus();

      response.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  };

  public consultasPorMedico = async (
    request: Request,
    response: Response<PaginatedResponseDTO<ConsultasPorMedicoItemDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: PaginationQueryDTO = parseWith(
        relatorioQuerySchema,
        request.query,
      );

      const result: PaginatedResponseDTO<ConsultasPorMedicoItemDTO> =
        await this.relatorioService.consultasPorMedico(query);

      response.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  };

  public medicosPorEspecialidade = async (
    request: Request,
    response: Response<PaginatedResponseDTO<MedicosPorEspecialidadeItemDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: PaginationQueryDTO = parseWith(
        relatorioQuerySchema,
        request.query,
      );

      const result: PaginatedResponseDTO<MedicosPorEspecialidadeItemDTO> =
        await this.relatorioService.medicosPorEspecialidade(query);

      response.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  };

  public pacientesComConsultasAgendadas = async (
    request: Request,
    response: Response<
      PaginatedResponseDTO<PacientesComConsultasAgendadasItemDTO>
    >,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: PaginationQueryDTO = parseWith(
        relatorioQuerySchema,
        request.query,
      );

      const result: PaginatedResponseDTO<PacientesComConsultasAgendadasItemDTO> =
        await this.relatorioService.pacientesComConsultasAgendadas(query);

      response.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  };
}
