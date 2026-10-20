export interface PacienteResponseDTO {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  telefone: string | null;
  createdAt: Date;
  updatedAt: Date;
}
