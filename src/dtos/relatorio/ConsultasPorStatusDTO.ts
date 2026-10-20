import { ConsultaStatus } from "../../entities/Consulta";

export interface ConsultasPorStatusItemDTO {
  status: ConsultaStatus;
  total: number;
}

export interface ConsultasPorStatusResponseDTO {
  data: ConsultasPorStatusItemDTO[];
  total: number;
}
