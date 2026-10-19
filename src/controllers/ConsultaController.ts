import { NextFunction, Request, Response } from "express";

import { PaginatedResponseDTO } from "../dtos/common/PaginatedResponseDTO";
import { ConsultaResponseDTO } from "../dtos/consulta/ConsultaResponseDTO";
import { CreateConsultaDTO } from "../dtos/consulta/CreateConsultaDTO";
import { ListConsultasQueryDTO } from "../dtos/consulta/ListConsultasQueryDTO";
import { RegistrarAtendimentoDTO } from "../dtos/consulta/RegistrarAtendimentoDTO";
import { ConsultaService } from "../services/ConsultaService";
import { idParamSchema, parseWith } from "../validations/common.validation";
import {
  createConsultaSchema,
  listConsultasQuerySchema,
  registrarAtendimentoSchema,
} from "../validations/consulta.validation";

export class ConsultaController {
  private readonly consultaService: ConsultaService;

  public constructor() {
    this.consultaService = new ConsultaService();
  }

  public list = async (
    request: Request,
    response: Response<PaginatedResponseDTO<ConsultaResponseDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: ListConsultasQueryDTO = parseWith(
        listConsultasQuerySchema,
        request.query,
      );

      const result: PaginatedResponseDTO<ConsultaResponseDTO> =
        await this.consultaService.list(query);

      response.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  };

  public findById = async (
    request: Request,
    response: Response<ConsultaResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: { id: string } = parseWith(idParamSchema, request.params);

      const consulta: ConsultaResponseDTO =
        await this.consultaService.findById(id);

      response.status(200).json(consulta);
    } catch (error: unknown) {
      next(error);
    }
  };

  public create = async (
    request: Request,
    response: Response<ConsultaResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data: CreateConsultaDTO = parseWith(
        createConsultaSchema,
        request.body,
      );

      const consulta: ConsultaResponseDTO =
        await this.consultaService.create(data);

      response.status(201).json(consulta);
    } catch (error: unknown) {
      next(error);
    }
  };

  public registrarAtendimento = async (
    request: Request,
    response: Response<ConsultaResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: { id: string } = parseWith(idParamSchema, request.params);
      const data: RegistrarAtendimentoDTO = parseWith(
        registrarAtendimentoSchema,
        request.body,
      );

      const consulta: ConsultaResponseDTO =
        await this.consultaService.registrarAtendimento(id, data);

      response.status(200).json(consulta);
    } catch (error: unknown) {
      next(error);
    }
  };

  public cancelar = async (
    request: Request,
    response: Response<ConsultaResponseDTO>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: { id: string } = parseWith(idParamSchema, request.params);

      const consulta: ConsultaResponseDTO =
        await this.consultaService.cancelar(id);

      response.status(200).json(consulta);
    } catch (error: unknown) {
      next(error);
    }
  };
}
