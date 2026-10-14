// ============================================================
// GESTÃO — análises (funções puras sobre o motor do domínio)
// ============================================================

import { avaliarPedido, contratoDaOperadora, pedidoSugerido } from "@/dominio/motor";
import type { Avaliacao, ConfigHospital, Dominio, ItemPadrao, LinhaCuidado, NivelPlano, Padrao, Pedido } from "@/dominio/tipos";

export interface Registro {
  pedido: Pedido;
  a: Avaliacao;
  tempoCirurgiaMin?: number;
}

/** Como o hospital estava antes da implantação (diagnóstico de abril/2026). */
export const ANTES = { dentroPadraoPct: 41, glosaMediaPct: 9.8, liberacaoMediaDias: 14 };

export const LABEL_LINHA: Record<LinhaCuidado, string> = {
  cardio: "Cardiologia",
  trauma: "Trauma",
  ortopedia: "Ortopedia",
  neuro: "Neuro e coluna",
  hemodinamica: "Hemodinâmica",
  obstetricia: "Obstetrícia e ginecologia",
};

const MES_CURTO = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const media = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);
const pct = (parte: number, total: number) => (total ? (parte / total) * 100 : 0);
export const dentroDoPadrao = (a: Avaliacao) => a.foraPadrao.length === 0 && a.foraProtocolo.length === 0 && a.naoHomologados.length === 0;

export function avaliar(pedidos: (Pedido & { tempoCirurgiaMin?: number })[], d: Dominio): Registro[] {
  return pedidos.map((pedido) => ({ pedido, a: avaliarPedido(pedido, d), tempoCirurgiaMin: pedido.tempoCirurgiaMin }));
}

export function indicadores(regs: Registro[], d?: Dominio) {
  const prazosFornecedor: number[] = [];
  if (d) for (const r of regs) for (const i of r.pedido.itens) {
    const m = d.marcas.find((x) => x.id === i.marcaId);
    if (m) prazosFornecedor.push(m.prazoPagamentoDias);
  }
  const prazosOperadora = d ? regs.map((r) => d.operadoras.find((o) => o.id === r.pedido.operadoraId)?.prazoPagamentoDias ?? 0) : [];
  return {
    n: regs.length,
    dentroPadraoPct: pct(regs.filter((r) => dentroDoPadrao(r.a)).length, regs.length),
    glosaMediaPct: media(regs.map((r) => r.a.riscoGlosa)),
    liberacaoMediaDias: media(regs.map((r) => r.a.liberacaoDias)),
    margemTotal: regs.reduce((acc, r) => acc + r.a.hospital.margem, 0),
    complementoTotal: regs.reduce((acc, r) => acc + r.a.complemento.garantido, 0),
    prazoFornecedoresDias: media(prazosFornecedor),
    prazoOperadorasDias: media(prazosOperadora),
  };
}

export function serieMensal(regs: Registro[]) {
  const porMes = new Map<string, Registro[]>();
  for (const r of regs) {
    const mes = r.pedido.dataCirurgia.slice(0, 7);
    porMes.set(mes, [...(porMes.get(mes) ?? []), r]);
  }
  return [...porMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, lista]) => {
      const i = indicadores(lista);
      return {
        mes,
        rotulo: MES_CURTO[Number(mes.slice(5, 7)) - 1],
        cirurgias: lista.length,
        margem: i.margemTotal,
        margemMedia: i.margemTotal / lista.length,
        complemento: i.complementoTotal,
        glosaMediaPct: i.glosaMediaPct,
        dentroPadraoPct: i.dentroPadraoPct,
        liberacaoMediaDias: i.liberacaoMediaDias,
      };
    });
}

/** Margem média por cirurgia nos dois primeiros meses (abr–mai), a referência de "antes". */
export function margemBase(serie: ReturnType<typeof serieMensal>) {
  const base = serie.slice(0, 2);
  const n = base.reduce((acc, m) => acc + m.cirurgias, 0);
  return n ? base.reduce((acc, m) => acc + m.margem, 0) / n : 0;
}

