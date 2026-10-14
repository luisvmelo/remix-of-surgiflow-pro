// ============ INSIGHTS (módulo estratégico) ============
// Oportunidades prontas para o Comercial negociar com operadoras e fornecedores.
// Não é um BI: cada insight já traz o número, a explicação e a ação sugerida.

import { Patient } from "@opme/types/patient";
import { Escolha, ItemPedido, OpcaoPedido } from "@opme/types/produto";
import { OPERADORAS } from "@opme/mock/catalogo";
import { SEVERIDADE_GLOSA, custoOpcao, formatBRL, formatPct, opcaoAtual, opcaoMelhor, opcaoPreferida, valorExposto } from "@opme/lib/produto";

export type TipoInsight = "operadora" | "fornecedor" | "medico" | "glosa";

export const LABEL_TIPO_INSIGHT: Record<TipoInsight, string> = {
  operadora: "Negociação com operadora",
  fornecedor: "Negociação com fornecedor",
  medico: "Médico × margem",
  glosa: "Glosa",
};

export interface Insight {
  id: string;
  tipo: TipoInsight;
  titulo: string;
  texto: string;
  metricas: Array<{ label: string; valor: string; destaque?: boolean }>;
  acao: string;
  /** Impacto estimado em 12 meses, no ritmo atual de cirurgias (R$) */
  impacto: number;
}

/** As agendadas cobrem as próximas 6 semanas: o fator projeta 12 meses no mesmo ritmo */
const JANELA_DIAS = 42;
const ANUAL = 365 / JANELA_DIAS;
export const DESCONTO_PACOTE = 0.04;
export const DESCONTO_VOLUME = 0.05;
/** Num pacote, glosas administrativas e de valor praticamente somem: fica ~20% da glosa prevista */
const GLOSA_RESIDUAL_PACOTE = 0.2;

const anual = (v: number) => v * ANUAL;
const numero = (v: number) => Math.round(v).toLocaleString("pt-BR");

interface ItemCtx {
  p: Patient;
  item: ItemPedido;
  atual?: OpcaoPedido;
}

function economia(p: Patient, escolhas: Record<string, Escolha>) {
  return (p.itensPedido ?? []).reduce(
    (acc, item) => {
      const o = opcaoAtual(item, escolhas);
      acc.receita += (o?.cobradoUnitario ?? 0) * item.quantidade;
      acc.glosa += valorExposto(o, item.quantidade) * SEVERIDADE_GLOSA;
      acc.custo += custoOpcao(o, item.quantidade);
      return acc;
    },
    { receita: 0, glosa: 0, custo: 0 }
  );
}

/** Pacote com operadora: volume alto de um procedimento cobrado em conta aberta, com glosa relevante */
function insightsPacote(futuras: Patient[], escolhas: Record<string, Escolha>): Insight[] {
  const grupos = new Map<string, Patient[]>();
  futuras.forEach((p) => {
    const k = `${p.convenio}|${p.procedimento}`;
    grupos.set(k, [...(grupos.get(k) ?? []), p]);
  });
  return Array.from(grupos.entries())
    .filter(([, ps]) => ps.length >= 3 && ps.filter((p) => p.tipoProcedimento === "Pacote").length < ps.length / 2)
    .map(([k, ps]) => {
      const [op, proc] = k.split("|");
      const tot = ps.map((p) => economia(p, escolhas)).reduce((a, b) => ({ receita: a.receita + b.receita, glosa: a.glosa + b.glosa, custo: a.custo + b.custo }));
      const n = ps.length;
      const margem = (tot.receita - tot.glosa - tot.custo) / n;
      const margemPacote = (tot.receita * (1 - DESCONTO_PACOTE) - tot.glosa * GLOSA_RESIDUAL_PACOTE - tot.custo) / n;
      const ganho = margemPacote - margem;
      const pct = margem > 0 ? (ganho / margem) * 100 : 0;
      return {
        id: `pac-${k}`,
        tipo: "operadora" as const,
        titulo: `Pacote de ${proc} com a ${op}`,
        texto: `${n} cirurgias agendadas (cerca de ${numero(anual(n))} em 12 meses no ritmo atual), quase todas em conta aberta. Hoje a margem OPME média é ${formatBRL(margem)} por cirurgia e a glosa prevista leva ${formatBRL(tot.glosa / n)}. Num pacote com ${formatPct(DESCONTO_PACOTE * 100)} de desconto sobre a tabela, a glosa prevista cai e a margem passa a ${formatBRL(margemPacote)}.`,
        metricas: [
          { label: "Margem por cirurgia", valor: `${formatBRL(margem)} → ${formatBRL(margemPacote)}` },
          { label: "Aumento de margem", valor: pct > 0 ? `+${formatPct(pct)}` : "—", destaque: true },
          { label: "Em 12 meses", valor: `+${formatBRL(anual(ganho * n))}` },
        ],
        acao: `Levar à ${op} uma proposta de pacote para ${proc}, usando o volume como argumento.`,
        impacto: anual(ganho * n),
      };
    })
    .filter((i) => i.impacto > 0);
}

