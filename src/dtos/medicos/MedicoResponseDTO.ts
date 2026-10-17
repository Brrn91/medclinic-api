export interface MedicoEspecialidadeDTO {
  id: string;
  nome: string;
}

export interface MedicoResponseDTO {
  id: string;
  nome: string;
  crm: string;
  email: string;
  telefone: string | null;
  especialidade: MedicoEspecialidadeDTO;
  createdAt: Date;
  updatedAt: Date;
}
