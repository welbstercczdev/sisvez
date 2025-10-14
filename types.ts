export interface NavItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isHeading?: boolean;
  children?: {
    id: string;
    title: string;
  }[];
}

export interface SinanCase {
  id: number;
  paciente: string;
  agravo: 'Dengue' | 'Chikungunya' | 'Zika';
  dataNotificacao: string;
  classificacao: 'Confirmado' | 'Descartado' | 'Suspeito';
  hospitalizado: boolean;
  obito: boolean;
}

export interface Atividade {
    ID: string;
    AGRAVO: string;
    ANO: string;
    NOTIF_DT: string;
    PAC_NOME: string;
    DT_SINT: string;
    PAC_LOGR: string;
    PAC_NUM: string;
    PAC_BAIR: string;
    PAC_REG: string;
    PAC_CDD: string;
    CLASSIF: string; // Internal classification, not from CSV
    isAgrupamento?: boolean;
    agrupamentoNome?: string;

    // ====================== MODIFICAÇÃO APLICADA AQUI ======================
    // O status agora reflete exatamente o que o backend envia ('Pendente' ou 'Demandado')
    statusControleCriadouros?: 'Pendente' | 'Demandado';
    // =======================================================================
    
    dataControleCriadouros?: string;
    equipeControleCriadouros?: string;
    relacaoQuadrasControleCriadouros?: string;
}

export interface Agrupamento {
  nome: string;
  data: string;
  totalNotificacoes: number;
  dengueConfirmado: number;
  dengueMuitoProvavel: number;
  chikungunyaConfirmado: number;
  chikungunyaMuitoProvavel: number;
  pontuacaoTotal: number;
  regiao: string;
  area: number;
  latitude: string;
  longitude: string;
}

export interface User {
  id: number;
  name: string;
}

export type HistoricoAcao = 'criacao' | 'edicao_nome' | 'troca_lider' | 'add_membro' | 'rem_membro' | 'mudanca_status';

export interface HistoricoEquipe {
  id: string;
  data: string;
  usuario: string;
  acao: HistoricoAcao;
  detalhes: {
    de?: string;
    para?: string;
    membro?: string;
  };
}

export interface Equipe {
  id: string;
  nome: string;
  lider: User;
  membros: User[];
  status: 'Ativo' | 'Inativo';
  historico?: HistoricoEquipe[];
}

export interface Demanda {
  id: string;
  tipo: 'Nebulização' | 'Controle de Criadouro';
  endereco: string;
  responsavel: User;
  status: 'Pendente' | 'Em Andamento' | 'Concluído';
  prazo: string;
  dataCriacao: string;
  observacoes: string;
  notificacaoOrigem: string;
}

export interface FormacaoDiaria {
  data: string;
  equipeId: string;
  nomeEquipe: string;
  lider: User;
  membrosPresentes: User[];
  veiculo: string;
  observacoes: string;
}

export type Funcao = 'Aplicador' | 'Anotador' | 'Facilitador' | 'Motorista' | 'Operador';

export interface MembroComFuncao extends User {
  funcoes: Funcao[];
}

export interface Grupo {
  id: string;
  nome: string;
  membros: MembroComFuncao[];
}

export type MembroStatus = 'Ativo' | 'Folga' | 'Férias' | 'Curso' | 'GLM' | 'Observação';

export interface MembroComStatus extends User {
  status: MembroStatus;
  observacao?: string;
}

export interface OrganizacaoSalva {
  id: string;
  data: string; // The date the organization was FOR (e.g., '2024-08-15')
  dataSalvamento: string; // ISO string of when it was saved
  usuarioSalvo: User;
  equipe: Equipe;
  grupos: Grupo[];
  membrosStatus: MembroComStatus[];
}

export interface Ferias {
  id: string;
  funcionario: User;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  status: 'Agendada' | 'Em Andamento' | 'Concluída' | 'Cancelada';
}