/** Concentrar volume de um item no fornecedor de melhor custo, entre os que os médicos já indicam */
function insightsVolume(itens: ItemCtx[]): Insight[] {
  const porItem = new Map<string, ItemCtx[]>();
  itens.forEach((c) => porItem.set(c.item.nome, [...(porItem.get(c.item.nome) ?? []), c]));
  return Array.from(porItem.entries())
    .map(([nome, cs]) => {
      const qtd = cs.reduce((s, c) => s + c.item.quantidade, 0);
      const porFornecedor = new Map<string, number>();
      cs.forEach((c) => c.atual && porFornecedor.set(c.atual.fornecedor, (porFornecedor.get(c.atual.fornecedor) ?? 0) + c.item.quantidade));
      // Custo unitário + glosa esperada por unidade, para cada fornecedor indicado em algum pedido
      const custos = new Map<string, { soma: number; n: number; indicado: number }>();
      cs.forEach((c) =>
        c.item.opcoes.filter((o) => o.origem === "medico" && !o.equivalente).forEach((o) => {
          const atual = custos.get(o.fornecedor) ?? { soma: 0, n: 0, indicado: 0 };
          atual.soma += o.custoUnitario + o.cobradoUnitario * (o.riscoGlosa / 100) * SEVERIDADE_GLOSA;
          atual.n += 1;
          atual.indicado += 1;
          custos.set(o.fornecedor, atual);
        })
      );
      const ranking = Array.from(custos.entries()).map(([f, v]) => ({ f, custo: v.soma / v.n, indicado: v.indicado })).sort((a, b) => a.custo - b.custo);
      const melhor = ranking[0];
      if (!melhor || porFornecedor.size < 2 || qtd < 6) return null;
      const custoMedioAtual = cs.reduce((s, c) => s + (c.atual ? (c.atual.custoUnitario + c.atual.cobradoUnitario * (c.atual.riscoGlosa / 100) * SEVERIDADE_GLOSA) * c.item.quantidade : 0), 0);
      const custoNovo = melhor.custo * (1 - DESCONTO_VOLUME) * qtd;
      const econ = custoMedioAtual - custoNovo;
      if (econ <= 0) return null;
      const fatias = Array.from(porFornecedor.entries()).sort((a, b) => b[1] - a[1])
        .map(([f, q]) => `${f} ${Math.round((q / qtd) * 100)}%`).join(", ");
      return {
        id: `vol-${nome}`,
        tipo: "fornecedor" as const,
        titulo: `Concentrar ${nome} na ${melhor.f}`,
        texto: `Nas cirurgias agendadas entram ${numero(qtd)} unidades (cerca de ${numero(anual(qtd))} em 12 meses), divididas entre ${porFornecedor.size} fornecedores: ${fatias}. A ${melhor.f} tem o menor custo somado à glosa esperada e já é indicada pelos médicos em ${Math.round((melhor.indicado / cs.length) * 100)}% desses pedidos. Com ${formatPct(DESCONTO_VOLUME * 100)} de desconto por volume, a economia passa de ${formatBRL(anual(econ))} em 12 meses.`,
        metricas: [
          { label: "Unidades em 12 meses", valor: numero(anual(qtd)) },
          { label: "Indicada pelos médicos", valor: `${Math.round((melhor.indicado / cs.length) * 100)}% dos pedidos` },
          { label: "Economia em 12 meses", valor: formatBRL(anual(econ)), destaque: true },
        ],
        acao: `Negociar com a ${melhor.f} um acordo de volume para ${nome}.`,
        impacto: anual(econ),
      } satisfies Insight;
    })
    .filter(Boolean) as Insight[];
}