/** Ganho desde a implantação: o quanto a margem por cirurgia subiu em relação a abr–mai, somado nos meses seguintes. */
export function ganhoDesdeImplantacao(serie: ReturnType<typeof serieMensal>) {
  if (serie.length < 3) return 0;
  const base = margemBase(serie);
  return Math.round(serie.slice(2).reduce((acc, m) => acc + (m.margemMedia - base) * m.cirurgias, 0));
}

export type Dimensao = "cirurgia" | "operadora" | "fornecedor";

export interface LinhaRecorte {
  id: string;
  nome: string;
  pedidos: number;
  margemMedia: number;
  glosaMedia: number;
  liberacaoMedia: number;
  dentroPadraoPct: number;
  positivos: string[];
  negativos: string[];
}

export function recorte(regs: Registro[], d: Dominio, dim: Dimensao): LinhaRecorte[] {
  const grupos = new Map<string, Registro[]>();
  const add = (chave: string, r: Registro) => grupos.set(chave, [...(grupos.get(chave) ?? []), r]);
  for (const r of regs) {
    if (dim === "cirurgia") add(r.pedido.procedimentoId, r);
    else if (dim === "operadora") add(r.pedido.operadoraId, r);
    else {
      const fornecedores = new Set(r.pedido.itens.map((i) => d.marcas.find((m) => m.id === i.marcaId)?.fornecedor).filter(Boolean) as string[]);
      fornecedores.forEach((f) => add(f, r));
    }
  }
  const geral = indicadores(regs);
  const margemGeral = geral.margemTotal / Math.max(1, regs.length);
  const nome = (id: string) =>
    dim === "cirurgia" ? d.procedimentos.find((p) => p.id === id)?.nome ?? id
      : dim === "operadora" ? d.operadoras.find((o) => o.id === id)?.nome ?? id
      : id;

  return [...grupos.entries()]
    .map(([id, lista]) => {
      const i = indicadores(lista);
      const margemMedia = i.margemTotal / lista.length;
      const positivos: string[] = [];
      const negativos: string[] = [];
      if (margemMedia > margemGeral * 1.15) positivos.push("Margem média acima da média do hospital");
      if (margemMedia < margemGeral * 0.85) negativos.push("Margem média abaixo da média do hospital");
      if (i.glosaMediaPct < geral.glosaMediaPct - 2) positivos.push("Glosa abaixo da média");
      if (i.glosaMediaPct > geral.glosaMediaPct + 2) negativos.push("Glosa acima da média");
      if (i.liberacaoMediaDias < geral.liberacaoMediaDias - 1) positivos.push("Libera mais rápido que a média");
      if (i.liberacaoMediaDias > geral.liberacaoMediaDias + 1) negativos.push("Libera mais devagar que a média");
      if (i.dentroPadraoPct >= 85) positivos.push("Alta adesão ao padrão");
      if (i.dentroPadraoPct < 60) negativos.push("Baixa adesão ao padrão");
      return {
        id, nome: nome(id), pedidos: lista.length, margemMedia, glosaMedia: i.glosaMediaPct,
        liberacaoMedia: i.liberacaoMediaDias, dentroPadraoPct: i.dentroPadraoPct, positivos, negativos,
      };
    })
    .sort((a, b) => b.pedidos - a.pedidos);
}

