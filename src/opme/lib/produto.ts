// ============ CÁLCULOS DO PRODUTO ============
// Risco, margem e prioridade de uma cirurgia, considerando as escolhas de Compras.

import { Patient } from "@opme/types/patient";
import { ClasseOpme, Escolha, ItemPedido, OpcaoPedido } from "@opme/types/produto";
import { prazoEntrega } from "@opme/mock/catalogo";

/**
 * Fração do valor que se perde quando o item é glosado (glosa parcial e
 * recuperação por recurso fazem a perda ser menor que o valor inteiro).
 */
export const SEVERIDADE_GLOSA = 0.5;

/** Risco da cirurgia: probabilidade de ao menos uma glosa relevante nos itens */
export function riscoCirurgia(riscos: number[]): number {
  const semGlosa = riscos.reduce((acc, r) => acc * (1 - (r / 100) * 0.4), 1);
  return Math.round(Math.max(2, Math.min(97, (1 - semGlosa) * 100)));
}

/** Margem esperada por unidade (R$): recebimento menos perda esperada por glosa menos custo */
export const margemUnitaria = (cobrado: number, custo: number, risco: number) =>
  cobrado * (1 - (risco / 100) * SEVERIDADE_GLOSA) - custo;

/** Opção que o médico mais usa: é a do pedido enquanto Compras não escolhe */
export const opcaoPreferida = (item: ItemPedido): OpcaoPedido | undefined =>
  item.opcoes.find((o) => o.origem === "medico") ?? item.opcoes[0];

/** O fornecedor entrega antes da cirurgia (precisa de 1 dia de folga) */
export const entregaATempo = (o: OpcaoPedido, diasAteCirurgia?: number) =>
  diasAteCirurgia === undefined || prazoEntrega(o.fornecedor) <= diasAteCirurgia - 1;

/**
 * Maior margem entre os 3 fornecedores indicados pelo médico, homologados pela operadora e que
 * entregam antes da cirurgia (empate: o que o médico mais usa). Sem nenhum viável, fica o preferido.
 */
export const opcaoMelhor = (item: ItemPedido, diasAteCirurgia?: number): OpcaoPedido | undefined =>
  item.opcoes
    .filter((o) => o.origem === "medico" && o.homologado && entregaATempo(o, diasAteCirurgia))
    .sort((a, b) => b.margem - a.margem || b.usoMedicoPct - a.usoMedicoPct)[0] ?? opcaoPreferida(item);

/** Escolha de Compras nesta sessão ou, sem ela, a compra já fechada pelo comprador */
export const opcaoEscolhida = (item: ItemPedido, escolhas: Record<string, Escolha>): OpcaoPedido | undefined => {
  const id = escolhas[item.id]?.opcaoId ?? item.compra?.opcaoId;
  return id ? item.opcoes.find((o) => o.id === id) : undefined;
};

/** Quem fechou o item: o usuário desta sessão ou o comprador do pedido */
export const compradorDoItem = (item: ItemPedido, escolhas: Record<string, Escolha>) =>
  escolhas[item.id]?.por ?? item.compra?.por;

/** Maior margem que o item poderia ter: indicados pelo médico e homologados (sem olhar prazo) */
export const opcaoMaior = (item: ItemPedido): OpcaoPedido | undefined =>
  item.opcoes
    .filter((o) => o.origem === "medico" && o.homologado)
    .sort((a, b) => b.margem - a.margem || b.usoMedicoPct - a.usoMedicoPct)[0];

/** Opção em vigor: a escolhida por Compras ou, sem escolha, a preferida do médico */
export const opcaoAtual = (item: ItemPedido, escolhas: Record<string, Escolha>) =>
  opcaoEscolhida(item, escolhas) ?? opcaoPreferida(item);

/** Valor exposto a glosa com uma opção (R$) */
export const valorExposto = (o: OpcaoPedido | undefined, quantidade: number) =>
  o ? o.cobradoUnitario * quantidade * (o.riscoGlosa / 100) : 0;

/** Custo de compra com uma opção (R$) */
export const custoOpcao = (o: OpcaoPedido | undefined, quantidade: number) => (o ? o.custoUnitario * quantidade : 0);