/** Renegociar a tabela de OPME com a operadora que paga abaixo da referência e glosa acima da média */
function insightsTabela(futuras: Patient[], escolhas: Record<string, Escolha>): Insight[] {
  return OPERADORAS.filter((o) => o.fatorPagamento < 0.98 && o.nome !== "SUS")
    .map((op) => {
      const ps = futuras.filter((p) => p.convenio === op.nome);
      if (ps.length < 5) return null;
      const receita = ps.reduce((s, p) => s + economia(p, escolhas).receita, 0);
      const gap = receita / op.fatorPagamento - receita;
      return {
        id: `tab-${op.nome}`,
        tipo: "operadora" as const,
        titulo: `Renegociar a tabela de OPME com a ${op.nome}`,
        texto: `A ${op.nome} paga ${formatPct((1 - op.fatorPagamento) * 100)} abaixo da tabela de referência e glosa ${formatPct((op.fatorGlosa - 1) * 100)} acima da média. São ${ps.length} cirurgias agendadas, com ${formatBRL(receita)} de receita de OPME prevista.`,
        metricas: [
          { label: "Abaixo da referência", valor: formatPct((1 - op.fatorPagamento) * 100) },
          { label: "Glosa vs. média", valor: `${op.fatorGlosa >= 1 ? "+" : ""}${formatPct((op.fatorGlosa - 1) * 100)}` },
          { label: "Diferença em 12 meses", valor: formatBRL(anual(gap)), destaque: true },
        ],
        acao: `Rever com a ${op.nome} a tabela de OPME e as regras de glosa dos itens mais recorrentes.`,
        impacto: anual(gap),
      } satisfies Insight;
    })
    .filter(Boolean) as Insight[];
}

/** Médicos cujos próprios fornecedores indicados permitem mais margem do que o preferido deles */
function insightsMedico(futuras: Patient[]): Insight[] {
  const porMedico = new Map<string, { ps: number; ganho: number; itens: Map<string, { ganho: number; de: string; para: string }> }>();
  futuras.forEach((p) => {
    const m = porMedico.get(p.medico) ?? { ps: 0, ganho: 0, itens: new Map() };
    m.ps += 1;
    (p.itensPedido ?? []).forEach((item) => {
      const pref = opcaoPreferida(item);
      const melhor = opcaoMelhor(item, p.diasAteCirurgia);
      if (!pref || !melhor || pref.id === melhor.id) return;
      const g = melhor.margem - pref.margem;
      m.ganho += g;
      const it = m.itens.get(item.nome) ?? { ganho: 0, de: pref.fornecedor, para: melhor.fornecedor };
      it.ganho += g;
      m.itens.set(item.nome, it);
    });
    porMedico.set(p.medico, m);
  });
  return Array.from(porMedico.entries())
    .filter(([, m]) => m.ps >= 2 && m.ganho > 0)
    .map(([medico, m]) => {
      const [itemTop, top] = Array.from(m.itens.entries()).sort((a, b) => b[1].ganho - a[1].ganho)[0];
      return {
        id: `med-${medico}`,
        tipo: "medico" as const,
        titulo: `Dr(a). ${medico}: +${formatBRL(m.ganho / m.ps)} por cirurgia sem sair das indicações dele`,
        texto: `Nas ${m.ps} cirurgias agendadas, o fornecedor de maior margem entre os 3 que o próprio médico indica rende ${formatBRL(m.ganho)} a mais do que o fornecedor que ele mais usa. O maior ganho está em ${itemTop}: ${top.de} → ${top.para}.`,
        metricas: [
          { label: "Cirurgias agendadas", valor: String(m.ps) },
          { label: "Ganho por cirurgia", valor: `+${formatBRL(m.ganho / m.ps)}` },
          { label: "Em 12 meses", valor: `+${formatBRL(anual(m.ganho))}`, destaque: true },
        ],
        acao: `Apresentar ao médico a troca ${top.de} → ${top.para} em ${itemTop}, que ele mesmo já indica.`,
        impacto: anual(m.ganho),
      } satisfies Insight;
    });
}