export function foraDoPadrao(regs: Registro[], d: Dominio) {
  const acc = new Map<string, { vezes: number; medicos: Set<string>; custoAMais: number }>();
  for (const r of regs) {
    const padrao = d.padroes[r.pedido.procedimentoId];
    const marcadas = new Set<string>([...r.a.foraPadrao, ...r.a.naoHomologados]);
    for (const i of r.pedido.itens) if (r.a.foraProtocolo.includes(i.itemId)) marcadas.add(i.marcaId);
    for (const marcaId of marcadas) {
      const marca = d.marcas.find((m) => m.id === marcaId);
      const it = r.pedido.itens.find((i) => i.marcaId === marcaId);
      if (!marca || !it) continue;
      const pref = padrao?.itens.find((x) => x.itemId === marca.itemId)?.preferenciais[0];
      const custoPref = d.marcas.find((m) => m.id === pref)?.custo ?? 0;
      const atual = acc.get(marcaId) ?? { vezes: 0, medicos: new Set<string>(), custoAMais: 0 };
      atual.vezes += 1;
      atual.medicos.add(d.medicos.find((m) => m.id === r.pedido.medicoId)?.nome ?? r.pedido.medicoId);
      atual.custoAMais += (marca.custo - custoPref) * it.qtd;
      acc.set(marcaId, atual);
    }
  }
  return [...acc.entries()]
    .map(([marcaId, v]) => {
      const marca = d.marcas.find((m) => m.id === marcaId)!;
      return {
        marcaId,
        fabricante: marca.fabricante,
        fornecedor: marca.fornecedor,
        item: d.itens.find((i) => i.id === marca.itemId)?.nome ?? marca.itemId,
        vezes: v.vezes,
        medicos: [...v.medicos],
        glosaPct: marca.glosaPct,
        liberacaoDias: marca.liberacaoDias,
        custoAMais: Math.round(v.custoAMais),
      };
    })
    .sort((a, b) => b.vezes - a.vezes);
}

export function balanceamento(regs: Registro[], d: Dominio) {
  return recorte(regs, d, "cirurgia").map((l) => ({
    procedimentoId: l.id,
    nome: l.nome,
    liberacaoMedia: Math.round(l.liberacaoMedia * 10) / 10,
    margemMedia: Math.round(l.margemMedia),
    glosaMedia: Math.round(l.glosaMedia * 10) / 10,
    volume: l.pedidos,
  }));
}

export function porMedico(regs: Registro[], d: Dominio) {
  return d.medicos
    .map((m) => {
      const lista = regs.filter((r) => r.pedido.medicoId === m.id);
      const i = indicadores(lista);
      const tempos = lista.map((r) => r.tempoCirurgiaMin).filter((t): t is number => typeof t === "number");
      return {
        medicoId: m.id,
        nome: m.nome,
        especialidade: m.especialidade,
        volume: lista.length,
        dentroPadraoPct: i.dentroPadraoPct,
        glosaMediaPct: i.glosaMediaPct,
        liberacaoMediaDias: i.liberacaoMediaDias,
        complementoRecebido: i.complementoTotal,
        tempoMedioMin: media(tempos),
      };
    })
    .filter((x) => x.volume > 0)
    .sort((a, b) => b.volume - a.volume);
}

export function porLinha(regs: Registro[], d: Dominio) {
  const linhas = [...new Set(d.procedimentos.map((p) => p.linha))];
  return linhas.map((linha) => {
    const procs = d.procedimentos.filter((p) => p.linha === linha).map((p) => p.id);
    const lista = regs.filter((r) => procs.includes(r.pedido.procedimentoId));
    const i = indicadores(lista);
    return { linha, nome: LABEL_LINHA[linha], cirurgias: lista.length, ...i, margemMedia: lista.length ? i.margemTotal / lista.length : 0 };
  });
}

export function temposPorProcedimento(regs: Registro[], d: Dominio) {
  return d.procedimentos
    .map((p) => {
      const lista = regs.filter((r) => r.pedido.procedimentoId === p.id && typeof r.tempoCirurgiaMin === "number");
      const antes = lista.filter((r) => r.pedido.dataCirurgia < "2026-06-01");
      const depois = lista.filter((r) => r.pedido.dataCirurgia >= "2026-07-01");
      return {
        procedimentoId: p.id,
        nome: p.nome,
        n: lista.length,
        antes: media(antes.map((r) => r.tempoCirurgiaMin!)),
        depois: media(depois.map((r) => r.tempoCirurgiaMin!)),
      };
    })
    .filter((x) => x.n > 0);
}

