import { ConsultaStatus } from "../../entities/Consulta";

export interface ConsultaMedicoDTO {
  id: string;
  nome: string;
  crm: string;
}

export interface ConsultaPacienteDTO {
  id: string;
  nome: string;
}

export interface ConsultaResponseDTO {
  id: string;
  dataHora: Date;
  status: ConsultaStatus;
  observacoes: string | null;
  medico: ConsultaMedicoDTO;
  paciente: ConsultaPacienteDTO;
  createdAt: Date;
  updatedAt: Date;
}
