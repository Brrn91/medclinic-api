import { NextFunction, Request, Response } from "express";

import { PaginatedResponseDTO } from "../dtos/common/PaginatedResponseDTO";
import { CreatePacienteDTO } from "../dtos/paciente/CreatePacienteDTO";
import { ListPacientesQueryDTO } from "../dtos/paciente/ListPacientesQueryDTO";
import { PacienteResponseDTO } from "../dtos/paciente/PacienteResponseDTO";
import { UpdatePacienteDTO } from "../dtos/paciente/UpdatePacienteDTO";
import { PacienteService } from "../services/PacienteService";
import { idParamSchema, parseWith } from "../validations/common.validation";
import {
  createPacienteSchema,
  listPacientesQuerySchema,
  updatePacienteSchema,
} from "../validations/paciente.validation";

export class PacienteController {
  private readonly pacienteService: PacienteService;

  public constructor() {
    this.pacienteService = new PacienteService();
  }

  public list = async (
    request: Request,
    response: Response<PaginatedResponseDTO<PacienteResponseDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: ListPacientesQueryDTO = parseWith(
        listPacientesQuerySchema,
        request.query,
      );

      const result: PaginatedResponseDTO<PacienteResponseDTO> =
        await this.pacienteService.list(query);

      response.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  };

  public findById = async (
    request: Request,
    response: Response<PacienteResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: { id: string } = parseWith(idParamSchema, request.params);

      const paciente: PacienteResponseDTO =
        await this.pacienteService.findById(id);

      response.status(200).json(paciente);
    } catch (error: unknown) {
      next(error);
    }
  };

  public create = async (
    request: Request,
    response: Response<PacienteResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data: CreatePacienteDTO = parseWith(
        createPacienteSchema,
        request.body,
      );

      const paciente: PacienteResponseDTO =
        await this.pacienteService.create(data);

      response.status(201).json(paciente);
    } catch (error: unknown) {
      next(error);
    }
  };

  public update = async (
    request: Request,
    response: Response<PacienteResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: { id: string } = parseWith(idParamSchema, request.params);
      const data: UpdatePacienteDTO = parseWith(
        updatePacienteSchema,
        request.body,
      );

      const paciente: PacienteResponseDTO = await this.pacienteService.update(
        id,
        data,
      );

      response.status(200).json(paciente);
    } catch (error: unknown) {
      next(error);
    }
  };

  public remove = async (
    request: Request,
    response: Response<void>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: { id: string } = parseWith(idParamSchema, request.params);

      await this.pacienteService.remove(id);

      response.status(204).send();
    } catch (error: unknown) {
      next(error);
    }
  };
}
