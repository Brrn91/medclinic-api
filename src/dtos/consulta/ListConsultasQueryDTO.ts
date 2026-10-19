import { ConsultaStatus } from "../../entities/Consulta";

export interface ListConsultasQueryDTO {
  page: number;
  limit: number;
  status?: ConsultaStatus;
  medicoId?: string;
  pacienteId?: string;
  dataInicio?: Date;
  dataFim?: Date;
}
