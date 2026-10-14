import { ItemPedido, PedidoCirurgico, TipoProcedimento } from "./produto";

export type OPMEStatus = "nao-informado" | "ok" | "necessita-atencao";

export type Especialidade = string; // Aceita qualquer especialidade do banco

export type TipoCirurgia = "urgencia" | "emergencia" | "eletiva";

export interface ItemFornecedor {
  nome: string;
  quantidade: number;
  homologado: boolean;
  fornecedoresHomologados?: string[]; // Lista de fornecedores homologados para este item
  fornecedoresNaoHomologados?: string[]; // Lista de fornecedores NÃO homologados para este item
}

export interface Patient {
  id: string;
  nome: string;
  codigoAviso?: string;
  numeroAviso?: number;
  medico: string;
  convenio: string;
  operadoraLogo?: string;
  procedimento: string;
  especialidade: Especialidade;
  opmeStatus: OPMEStatus;
  cirurgia: string;
  dataCirurgia: string;
  dataCriacaoAviso?: string;
  dataAgendadaProcedimento?: string;
  dataAgendadaInternacao?: string;
  tipoCirurgia?: TipoCirurgia;
  opmes: number;
  porte: string;
  itens: ItemFornecedor[];
  avisos?: string[];
  observacoes?: string;
  etapaProcesso?: string;
  // Campos adicionais para integração com BI
  cdCirurgia?: number;
  cdPrestador?: number;
  cdConvenio?: number;
  vlPrevisto?: number;
  // Campos de tempo
  tempoAutorizacao?: number; // DIF_CP_RA em dias
  tempoEnvio?: number; // DIF_RA_PA em dias
  // Indicador de pacote
  snPacote?: string; // "S" = Pacote, "N" = Aberto
  // Indicador de procedimento misto
  snMisto?: boolean;
  nmPaciente?: string;
  // ---- Produto: previsão de glosa e sugestão de troca ----
  hospitalId?: string;
  /** Tipo identificado automaticamente a partir do contrato e do pedido */
  tipoProcedimento?: TipoProcedimento;
  /** Risco de glosa da cirurgia (0-100) */
  riscoGlosa?: number;
  receitaPrevista?: number;
  custoPrevisto?: number;
  diasAteCirurgia?: number;
  itensPedido?: ItemPedido[];
  pedido?: PedidoCirurgico;
  // ---- Acompanhamento (tático) ----
  /** Dias desde a entrada na etapa atual */
  diasNaEtapa?: number;
  /** Prazo esperado da etapa atual (dias) */
  slaEtapa?: number;
  /** Fornecedor confirmou a entrega do material */
  materialConfirmado?: boolean;
  /** Comprador responsável pelo pedido */
  comprador?: string;
}
