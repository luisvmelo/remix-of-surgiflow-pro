// ============================================================
// CONSULTOR — carteira de hospitais, benchmark e comercial
// O Real Hospital Português usa as análises reais do domínio;
// a Santa Casa e o Santa Joana são um retrato fixo de exemplo.
// ============================================================

import type { Dominio, SugestaoAlteracao } from "@/dominio/tipos";
import { ganhoDesdeImplantacao, indicadores, recorte, serieMensal, type Registro } from "@/gestao/analise";

export type Fase = "Implantação" | "Acompanhamento" | "Maturidade";

export interface HospitalCarteira {
  id: string;
  nome: string;
  cidade: string;
  erp: string;
  implantacao: string;
  fase: Fase;
  ganhoGerado: number;
  cirurgiasMes: number;
  dentroPadraoPct: number;
  glosaPct: number;
  liberacaoDias: number;
  padroesVigentes: number;
  procedimentos: number;
  alertas: string[];
}

interface Retrato {
  ganhoGerado: number;
  cirurgiasMes: number;
  dentroPadraoPct: number;
  glosaPct: number;
  liberacaoDias: number;
  padroesVigentes: number;
  alertas: string[];
  /** Preferencial de cada item, por procedimento, e os números do procedimento */
  benchmark: Record<string, { preferenciais: Record<string, string>; dentroPadraoPct: number; glosaPct: number; liberacaoDias: number; margemMedia: number }>;
  valoresMes: { mes: string; cirurgias: number }[];
}

const RETRATOS: Record<string, Retrato> = {
  sjr: {
    ganhoGerado: 212_400,
    cirurgiasMes: 118,
    dentroPadraoPct: 86,
    glosaPct: 3.9,
    liberacaoDias: 4.1,
    padroesVigentes: 7,
    alertas: ["Glosa subiu na Bradesco Saúde em set (5,8%)", "2 sugestões de alteração paradas há mais de 30 dias"],
    benchmark: {
      "artroscopia-joelho": { preferenciais: { canula: "cn-a", "lamina-shaver": "ls-c", "ponteira-rf": "rf-a", "fio-ar": "fa-c" }, dentroPadraoPct: 94, glosaPct: 2.1, liberacaoDias: 3.2, margemMedia: 1_180 },
      angioplastia: { preferenciais: { stent: "st-a", "cateter-guia": "cg-b", "fio-guia": "fg-a", balao: "ba-a", introdutor: "in-a" }, dentroPadraoPct: 90, glosaPct: 1.6, liberacaoDias: 2.4, margemMedia: -2_100 },
      "artrodese-lombar": { preferenciais: { "parafuso-pedicular": "pp-b", haste: "ha-b", cage: "ca-a" }, dentroPadraoPct: 81, glosaPct: 4.4, liberacaoDias: 5.1, margemMedia: 4_350 },
    },
    valoresMes: [
      { mes: "Jul", cirurgias: 64 }, { mes: "Ago", cirurgias: 88 }, { mes: "Set", cirurgias: 101 },
    ],
  },
  scmr: {
    ganhoGerado: 18_900,
    cirurgiasMes: 74,
    dentroPadraoPct: 52,
    glosaPct: 8.7,
    liberacaoDias: 11.2,
    padroesVigentes: 2,
    alertas: ["Só 2 padrões aprovados: comissão ainda em formação", "Leitura do Tasy incompleta (sem tabela de glosas)", "Hapvida com glosa de 14%"],
    benchmark: {
      "artroscopia-joelho": { preferenciais: { canula: "cn-c", "lamina-shaver": "ls-b", "ponteira-rf": "rf-c", "fio-ar": "fa-a" }, dentroPadraoPct: 48, glosaPct: 11.2, liberacaoDias: 8.4, margemMedia: 210 },
      angioplastia: { preferenciais: { stent: "st-e", "cateter-guia": "cg-c", "fio-guia": "fg-c", balao: "ba-c", introdutor: "in-c" }, dentroPadraoPct: 55, glosaPct: 7.9, liberacaoDias: 6.8, margemMedia: -3_900 },
      "artrodese-lombar": { preferenciais: { "parafuso-pedicular": "pp-d", haste: "ha-a", cage: "ca-d" }, dentroPadraoPct: 46, glosaPct: 12.5, liberacaoDias: 13.0, margemMedia: 1_200 },
    },
    valoresMes: [{ mes: "Set", cirurgias: 31 }],
  },
};

