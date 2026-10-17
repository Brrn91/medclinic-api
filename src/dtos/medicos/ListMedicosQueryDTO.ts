export interface ListMedicosQueryDTO {
  page: number;
  limit: number;
  nome?: string;
  especialidadeId?: string;
}