export function previsibilidade(d: Dominio, operadoraId: string, plano: NivelPlano) {
  return d.procedimentos.map((proc) => {
    const contrato = contratoDaOperadora(d, operadoraId, proc.id);
    const padrao = d.padroes[proc.id];
    if (!contrato || !padrao) {
      return { procedimentoId: proc.id, nome: proc.nome, linha: proc.linha, semContrato: true, honorario: 0, complemento: 0, recebimentoDias: 0, liberacaoDias: 0 };
    }
    const s = pedidoSugerido(proc.id, operadoraId, d);
    const a = avaliarPedido({
      id: "prev", medicoId: "__novo__", paciente: { nome: "", cpf: "" }, operadoraId, plano, procedimentoId: proc.id,
      codigos: s.codigos, itens: s.itens, documentos: [...padrao.protocolo.documentos], status: "rascunho", ajustes: [],
      urgencia: false, criadoEm: "", dataCirurgia: "",
    }, d);
    const complemento = padrao.complemento.modo === "predefinido" ? padrao.complemento.valor : padrao.complemento.condicoes.reduce((acc, c) => acc + c.valor, 0);
    return {
      procedimentoId: proc.id, nome: proc.nome, linha: proc.linha, semContrato: false,
      honorario: contrato.honorario[plano] ?? 0, complemento, recebimentoDias: 60, liberacaoDias: a.liberacaoDias,
    };
  });
}

export type ModoEquilibrio = "rapido" | "rentavel" | "equilibrio";

/** Atalhos de balanceamento da comissão: escolhe o leque (até 3 aceitas) e a preferencial de cada item. */
export function equilibrio(padrao: Padrao, operadoraId: string, d: Dominio, config: ConfigHospital, modo: ModoEquilibrio): ItemPadrao[] {
  const contrato = contratoDaOperadora(d, operadoraId, padrao.procedimentoId);
  return padrao.itens.map((ip) => {
    const candidatas = d.marcas.filter((m) => m.itemId === ip.itemId && m.homologadaEm.includes(operadoraId));
    if (!candidatas.length) return ip;
    const margemUn = (custo: number) => (contrato?.tipo === "aberta" ? (contrato.tabelaItem[ip.itemId] ?? 0) - custo : -custo);
    const faixa = (vals: number[]) => ({ min: Math.min(...vals), max: Math.max(...vals) });
    const lib = faixa(candidatas.map((m) => m.liberacaoDias));
    const glo = faixa(candidatas.map((m) => m.glosaPct));
    const mar = faixa(candidatas.map((m) => margemUn(m.custo)));
    const norm = (v: number, f: { min: number; max: number }, maiorMelhor: boolean) =>
      f.max === f.min ? 1 : maiorMelhor ? (v - f.min) / (f.max - f.min) : (f.max - v) / (f.max - f.min);
    const w = {
      liberacao: config.pesos.liberacao,
      glosa: config.pesos.glosa,
      margem: config.considerarMargem ? config.pesos.margem : 0,
    };
    const soma = w.liberacao + w.glosa + w.margem || 1;
    const nota = (m: (typeof candidatas)[number]) => {
      if (modo === "rapido") return -m.liberacaoDias * 100 - m.glosaPct;
      if (modo === "rentavel") return margemUn(m.custo);
      return (w.liberacao * norm(m.liberacaoDias, lib, false) + w.glosa * norm(m.glosaPct, glo, false) + w.margem * norm(margemUn(m.custo), mar, true)) / soma;
    };
    const ordem = [...candidatas].sort((a, b) => nota(b) - nota(a) || a.id.localeCompare(b.id));
    // O padrão é um só: as marcas que esta operadora não homologa continuam aceitas para as outras
    const deOutras = ip.aceitas.filter((id) => !candidatas.some((m) => m.id === id));
    const aceitas = [...ordem.slice(0, 3).map((m) => m.id), ...deOutras];
    return { ...ip, aceitas, preferenciais: [ordem[0].id] };
  });
}