export const TARIFA_POR_CIRURGIA = 150;
export const MENSALIDADE_IMPLANTACAO = 18_000;
export const PROCEDIMENTOS_BENCHMARK = ["artroscopia-joelho", "angioplastia", "artrodese-lombar"];

function fase(implantacao: string, hoje: Date): Fase {
  const meses = (hoje.getTime() - new Date(`${implantacao}T12:00:00`).getTime()) / (30.4 * 24 * 3600 * 1000);
  if (meses < 2) return "Implantação";
  if (meses < 6) return "Acompanhamento";
  return "Maturidade";
}

export function carteira(d: Dominio, regs: Registro[], hoje = new Date("2026-10-14T12:00:00")): HospitalCarteira[] {
  return d.hospitais.map((h) => {
    const base = { id: h.id, nome: h.nome, cidade: h.cidade, erp: h.erp, implantacao: h.implantacao, fase: fase(h.implantacao, hoje), procedimentos: d.procedimentos.length };
    const r = RETRATOS[h.id];
    if (r) {
      return { ...base, ganhoGerado: r.ganhoGerado, cirurgiasMes: r.cirurgiasMes, dentroPadraoPct: r.dentroPadraoPct, glosaPct: r.glosaPct, liberacaoDias: r.liberacaoDias, padroesVigentes: r.padroesVigentes, alertas: r.alertas };
    }
    const serie = serieMensal(regs).filter((m) => m.cirurgias >= 10);
    const ultimo = serie.at(-1);
    const semPadrao = d.procedimentos.filter((p) => d.padroes[p.id]?.status !== "vigente");
    const sugestoes = Object.values(d.padroes).reduce((a, p) => a + p.sugestoes.length, 0);
    const negativos = recorte(regs, d, "cirurgia").filter((l) => l.margemMedia < 0);
    const alertas = [
      semPadrao.length ? `${semPadrao.length} procedimentos sem padrão vigente` : "",
      sugestoes ? `${sugestoes} sugestões de alteração esperando a comissão` : "",
      ...negativos.map((l) => `${l.nome} com margem média negativa`),
    ].filter(Boolean);
    return {
      ...base,
      ganhoGerado: ganhoDesdeImplantacao(serie),
      cirurgiasMes: ultimo?.cirurgias ?? 0,
      dentroPadraoPct: ultimo?.dentroPadraoPct ?? 0,
      glosaPct: ultimo?.glosaMediaPct ?? 0,
      liberacaoDias: ultimo?.liberacaoMediaDias ?? 0,
      padroesVigentes: d.procedimentos.length - semPadrao.length,
      alertas,
    };
  });
}

export interface LinhaBenchmark {
  hospitalId: string;
  nome: string;
  preferenciais: Record<string, string>;
  dentroPadraoPct: number;
  glosaPct: number;
  liberacaoDias: number;
  margemMedia: number;
}

export function benchmark(d: Dominio, regs: Registro[], procedimentoId: string): LinhaBenchmark[] {
  const padrao = d.padroes[procedimentoId];
  const doProc = regs.filter((r) => r.pedido.procedimentoId === procedimentoId);
  const i = indicadores(doProc);
  const rhp: LinhaBenchmark = {
    hospitalId: d.hospitais[0].id,
    nome: d.hospitais[0].nome,
    preferenciais: Object.fromEntries(padrao.itens.map((ip) => [ip.itemId, ip.preferenciais[0]])),
    dentroPadraoPct: i.dentroPadraoPct,
    glosaPct: i.glosaMediaPct,
    liberacaoDias: i.liberacaoMediaDias,
    margemMedia: doProc.length ? i.margemTotal / doProc.length : 0,
  };
  const outros = d.hospitais.slice(1).flatMap((h) => {
    const b = RETRATOS[h.id]?.benchmark[procedimentoId];
    return b ? [{ hospitalId: h.id, nome: h.nome, ...b }] : [];
  });
  return [rhp, ...outros];
}

