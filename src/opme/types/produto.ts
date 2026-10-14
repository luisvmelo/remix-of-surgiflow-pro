// ============ TIPOS DO PRODUTO (previsão de glosa e sugestão de troca) ============

export type TipoGlosa = "tecnica" | "administrativa" | "valor";

export type NivelRisco = "baixo" | "medio" | "alto";

export type TipoFornecimento = "pacote" | "fornecimento_direto" | "cobranca_em_conta";

export type TipoProcedimento = "Pacote" | "Aberto" | "Misto";

export interface Hospital {
  id: string;
  nome: string;
  cidade: string;
  erp: "MV Soul" | "Tasy";
}

/** Por que a alternativa é sugerida */
export type CategoriaSugestao = "menor_glosa" | "maior_rentabilidade" | "equivalente";

export const LABEL_CATEGORIA_SUGESTAO: Record<CategoriaSugestao, string> = {
  menor_glosa: "Fornecedor com menor glosa",
  maior_rentabilidade: "Fornecedor com maior rentabilidade",
  equivalente: "Item equivalente (ANVISA)",
};

/** Sugestão da IA para reduzir risco de glosa e/ou aumentar margem de um item */
export interface SugestaoTroca {
  id: string;
  /** Uma alternativa pode atender mais de um critério (ex.: menor glosa e maior rentabilidade) */
  categorias: CategoriaSugestao[];
  /** Custo unitário de compra da alternativa (R$) */
  valorUnitario: number;
  /** "fornecedor" = mesmo item, outro fornecedor; "item" = item equivalente */
  tipo: "fornecedor" | "item";
  itemOriginal: string;
  fornecedorOriginal: string;
  itemSugerido: string;
  fornecedorSugerido: string;
  /** Troca por equivalência técnica (registro ANVISA equivalente) */
  equivalenciaTecnica: boolean;
  registroAnvisa: string;
  riscoAntes: number;
  riscoDepois: number;
  /** Ganho de margem estimado em R$ para a cirurgia (positivo = ganho) */
  margemDelta: number;
  motivo: string;
}

/** OP = órteses e próteses; ME = materiais especiais */
export type ClasseOpme = "OP" | "ME";

export const LABEL_CLASSE: Record<ClasseOpme, string> = {
  OP: "Órteses e próteses",
  ME: "Materiais especiais",
};

/** Por que uma opção se destaca na montagem do pedido */
export type DestaqueOpcao = "preferido_medico" | "maior_margem" | "menor_custo" | "menor_glosa";

export const LABEL_DESTAQUE: Record<DestaqueOpcao, string> = {
  preferido_medico: "Preferido do médico",
  maior_margem: "Maior margem",
  menor_custo: "Menor custo",
  menor_glosa: "Menor glosa",
};

/**
 * Uma combinação item + fornecedor para um item do pedido.
 * origem "medico": um dos 3 fornecedores que o médico indicou no pedido cirúrgico.
 * origem "alternativa": fora da indicação (outro fornecedor ou item equivalente ANVISA); precisa do aval do médico.
 */
export interface OpcaoPedido {
  id: string;
  origem: "medico" | "alternativa";
  fornecedor: string;
  item: string;
  registroAnvisa: string;
  equivalente: boolean;
  /** Custo unitário de compra (R$) */
  custoUnitario: number;
  /** Valor unitário esperado de recebimento da operadora (R$) */
  cobradoUnitario: number;
  riscoGlosa: number;
  /** Margem esperada do item com esta opção (R$, já descontada a glosa prevista) */
  margem: number;
  /** Histórico do médico: em quantas das suas cirurgias com este item usou este fornecedor */
  usoMedicoPct: number;
  usoMedicoCirurgias: number;
  /** Nota de preferência do médico (0 a 5), derivada do histórico de uso */
  notaMedico: number;
  /**
   * Homologado pela operadora para este item (o sistema substitui a regulação).
   * Não homologado: a operadora não libera, e o item vira glosa certa.
   */
  homologado: boolean;
  destaques: DestaqueOpcao[];
}

/** Pedido já fechado por um comprador (antes desta sessão) */
export interface CompraFechada {
  opcaoId: string;
  /** Nome do comprador */
  por: string;
  em: string;
}

/** Item extraído do pedido cirúrgico, com risco calculado */
export interface ItemPedido {
  id: string;
  nome: string;
  classe: ClasseOpme;
  /** Cirurgias do médico com este item no histórico */
  historicoMedicoCirurgias: number;
  /** Os 3 fornecedores indicados pelo médico e as alternativas fora da indicação */
  opcoes: OpcaoPedido[];
  quantidade: number;
  tipoFornecimento: TipoFornecimento;
  fornecedor: string;
  fornecedoresCotacao: string[];
  registroAnvisa: string;
  codigoTuss: string;
  /** Custo unitário de compra (R$) */
  valorUnitario: number;
  /** Valor unitário esperado de recebimento da operadora (R$) */
  valorCobrado: number;
  riscoGlosa: number;
  tipoGlosa?: TipoGlosa;
  motivoRisco: string;
  sugestoes: SugestaoTroca[];
  /** Compra já fechada para o item, quando a cirurgia passou da autorização */
  compra?: CompraFechada;
}

/** Metadados da leitura automática do pedido cirúrgico */
export interface PedidoCirurgico {
  arquivo: string;
  origem: "MV Soul" | "Tasy";
  paginas: number;
  lidoEm: string;
  confianca: number;
  cid: string;
  justificativa: string;
  camposRevisar: string[];
}

/** Escolha de Compras para um item do pedido (uma opção entre as cotadas) */
export interface Escolha {
  itemId: string;
  cirurgiaId: string;
  opcaoId: string;
  em: string;
  por: string;
}

export interface ConfigProduto {
  rankingFornecedorMedico: boolean;
  estatisticasMedico: boolean;
  equivalenciaTecnica: boolean;
  conveniosExcluidos: string[];
}

export const nivelDoRisco = (risco: number): NivelRisco =>
  risco >= 45 ? "alto" : risco >= 20 ? "medio" : "baixo";

export const LABEL_TIPO_GLOSA: Record<TipoGlosa, string> = {
  tecnica: "Técnica",
  administrativa: "Administrativa",
  valor: "Valor",
};

export const LABEL_TIPO_FORNECIMENTO: Record<TipoFornecimento, string> = {
  pacote: "Pacote",
  fornecimento_direto: "Fornecimento Direto",
  cobranca_em_conta: "Cobrança em Conta",
};
