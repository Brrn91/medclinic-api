export interface ConsultasPorMedicoItemDTO {
  medicoId: string;
  medicoNome: string;
  crm: string;
  especialidade: string;
  totalConsultas: number;
  agendadas: number;
  realizadas: number;
  canceladas: number;
}
