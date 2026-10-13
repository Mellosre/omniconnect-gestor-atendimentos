export interface Beneficiario {
  id: string;
  nome_completo: string;
  cpf: string;
  telefone: string;
  observacoes?: string;
  data_cadastro?: string;
}

export type StatusAgendamento = 'Agendado' | 'Confirmado' | 'Concluido' | 'Falta' | 'Cancelado';

export interface Agendamento {
  id: string;
  beneficiario_id: string;
  beneficiario_nome?: string;
  beneficiario_cpf?: string;
  beneficiario_telefone?: string;
  profissional_nome: string;
  data: string;           // YYYY-MM-DD
  horario_inicio: string; // HH:mm
  horario_fim: string;    // HH:mm
  status: StatusAgendamento;
  criado_em?: string;
}
