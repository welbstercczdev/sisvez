import React from 'react';

// ====================== CORREÇÃO E CENTRALIZAÇÃO APLICADA AQUI ======================
export type MembroStatus = 'Ativo' | 'Folga' | 'Férias' | 'Curso' | 'GLM' | 'Observação' | 'Emprestado';

// A lista completa de status, exportada para ser usada nos seletores
export const STATUSES: MembroStatus[] = ['Ativo', 'Folga', 'Férias', 'Curso', 'GLM', 'Observação'];

// A definição de cores completa, agora centralizada e exportada
export const STATUS_COLORS: Record<MembroStatus, { bg: string; text: string; dot: string; }> = {
    'Ativo': { bg: 'bg-green-100 dark:bg-green-900/70', text: 'text-green-800 dark:text-green-200', dot: 'bg-green-500' },
    'Folga': { bg: 'bg-sky-100 dark:bg-sky-900/70', text: 'text-sky-800 dark:text-sky-200', dot: 'bg-sky-500' },
    'Férias': { bg: 'bg-orange-100 dark:bg-orange-900/70', text: 'text-orange-800 dark:text-orange-200', dot: 'bg-orange-500' },
    'Curso': { bg: 'bg-violet-100 dark:bg-violet-900/70', text: 'text-violet-800 dark:text-violet-200', dot: 'bg-violet-500' },
    'GLM': { bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-800 dark:text-slate-200', dot: 'bg-slate-500' },
    'Observação': { bg: 'bg-yellow-100 dark:bg-yellow-900/70', text: 'text-yellow-800 dark:text-yellow-200', dot: 'bg-yellow-500' },
    'Emprestado': { bg: 'bg-pink-100 dark:bg-pink-900/70', text: 'text-pink-800 dark:text-pink-200', dot: 'bg-pink-500' },
};

// =======================================================================

export interface Role {
  uuid: string;
  name: string;
  description: string;
  color: string;
}

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
    CLASSIF: string;
    isAgrupamento?: boolean;
    agrupamentoNome?: string;
    statusControleCriadouros?: 'Pendente' | 'Demandado';
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
  uuid: string;
  id: number | string;
  name: string;
  roles: string[];
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

export interface MembroComStatus extends User {
  status: MembroStatus;
  observacao?: string;
}

export interface MembroPresente extends MembroComStatus {
  equipeOrigem?: {
    id: string;
    nome: string;
  };
}

export interface FormacaoDiaria {
  uuid?: string;
  data: string;
  equipeId: string;
  nomeEquipe: string;
  lider: User;
  membrosPresentes: MembroPresente[];
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

export interface OrganizacaoSalva {
  id: string;
  data: string;
  dataSalvamento: string;
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