export function recomendacoes(regs: Registro[], d: Dominio) {
  const recs: { id: string; titulo: string; vimos: string; fazer: string; hospitalMes: number; medicosMes: number; beneficiario: "hospital" | "medico" | "ambos" }[] = [];
  const meses = new Set(regs.map((r) => r.pedido.dataCirurgia.slice(0, 7))).size || 1;
  const brl = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

  const fora = foraDoPadrao(regs, d)[0];
  if (fora) {
    recs.push({
      id: "fora", titulo: `${fora.fabricante} (${fora.item.toLowerCase()}) segue sendo pedido fora do padrão`,
      vimos: `Pedido ${fora.vezes} vezes no período, por ${fora.medicos.length} médico(s); glosa de ${fora.glosaPct}% e ${fora.liberacaoDias} dias para liberar.`,
      fazer: "Levar à comissão: incluir no leque se houver motivo clínico, ou conversar com os médicos para usar a preferencial.",
      hospitalMes: Math.max(0, Math.round(fora.custoAMais / meses)), medicosMes: 0, beneficiario: "hospital",
    });
  }

  const comAlerta = regs.filter((r) => d.padroes[r.pedido.procedimentoId]?.codigosAlerta.some((c) => r.pedido.codigos.includes(c.codigo)));
  if (comAlerta.length) {
    const perdido = comAlerta.reduce((acc, r) => acc + r.a.complemento.perdido + r.a.honorario.valor * (r.a.riscoGlosa / 100), 0);
    recs.push({
      id: "codigo", titulo: "Pedidos com a codificação que costuma glosar",
      vimos: `${comAlerta.length} pedidos usaram a forma alternativa de codificar, que tem glosa de mais de 20% no código.`,
      fazer: "Ensinar a codificação recomendada (já sugerida no wizard) aos médicos e secretárias desses pedidos.",
      hospitalMes: 0, medicosMes: Math.round(perdido / meses), beneficiario: "medico",
    });
  }

  const ops = recorte(regs, d, "operadora").sort((a, b) => b.glosaMedia - a.glosaMedia);
  if (ops[0]) {
    recs.push({
      id: "glosa-op", titulo: `Glosa concentrada na ${ops[0].nome}`,
      vimos: `Glosa média de ${ops[0].glosaMedia.toFixed(1)}% contra ${indicadores(regs).glosaMediaPct.toFixed(1)}% do hospital.`,
      fazer: "Revisar o leque e a homologação dos itens dessa operadora e anexar justificativa padrão quando o item for indispensável.",
      hospitalMes: Math.round(ops[0].pedidos * 400 / meses), medicosMes: 0, beneficiario: "hospital",
    });
  }

  const negativos = recorte(regs, d, "cirurgia").filter((l) => l.margemMedia < 0);
  if (negativos[0]) {
    recs.push({
      id: "margem-neg", titulo: `${negativos[0].nome} dá prejuízo em média`,
      vimos: `Margem média de ${brl(negativos[0].margemMedia)} por cirurgia em ${negativos[0].pedidos} cirurgias.`,
      fazer: "Renegociar o pacote com as operadoras que pagam menos ou definir um kit para planos básicos.",
      hospitalMes: Math.round(Math.abs(negativos[0].margemMedia) * negativos[0].pedidos / meses), medicosMes: 0, beneficiario: "hospital",
    });
  }

  const semPadrao = d.procedimentos.filter((p) => d.padroes[p.id]?.status !== "vigente").sort((a, b) => b.volumeMes - a.volumeMes)[0];
  if (semPadrao) {
    recs.push({
      id: "padrao", titulo: `Definir o padrão de ${semPadrao.nome.toLowerCase()}`,
      vimos: `${semPadrao.volumeMes} cirurgias por mês ainda sem padrão aprovado pela comissão.`,
      fazer: "Abrir o pré-modelo da IA na Comissão, ajustar com os médicos e aprovar.",
      hospitalMes: semPadrao.volumeMes * 350, medicosMes: semPadrao.volumeMes * 200, beneficiario: "ambos",
    });
  }

  return recs.sort((a, b) => b.hospitalMes + b.medicosMes - (a.hospitalMes + a.medicosMes));
}
