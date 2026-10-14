// ============ OTIMIZAÇÃO DA LISTA DE COMPRAS (módulo operacional) ============
// Mesma lógica do Otimizador de Agendas, aplicada à lista de compras de OPME:
// o lote são as cirurgias com pedido a fechar e o objetivo é a margem. O que já está na
// maior margem não é mexido; o resto pode ser otimizado, sempre mostrando quanto se ganha.
// "Otimizar tudo" gera as sugestões; Compras aceita, recusa (até 3 tentativas) ou remove.

import { Patient } from "@opme/types/patient";
import { Escolha, ItemPedido, OpcaoPedido } from "@opme/types/produto";
import { compradorDoItem, entregaATempo, opcaoEscolhida, opcaoMaior, opcaoPreferida } from "@opme/lib/produto";

/** Antecedência mínima para trocar o fornecedor do pedido */
export const ANTECEDENCIA_MINIMA = 2;
export const MAX_TENTATIVAS = 3;

export interface Recusa {
  opcaoId: string;
  motivo: string;
  em: string;
}

export interface Rodada {
  numero: number;
  em: string;
  /** Sugestão por item: id da opção sugerida */
  itens: Record<string, string>;
}

export interface EstadoOtimizador {
  rodada: Rodada | null;
  /** Recusas por item (cada uma conta uma tentativa) */
  recusas: Record<string, Recusa[]>;
  /** Itens removidos do fluxo, com justificativa */
  removidos: Record<string, string>;
}

export const MOTIVOS_RECUSA = [
  "Fornecedor sem estoque",
  "Médico não aceita a troca",
  "Prazo de entrega não confirmado",
  "Preço da cotação desatualizado",
  "Outro motivo",
];

export const JUSTIFICATIVAS_REMOCAO = [
  "Item comprado fora do otimizador",
  "Item consignado pelo fornecedor",
  "Item cancelado no pedido médico",
  "Outro motivo",
];

export type SituacaoItem =
  | "sugerido" // há sugestão do otimizador aguardando aceite
  | "otimizavel" // pode ganhar margem, ainda sem sugestão gerada
  | "melhor_margem" // já está na maior margem: não mexe
  | "aceito" // Compras aceitou a sugestão
  | "definido" // Compras escolheu por conta própria
  | "nao_otimizavel" // sem como otimizar (prazo, recusas)
  | "removido";

export interface AnaliseItem {
  item: ItemPedido;
  atual?: OpcaoPedido;
  preferida?: OpcaoPedido;
  /** Opção de maior margem que ainda pode ser comprada (indicada, entrega a tempo, não recusada) */
  melhor?: OpcaoPedido;
  /** Sugestão pendente do otimizador */
  sugerida?: OpcaoPedido;
  escolhida?: OpcaoPedido;
  situacao: SituacaoItem;
  /** Ganho de margem possível sobre o que está hoje (R$) */
  ganho: number;
  /** Ganho já capturado pela escolha, sobre o preferido do médico (R$) */
  capturado: number;
  /** Item fechado abaixo da maior margem homologada: quanto ficou na mesa (R$) */
  deixado: number;
  /** Maior margem homologada entre os indicados, sem olhar prazo */
  maior?: OpcaoPedido;
  /** Quem fechou o item */
  por?: string;
  tentativas: number;
  motivo?: string;
}

export type StatusCirurgia = "sugerida" | "otimizavel" | "melhor_margem" | "nao_otimizavel" | "definida";

export const LABEL_STATUS: Record<StatusCirurgia, string> = {
  sugerida: "Sugestão pronta",
  otimizavel: "Pode ganhar",
  melhor_margem: "Na maior margem",
  nao_otimizavel: "Não otimizável",
  definida: "Pedido definido",
};

export interface AnaliseCirurgia {
  status: StatusCirurgia;
  itens: AnaliseItem[];
  ganho: number;
  capturado: number;
  pendentes: number;
  motivo?: string;
}

const porMargem = (a: OpcaoPedido, b: OpcaoPedido) => b.margem - a.margem || b.usoMedicoPct - a.usoMedicoPct;