export interface ResumoCirurgia {
  /** Risco com a opção preferida do médico em todos os itens */
  risco: number;
  /** Risco com as escolhas de Compras */
  riscoAtual: number;
  /** Margem com a opção preferida do médico */
  margem: number;
  /** Margem com as escolhas de Compras */
  margemAtual: number;
  /** Margem com a maior margem possível nos itens ainda sem escolha */
  margemPossivel: number;
  /** Ganho ainda disponível nos itens sem escolha */
  margemPotencial: number;
  valorEmRisco: number;
  custoAtual: number;
  itens: number;
  definidos: number;
  aDefinir: number;
  /** Escolhas fora dos 3 fornecedores indicados (precisam do aval do médico) */
  foraIndicacao: number;
  custoPorClasse: Record<ClasseOpme, number>;
}

export function resumoCirurgia(p: Patient, escolhas: Record<string, Escolha>): ResumoCirurgia {
  const itens = p.itensPedido ?? [];
  const pref = itens.map((i) => opcaoPreferida(i));
  const atual = itens.map((i) => opcaoAtual(i, escolhas));
  const escolhidas = itens.map((i) => opcaoEscolhida(i, escolhas));
  const possivel = itens.map((i, k) => {
    const melhor = escolhidas[k] ?? opcaoMelhor(i, p.diasAteCirurgia);
    return melhor && atual[k] && melhor.margem < atual[k]!.margem ? atual[k] : melhor;
  });
  const soma = (lista: Array<OpcaoPedido | undefined>, f: (o: OpcaoPedido, i: ItemPedido) => number) =>
    lista.reduce((s, o, k) => s + (o ? f(o, itens[k]) : 0), 0);

  const margemAtual = soma(atual, (o) => o.margem);
  const margemPossivel = soma(possivel, (o) => o.margem);
  const custoPorClasse: Record<ClasseOpme, number> = { OP: 0, ME: 0 };
  atual.forEach((o, k) => { custoPorClasse[itens[k].classe] += custoOpcao(o, itens[k].quantidade); });

  return {
    risco: itens.length ? riscoCirurgia(pref.map((o) => o?.riscoGlosa ?? 0)) : p.riscoGlosa ?? 0,
    riscoAtual: itens.length ? riscoCirurgia(atual.map((o) => o?.riscoGlosa ?? 0)) : p.riscoGlosa ?? 0,
    margem: soma(pref, (o) => o.margem),
    margemAtual,
    margemPossivel,
    margemPotencial: Math.max(0, margemPossivel - margemAtual),
    valorEmRisco: soma(atual, (o, i) => valorExposto(o, i.quantidade)),
    custoAtual: soma(atual, (o, i) => custoOpcao(o, i.quantidade)),
    itens: itens.length,
    definidos: escolhidas.filter(Boolean).length,
    aDefinir: escolhidas.filter((o) => !o).length,
    foraIndicacao: escolhidas.filter((o) => o?.origem === "alternativa").length,
    custoPorClasse,
  };
}

/**
 * Prioridade na fila de Compras: pedidos com itens a definir e cirurgia próxima primeiro,
 * desempatando pelo ganho de margem ainda disponível e pelo risco de glosa.
 */
export function prioridade(p: Patient, escolhas: Record<string, Escolha>): number {
  const { riscoAtual, aDefinir, margemPotencial } = resumoCirurgia(p, escolhas);
  const dias = p.diasAteCirurgia ?? 30;
  const urgencia = 1 + Math.max(0, 14 - dias) / 7;
  return (aDefinir > 0 ? 40 : 0) * urgencia + Math.min(40, margemPotencial / 150) + riscoAtual * 0.3;
}

export const formatBRL = (valor: number, casas = 0) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: casas, maximumFractionDigits: casas });

export const formatPct = (valor: number, casas = 0) =>
  `${valor.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`;

export const textoDias = (dias?: number) => {
  if (dias === undefined) return "Data não informada";
  if (dias < 0) return `Há ${Math.abs(dias)} dias`;
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Amanhã";
  return `Em ${dias} dias`;
};
