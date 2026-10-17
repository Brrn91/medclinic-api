import { NextFunction, Request, Response } from "express";

import { PaginatedResponseDTO } from "../dtos/common/PaginatedResponseDTO";
import { CreateMedicoDTO } from "../dtos/medico/CreateMedicoDTO";
import { ListMedicosQueryDTO } from "../dtos/medico/ListMedicosQueryDTO";
import { MedicoResponseDTO } from "../dtos/medico/MedicoResponseDTO";
import { UpdateMedicoDTO } from "../dtos/medico/UpdateMedicoDTO";
import { MedicoService } from "../services/MedicoService";
import { idParamSchema, parseWith } from "../validations/common.validation";
import {
  createMedicoSchema,
  listMedicosQuerySchema,
  updateMedicoSchema,
} from "../validations/medico.validation";

export class MedicoController {
  private readonly medicoService: MedicoService;

  public constructor() {
    this.medicoService = new MedicoService();
  }

  public list = async (
    request: Request,
    response: Response<PaginatedResponseDTO<MedicoResponseDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: ListMedicosQueryDTO = parseWith(
        listMedicosQuerySchema,
        request.query,
      );

      const result: PaginatedResponseDTO<MedicoResponseDTO> =
        await this.medicoService.list(query);

      response.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  };

  public findById = async (
    request: Request,
    response: Response<MedicoResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: { id: string } = parseWith(idParamSchema, request.params);

      const medico: MedicoResponseDTO = await this.medicoService.findById(id);

      response.status(200).json(medico);
    } catch (error: unknown) {
      next(error);
    }
  };

  public create = async (
    request: Request,
    response: Response<MedicoResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data: CreateMedicoDTO = parseWith(createMedicoSchema, request.body);

      const medico: MedicoResponseDTO = await this.medicoService.create(data);

      response.status(201).json(medico);
    } catch (error: unknown) {
      next(error);
    }
  };

  public update = async (
    request: Request,
    response: Response<MedicoResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: { id: string } = parseWith(idParamSchema, request.params);
      const data: UpdateMedicoDTO = parseWith(updateMedicoSchema, request.body);

      const medico: MedicoResponseDTO = await this.medicoService.update(
        id,
        data,
      );

      response.status(200).json(medico);
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

      await this.medicoService.remove(id);

      response.status(204).send();
    } catch (error: unknown) {
      next(error);
    }
  };
}
