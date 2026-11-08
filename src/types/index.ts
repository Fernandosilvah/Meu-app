export type OrderStatus = 'PENDENTE' | 'CONFIRMADO' | 'SUGERIDO' | 'RECUSADO' | 'CANCELADO';
export type LocationType = 'PRESENCIAL' | 'DOMICILIO';

export interface IntUser {
  user_id: string; // UUID
  email: string;
  access_level: string;
  enabled: boolean;
  name?: string;
}

export interface Empresa {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
  mensagem: string;
  duracao_min: number;
  vagas_por_horario: number;
  antecedencia_horas: number;
  atende_domicilio: boolean;
}

export interface HorarioAtendimento {
  dia_semana: number; // 0 = Domingo ... 6 = Sábado
  ativo: boolean;
  inicio: string; // "HH:MM"
  fim: string; // "HH:MM"
  pausa_inicio: string | null;
  pausa_fim: string | null;
}

export interface Produto {
  id: number;
  slug: string;
  nome: string;
  subtitulo: string;
  resumo: string;
  para_quem: string;
  documentos: string; // Separado por |
  icone: string;
  ordem: number;
  ativo: boolean;
  atende_domicilio: boolean;
}

export interface Cliente {
  id: number;
  usuario_id: string; // UUID
  nome: string;
  telefone: string;
  cpf: string;
  email: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Agendamento {
  id: number;
  cliente_id: number;
  usuario_id: string; // UUID
  produto_id: number;
  data_agendada: string; // "YYYY-MM-DD"
  hora: string; // "HH:MM"
  local_tipo: LocationType;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  referencia?: string | null;
  observacao?: string | null;
  status: OrderStatus;
  nova_data?: string | null;
  nova_hora?: string | null;
  mensagem_consultor?: string | null;
  criado_em: string;
  atualizado_em: string;

  // Joined fields for view
  produto?: Produto;
  cliente?: Cliente;
  fotos_count?: number;
}

export interface Documento {
  id: number;
  agendamento_id: number;
  nome?: string | null;
  mime?: string | null; // image/jpeg
  conteudo: string; // Data URL
  criado_em: string;
}

export interface OcupadoSlot {
  data_agendada: string;
  hora: string;
  count: number;
}

export interface AdminUserItem {
  usuario_id: string;
  email: string;
  is_current: boolean;
}

export interface AdminCounters {
  novos: number;
  confirmados: number;
  sugeridos: number;
  todos: number;
}
