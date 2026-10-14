// ============================================================
// DOMÍNIO — tipos da plataforma unificada (SurgiFlow + OPME.AI)
// Spec: docs/superpowers/specs/2026-10-14-plataforma-unificada-design.md
// ============================================================

export type NivelPlano = "Básico" | "Especial" | "Executivo";
export type LinhaCuidado = "cardio" | "trauma" | "ortopedia" | "neuro" | "hemodinamica" | "obstetricia";
export type StatusPedido = "rascunho" | "aguardando_medico" | "esperando_confirmacao" | "confirmado";
export type StatusPadrao = "pre_modelo" | "em_ajuste" | "vigente";

export interface Hospital {
  id: string;
  nome: string;
  cidade: string;
  erp: string;
  implantacao: string; // data ISO
  fontes: { tabela: string; periodo: string; registros: number }[];
}

export interface Medico {
  id: string;
  nome: string;
  especialidade: string;
  crm: string;
}

export interface Operadora {
  id: string;
  nome: string;
  /** Quanto cada nível de plano paga do honorário de referência */
  fatorPlano: Record<NivelPlano, number>;
  prazoPagamentoDias: number;
}

export interface Procedimento {
  id: string;
  codigo: string; // TUSS principal
  nome: string;
  linha: LinhaCuidado;
  /** Honorário do cirurgião no plano que melhor paga */
  honorarioReferencia: number;
  volumeMes: number;
  tempoCirurgiaMin: number;
}

export interface ItemCatalogo {
  id: string;
  nome: string;
  caracteristica: string;
  classe: "OP" | "ME";
}

export interface Marca {
  id: string;
  itemId: string;
  fabricante: string;
  fornecedor: string;
  custo: number; // R$ por unidade
  liberacaoDias: number;
  glosaPct: number;
  entregaDias: number;
  /** Diferença média no tempo de cirurgia com esta marca (min) */
  tempoCirurgiaDeltaMin: number;
  prazoPagamentoDias: number; // negociado com o fornecedor
  homologadaEm: string[]; // ids de operadora
}

export interface Protocolo {
  criterios: string[];
  documentos: string[];
  fonte: string;
  revisao: string; // data ISO
}

export type CondicaoTipo =
  | "homologados"
  | "dentro_padrao"
  | "codigo_recomendado"
  | "documentos"
  | "prazo_liberacao"
  | "margem_minima"
  | "fornecedor_preferencial";

export interface CondicaoComplemento {
  tipo: CondicaoTipo;
  valor: number; // R$
  parametro?: number; // dias (prazo) ou % (margem)
}

export type RegraComplemento =
  | { modo: "predefinido"; valor: number }
  | { modo: "condicoes"; condicoes: CondicaoComplemento[] };

export interface ItemPadrao {
  itemId: string;
  qtdTipica: number;
  /** Leque base (vale para todas as operadoras; a homologação filtra por operadora) */
  aceitas: string[];
  preferenciais: string[];
}

export interface SugestaoAlteracao {
  id: string;
  titulo: string;
  motivo: string;
  tipo: "trocar_marca" | "incluir_item";
  itemId: string;
  de?: string; // marcaId que sai
  para: string; // marcaId que entra
  antes: string;
  depois: string;
}

export interface Padrao {
  procedimentoId: string;
  versao: number;
  status: StatusPadrao;
  aprovadoEm?: string;
  revisaoEm?: string;
  itens: ItemPadrao[];
  codigosRecomendados: { codigo: string; descricao: string }[];
  codigosAlerta: { codigo: string; descricao: string; glosaPct: number }[];
  protocolo: Protocolo;
  complemento: RegraComplemento;
  /** Itens que os médicos costumam pedir fora do pré-modelo */
  pedidosPorFora: { itemId: string; freqPct: number }[];
  sugestoes: SugestaoAlteracao[];
  historico: { versao: number; data: string; mudanca: string }[];
}

export type ContratoOperadora =
  | {
      operadoraId: string;
      procedimentoId: string;
      tipo: "pacote";
      teto: number;
      custoHospitalar: number;
      honorario: Record<NivelPlano, number>;
    }
  | {
      operadoraId: string;
      procedimentoId: string;
      tipo: "aberta";
      /** Quanto a operadora paga por unidade de cada item */
      tabelaItem: Record<string, number>;
      honorario: Record<NivelPlano, number>;
    };

export interface ContratoMedico {
  medicoId: string;
  procedimentos: string[];
  participaComplemento: boolean;
  repasseEletivaDias: number;
  repasseUrgenciaDias: number;
  vigencia: string;
}

export interface ItemPedido {
  itemId: string;
  marcaId: string;
  qtd: number;
}

export interface Ajuste {
  id: string;
  motivo: string;
  itemId?: string;
  resolvido: boolean;
}

export interface Pedido {
  id: string;
  medicoId: string;
  secretaria?: string;
  paciente: { nome: string; cpf: string };
  operadoraId: string;
  plano: NivelPlano;
  procedimentoId: string;
  codigos: string[];
  itens: ItemPedido[];
  documentos: string[];
  justificativa?: string;
  status: StatusPedido;
  /** Motivo de devolução do médico para a secretária */
  devolvido?: string;
  ajustes: Ajuste[];
  aceitoForaPadrao?: { motivo: string };
  urgencia: boolean;
  criadoEm: string;
  dataCirurgia: string;
}

export interface Dominio {
  hospitais: Hospital[];
  medicos: Medico[];
  operadoras: Operadora[];
  procedimentos: Procedimento[];
  itens: ItemCatalogo[];
  marcas: Marca[];
  padroes: Record<string, Padrao>;
  contratosOperadora: ContratoOperadora[];
  contratosMedico: ContratoMedico[];
}

export interface CondicaoAvaliada {
  tipo: CondicaoTipo;
  label: string;
  valor: number;
  cumprida: boolean;
  avisoJuridico: boolean;
}

export interface Avaliacao {
  completo: boolean;
  checklist: { id: string; label: string; ok: boolean; detalhe?: string }[];
  foraProtocolo: string[]; // itemIds
  foraPadrao: string[]; // marcaIds fora do leque
  naoHomologados: string[]; // marcaIds
  honorario: { valor: number; garantido: boolean };
  complemento: {
    total: number;
    garantido: number;
    perdido: number;
    motivo?: string;
    condicoes: CondicaoAvaliada[];
  };
  recebimento: { valor: number; dias: number; data: string };
  liberacaoDias: number;
  riscoGlosa: number;
  /** Só para hospital, gestão e compras: médico e secretária nunca leem este campo */
  hospital: {
    tipo: "pacote" | "aberta";
    custoOpme: number;
    margem: number;
    margemPct: number;
    teto?: number;
    consumoTeto?: number;
  };
}