/** Sugestão de alteração que o consultor leva de um hospital da carteira para a comissão do RHP. */
export function sugestaoBenchmark(d: Dominio, origemId: string, procedimentoId: string, itemId: string, marcaId: string): SugestaoAlteracao {
  const padrao = d.padroes[procedimentoId];
  const de = padrao.itens.find((i) => i.itemId === itemId)?.preferenciais[0];
  const marca = (id?: string) => d.marcas.find((m) => m.id === id);
  const origem = d.hospitais.find((h) => h.id === origemId)!;
  const item = d.itens.find((i) => i.id === itemId)!;
  const b = RETRATOS[origemId]?.benchmark[procedimentoId];
  return {
    id: `s-bench-${origemId}-${procedimentoId}-${itemId}-${marcaId}`,
    titulo: `Benchmark ${origem.nome}: ${marca(marcaId)?.fabricante} como preferencial em ${item.nome.toLowerCase()}`,
    motivo: `No ${origem.nome} este procedimento tem ${b?.dentroPadraoPct ?? "—"}% no padrão, glosa de ${b?.glosaPct ?? "—"}% e libera em ${b?.liberacaoDias ?? "—"} dias. Marca: libera em ${marca(marcaId)?.liberacaoDias} dias, glosa ${marca(marcaId)?.glosaPct}%.`,
    tipo: "trocar_marca",
    itemId,
    de,
    para: marcaId,
    antes: marca(de)?.fabricante ?? "—",
    depois: marca(marcaId)?.fabricante ?? marcaId,
  };
}

export interface LinhaComercial {
  hospitalId: string;
  nome: string;
  modelo: string;
  procedimentosCobrados: number;
  meses: { mes: string; cirurgias: number; valor: number }[];
  total: number;
}

export function comercial(d: Dominio, regs: Registro[], hoje = new Date("2026-10-14T12:00:00")): LinhaComercial[] {
  return d.hospitais.map((h) => {
    const emImplantacao = fase(h.implantacao, hoje) === "Implantação";
    let meses: { mes: string; cirurgias: number; valor: number }[];
    if (RETRATOS[h.id]) {
      meses = RETRATOS[h.id].valoresMes.map((m) => ({ ...m, valor: emImplantacao ? MENSALIDADE_IMPLANTACAO : m.cirurgias * TARIFA_POR_CIRURGIA }));
    } else {
      // Cobra só as cirurgias que seguiram o padrão
      meses = serieMensal(regs).filter((m) => m.cirurgias >= 10).map((m) => {
        const cirurgias = Math.round((m.cirurgias * m.dentroPadraoPct) / 100);
        return { mes: m.rotulo, cirurgias, valor: cirurgias * TARIFA_POR_CIRURGIA };
      });
    }
    const vigentes = h.id === d.hospitais[0].id
      ? d.procedimentos.filter((p) => d.padroes[p.id]?.status === "vigente").length
      : RETRATOS[h.id]?.padroesVigentes ?? 0;
    return {
      hospitalId: h.id,
      nome: h.nome,
      modelo: emImplantacao
        ? `Implantação: mensalidade fixa de R$ ${MENSALIDADE_IMPLANTACAO.toLocaleString("pt-BR")} até o 3º mês`
        : `Taxímetro: R$ ${TARIFA_POR_CIRURGIA} por cirurgia que seguiu o padrão`,
      procedimentosCobrados: vigentes,
      meses,
      total: meses.reduce((a, m) => a + m.valor, 0),
    };
  });
}
