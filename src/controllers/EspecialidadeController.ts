import { NextFunction, Request, Response } from "express";

import { PaginatedResponseDTO } from "../dtos/common/PaginatedResponseDTO";
import { CreateEspecialidadeDTO } from "../dtos/especialidade/CreateEspecialidadeDTO";
import { EspecialidadeResponseDTO } from "../dtos/especialidade/EspecialidadeResponseDTO";
import { ListEspecialidadesQueryDTO } from "../dtos/especialidade/ListEspecialidadesQueryDTO";
import { UpdateEspecialidadeDTO } from "../dtos/especialidade/UpdateEspecialidadeDTO";
import { EspecialidadeService } from "../services/EspecialidadeService";
import { idParamSchema, parseWith } from "../validations/common.validation";
import {
  createEspecialidadeSchema,
  listEspecialidadesQuerySchema,
  updateEspecialidadeSchema,
} from "../validations/especialidade.validation";

export class EspecialidadeController {
  private readonly especialidadeService: EspecialidadeService;

  public constructor() {
    this.especialidadeService = new EspecialidadeService();
  }

  public list = async (
    request: Request,
    response: Response<PaginatedResponseDTO<EspecialidadeResponseDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: ListEspecialidadesQueryDTO = parseWith(
        listEspecialidadesQuerySchema,
        request.query,
      );

      const result: PaginatedResponseDTO<EspecialidadeResponseDTO> =
        await this.especialidadeService.list(query);

      response.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  };

  public findById = async (
    request: Request,
    response: Response<EspecialidadeResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: { id: string } = parseWith(idParamSchema, request.params);

      const especialidade: EspecialidadeResponseDTO =
        await this.especialidadeService.findById(id);

      response.status(200).json(especialidade);
    } catch (error: unknown) {
      next(error);
    }
  };

  public create = async (
    request: Request,
    response: Response<EspecialidadeResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data: CreateEspecialidadeDTO = parseWith(
        createEspecialidadeSchema,
        request.body,
      );

      const especialidade: EspecialidadeResponseDTO =
        await this.especialidadeService.create(data);

      response.status(201).json(especialidade);
    } catch (error: unknown) {
      next(error);
    }
  };

  public update = async (
    request: Request,
    response: Response<EspecialidadeResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: { id: string } = parseWith(idParamSchema, request.params);
      const data: UpdateEspecialidadeDTO = parseWith(
        updateEspecialidadeSchema,
        request.body,
      );

      const especialidade: EspecialidadeResponseDTO =
        await this.especialidadeService.update(id, data);

      response.status(200).json(especialidade);
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

      await this.especialidadeService.remove(id);

      response.status(204).send();
    } catch (error: unknown) {
      next(error);
    }
  };
}