/** Onde a glosa se concentra: OP × ME e os itens que mais perdem */
function insightsGlosa(itens: ItemCtx[]): Insight[] {
  const classes = { OP: { custo: 0, glosa: 0 }, ME: { custo: 0, glosa: 0 } };
  const porItem = new Map<string, number>();
  itens.forEach(({ item, atual }) => {
    const g = valorExposto(atual, item.quantidade) * SEVERIDADE_GLOSA;
    classes[item.classe].custo += custoOpcao(atual, item.quantidade);
    classes[item.classe].glosa += g;
    if (item.classe === "ME") porItem.set(item.nome, (porItem.get(item.nome) ?? 0) + g);
  });
  const custoTotal = classes.OP.custo + classes.ME.custo || 1;
  const glosaTotal = classes.OP.glosa + classes.ME.glosa || 1;
  const fatiaCusto = (classes.ME.custo / custoTotal) * 100;
  const fatiaGlosa = (classes.ME.glosa / glosaTotal) * 100;
  if (fatiaGlosa <= fatiaCusto) return [];
  const top = Array.from(porItem.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return [{
    id: "glosa-me",
    tipo: "glosa",
    titulo: `Materiais especiais respondem por ${formatPct(fatiaGlosa)} da glosa prevista`,
    texto: `Os materiais especiais são ${formatPct(fatiaCusto)} do custo de OPME das cirurgias agendadas, mas concentram ${formatPct(fatiaGlosa)} da glosa prevista. Os que mais pesam: ${top.map(([n, v]) => `${n} (${formatBRL(v)})`).join(", ")}.`,
    metricas: [
      { label: "ME no custo", valor: formatPct(fatiaCusto) },
      { label: "ME na glosa", valor: formatPct(fatiaGlosa), destaque: true },
      { label: "Glosa de ME em 12 meses", valor: formatBRL(anual(classes.ME.glosa)) },
    ],
    acao: "Negociar com as operadoras regras de cobertura dos descartáveis mais glosados, ou incluí-los nos pacotes.",
    impacto: anual(classes.ME.glosa) * 0.5,
  }];
}

/** Ticket médio de OPME de um mesmo procedimento muito diferente entre médicos */
function insightsTicket(futuras: Patient[], escolhas: Record<string, Escolha>): Insight[] {
  const porProc = new Map<string, Map<string, { custo: number; n: number }>>();
  futuras.forEach((p) => {
    const custo = economia(p, escolhas).custo;
    const meds = porProc.get(p.procedimento) ?? new Map();
    const m = meds.get(p.medico) ?? { custo: 0, n: 0 };
    m.custo += custo;
    m.n += 1;
    meds.set(p.medico, m);
    porProc.set(p.procedimento, meds);
  });
  return Array.from(porProc.entries())
    .map(([proc, meds]) => {
      const lista = Array.from(meds.entries()).filter(([, v]) => v.n >= 2).map(([m, v]) => ({ m, ticket: v.custo / v.n, n: v.n }));
      if (lista.length < 2) return null;
      lista.sort((a, b) => b.ticket - a.ticket);
      const alto = lista[0];
      const baixo = lista[lista.length - 1];
      const spread = ((alto.ticket - baixo.ticket) / baixo.ticket) * 100;
      if (spread < 12) return null;
      const ganho = (alto.ticket - baixo.ticket) * alto.n;
      return {
        id: `tkt-${proc}`,
        tipo: "medico" as const,
        titulo: `Ticket de OPME em ${proc} varia ${formatPct(spread)} entre médicos`,
        texto: `Com o mesmo procedimento, Dr(a). ${alto.m} tem ticket médio de ${formatBRL(alto.ticket)} e Dr(a). ${baixo.m}, de ${formatBRL(baixo.ticket)}. A diferença vem dos itens e fornecedores escolhidos.`,
        metricas: [
          { label: "Maior ticket", valor: formatBRL(alto.ticket) },
          { label: "Menor ticket", valor: formatBRL(baixo.ticket) },
          { label: "Diferença em 12 meses", valor: formatBRL(anual(ganho)), destaque: true },
        ],
        acao: `Comparar os pedidos dos dois médicos em ${proc} e propor um padrão de itens.`,
        impacto: anual(ganho) * 0.5,
      } satisfies Insight;
    })
    .filter(Boolean) as Insight[];
}

export function gerarInsights(patients: Patient[], escolhas: Record<string, Escolha>): Insight[] {
  const futuras = patients.filter((p) => (p.diasAteCirurgia ?? 0) >= 0);
  const itens: ItemCtx[] = futuras.flatMap((p) => (p.itensPedido ?? []).map((item) => ({ p, item, atual: opcaoAtual(item, escolhas) })));
  const top = (lista: Insight[], n: number) => lista.sort((a, b) => b.impacto - a.impacto).slice(0, n);
  return [
    ...top(insightsPacote(futuras, escolhas), 4),
    ...top(insightsTabela(futuras, escolhas), 2),
    ...top(insightsVolume(itens), 4),
    ...top(insightsMedico(futuras), 3),
    ...top(insightsTicket(futuras, escolhas), 2),
    ...insightsGlosa(itens),
  ].sort((a, b) => b.impacto - a.impacto);
}
