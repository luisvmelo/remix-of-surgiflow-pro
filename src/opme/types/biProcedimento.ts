import { Patient } from "./patient";

export interface PacienteBI {
  id: string;
  nome: string;
  medico_responsavel: string;
  convenio: string;
  procedimento_principal: string;
  especialidade: string;
  operadoraLogo?: string;
  cdCirurgia?: number;
  cdConvenio?: number;
  cdPrestador?: number;
}

export interface KPIsProcedimento {
  cobertura_pct: number;
  custo_medio: number;
  lucro_medio: number;
  glosas_total: number;
  total_cirurgias: number;
  variacao_custo_pct: number;
  variacao_lucro_pct: number;
  taxa_glosa_periodo_pct: number;
}

export interface ItemLista {
  nome: string;
  quantidade: number;
}

export interface ListasItens {
  homologados: ItemLista[];
  nao_homologados: ItemLista[];
}

export type ImpactoTroca = '↓ custo' | '↑ eficácia' | '↓ glosa';

export interface TrocaSugerida {
  de_item: string;
  para_item: string;
  impacto: ImpactoTroca;
  margem_delta?: number;
}

export interface FornecedorSugerido {
  nome: string;
  score_0_100: number;
  motivo: string;
}

export interface ItensEquivalentes {
  grupo: string[];
}

export interface ChanceGlosaSerie {
  volume: number;
  prob_pct: number;
}

export interface ChanceGlosaData {
  series: ChanceGlosaSerie[];
  texto_tooltip: string;
}

export interface DistribuicaoMotivo {
  motivo: string;
  percentual: number;
  cor: 'error' | 'warning' | 'neutral';
}

export interface MedicoStats {
  glosa_pct: number;
  total_cirurgias_glosadas?: number;
  total_cirurgias?: number;
  distribuicao_motivos: DistribuicaoMotivo[];
  custo_medio: number;
  variacao_custo_pct: number;
}

export interface RankingFornecedorMedico {
  fornecedor: string;
  score_0_100: number;
  quantidade?: number; // Total de vezes que o médico pediu o fornecedor
}

export interface RankingFornecedorProc {
  fornecedor: string;
  taxa_glosa_pct: number;
  custo_medio: number;
  recomendado: boolean;
  quantidade?: number; // Total de itens/pedidos
}

export interface ItemComumHistorico {
  nome: string;
  frequencia: number; // Número de vezes que aparece
  penetracao_pct: number; // % de cirurgias em que o item aparece
  fornecedor: string; // Fornecedor mais comum deste item
  media_qtd: number; // Média de quantidade pedida por cirurgia
  valor_medio?: number; // Valor médio do item
}

export interface ItemMaisGlosado {
  nome: string;
  quantidade_glosas: number;
  valor_medio_glosa: number;
  taxa_glosa_pct: number;
}

export interface HistoricoGlosas {
  itens_comuns: ItemComumHistorico[];
  valor_medio_glosado: number;
  top_itens_glosados: ItemMaisGlosado[];
}

export interface ProcedimentoGlosado {
  data: string;
  numero_atendimento: number;
  codigo_aviso: number;
  nome_medico: string;
  valor_opme_glosado: number;
}

export interface BIProcedimentoData {
  paciente: PacienteBI;
  /** Cirurgia completa, com itens do pedido, risco e sugestões do produto */
  cirurgia: Patient;
  kpis_procedimento: KPIsProcedimento;
  listas_itens: ListasItens;
  trocas_sugeridas: TrocaSugerida[];
  fornecedores_sugeridos: FornecedorSugerido[];
  itens_equivalentes: ItensEquivalentes[];
  chance_glosa: ChanceGlosaData;
  medico_stats: MedicoStats;
  ranking_fornecedores_medico: RankingFornecedorMedico[];
  ranking_fornecedores_proc: RankingFornecedorProc[];
  historico_glosas: HistoricoGlosas;
  procedimentos_glosados_operadora: ProcedimentoGlosado[];
}