export function analisarItem(item: ItemPedido, p: Patient, escolhas: Record<string, Escolha>, estado: EstadoOtimizador): AnaliseItem {
  const dias = p.diasAteCirurgia ?? 0;
  const preferida = opcaoPreferida(item);
  const escolhida = opcaoEscolhida(item, escolhas);
  const recusas = estado.recusas[item.id] ?? [];
  const recusadas = new Set(recusas.map((r) => r.opcaoId));
  const maior = opcaoMaior(item);
  const base = { item, preferida, escolhida, maior, tentativas: recusas.length, deixado: 0, por: compradorDoItem(item, escolhas) };

  if (estado.removidos[item.id]) return { ...base, atual: escolhida ?? preferida, situacao: "removido", ganho: 0, capturado: 0, motivo: estado.removidos[item.id] };

  if (escolhida) {
    const sugeridaId = estado.rodada?.itens[item.id];
    return {
      ...base,
      atual: escolhida,
      situacao: sugeridaId === escolhida.id ? "aceito" : "definido",
      ganho: 0,
      capturado: escolhida.margem - (preferida?.margem ?? escolhida.margem),
      deixado: maior ? Math.max(0, maior.margem - escolhida.margem) : 0,
    };
  }

  const atual = preferida;
  const indicadosHomologados = item.opcoes.filter((o) => o.origem === "medico" && o.homologado);
  const melhor = indicadosHomologados.filter((o) => !recusadas.has(o.id) && entregaATempo(o, dias)).sort(porMargem)[0];
  const ganho = melhor && atual ? Math.max(0, melhor.margem - atual.margem) : 0;
  const sugeridaId = estado.rodada?.itens[item.id];
  const sugerida = sugeridaId && !recusadas.has(sugeridaId) ? item.opcoes.find((o) => o.id === sugeridaId) : undefined;

  if (dias < ANTECEDENCIA_MINIMA) {
    return { ...base, atual, situacao: "nao_otimizavel", ganho: 0, capturado: 0, motivo: `Cirurgia em menos de ${ANTECEDENCIA_MINIMA} dias: segue o pedido do médico` };
  }
  if (recusas.length >= MAX_TENTATIVAS) {
    return { ...base, atual, situacao: "nao_otimizavel", ganho: 0, capturado: 0, motivo: `${MAX_TENTATIVAS} recusas: definir manualmente` };
  }
  if (!melhor) {
    const motivo = indicadosHomologados.length === 0
      ? "Nenhum fornecedor indicado é homologado pela operadora: pedir nova indicação ao médico"
      : "Nenhum fornecedor indicado e homologado entrega antes da cirurgia";
    return { ...base, atual, situacao: "nao_otimizavel", ganho: 0, capturado: 0, motivo };
  }
  if (sugerida) return { ...base, atual, melhor, sugerida, situacao: "sugerido", ganho: Math.max(0, sugerida.margem - (atual?.margem ?? 0)), capturado: 0 };
  if (ganho > 0) return { ...base, atual, melhor, situacao: "otimizavel", ganho, capturado: 0 };
  return { ...base, atual, melhor, situacao: "melhor_margem", ganho: 0, capturado: 0 };
}

export function analisarCirurgia(p: Patient, escolhas: Record<string, Escolha>, estado: EstadoOtimizador): AnaliseCirurgia {
  const itens = (p.itensPedido ?? []).map((i) => analisarItem(i, p, escolhas, estado));
  const abertos = itens.filter((a) => !["aceito", "definido", "removido"].includes(a.situacao));
  const ganho = itens.reduce((s, a) => s + a.ganho, 0);
  const capturado = itens.reduce((s, a) => s + a.capturado, 0);
  const pendentes = itens.filter((a) => a.situacao === "sugerido").length;
  const naoOtimizaveis = abertos.filter((a) => a.situacao === "nao_otimizavel");

  const status: StatusCirurgia =
    abertos.length === 0
      ? "definida"
      : pendentes > 0
        ? "sugerida"
        : ganho > 0
          ? "otimizavel"
          : naoOtimizaveis.length > 0
            ? "nao_otimizavel"
            : "melhor_margem";

  return { status, itens, ganho, capturado, pendentes, motivo: naoOtimizaveis[0]?.motivo };
}

/** Rodada do "Otimizar tudo": uma sugestão (a de maior margem) para cada item que pode ganhar */
export function gerarRodada(patients: Patient[], escolhas: Record<string, Escolha>, estado: EstadoOtimizador): Rodada {
  const semRodada = { ...estado, rodada: null };
  const itens: Record<string, string> = {};
  patients
    .filter((p) => (p.diasAteCirurgia ?? -1) >= 0)
    .forEach((p) =>
      analisarCirurgia(p, escolhas, semRodada).itens.forEach((a) => {
        if (a.situacao === "otimizavel" && a.melhor) itens[a.item.id] = a.melhor.id;
      })
    );
  // Sugestões ainda pendentes da rodada anterior continuam valendo
  Object.entries(estado.rodada?.itens ?? {}).forEach(([itemId, opcaoId]) => {
    if (!itens[itemId] && !(estado.recusas[itemId] ?? []).some((r) => r.opcaoId === opcaoId)) itens[itemId] = opcaoId;
  });
  return { numero: (estado.rodada?.numero ?? 0) + 1, em: new Date().toISOString(), itens };
}
