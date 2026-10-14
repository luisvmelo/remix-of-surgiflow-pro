// ============ TIPOS PARA BI GERAL DO SISTEMA ============

export interface EtapaWorkflow {
  nome: string;
  quantidade: number;
  valorTotal: number;
  cor: string; // Cor de fundo do card
}

export interface RankingItem {
  nome: string;
  valor: number;
}

export interface RankingQuantidade {
  nome: string;
  quantidade: number;
}

export interface TopCustos {
  porPlano: RankingItem[];
  porMedico: RankingItem[];
  porCirurgia: RankingItem[];
}

export interface TempoMedio {
  autorizacao: number; // DIF_CP_RA em dias
  envio: number; // DIF_RA_PA em dias
}

export interface DistribuicaoTipo {
  tipo: 'Pacote' | 'Não-Pacote' | 'Mista';
  quantidade: number;
  percentual: number;
}

export interface BIGeralData {
  workflow: EtapaWorkflow[];
  topCustos: TopCustos;

  // Novos rankings de agendamentos
  medicosAgendamentos: RankingQuantidade[];
  procedimentosAgendamentos: RankingQuantidade[];
  operadorasAgendamentos: RankingQuantidade[];
  especialidadesDistribuicao: RankingQuantidade[];

  // Análise de tempo
  tempoMedio: TempoMedio;

  // Distribuição de tipos
  distribuicaoTipos: DistribuicaoTipo[];
}
