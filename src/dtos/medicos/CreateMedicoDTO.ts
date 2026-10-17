export interface CreateMedicoDTO {
  nome: string;
  crm: string;
  email: string;
  telefone?: string;
  especialidadeId: string;
}
