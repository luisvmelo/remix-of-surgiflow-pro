// ============================================================
// BANCO FICTÍCIO DO MOCK
// Gera, de forma determinística, as cirurgias futuras de cada hospital
// no mesmo formato da API real (get_surgeries_by_page), acrescido dos
// campos do produto (itens do pedido, risco de glosa, sugestões, margem).
// ============================================================

import {
  HOSPITAIS, OPERADORAS, FORNECEDORES, FORNECEDORES_POR_ESPECIALIDADE, MEDICOS,
  PROCEDIMENTOS, ETAPAS_PROCESSO, SLA_ETAPA, COMPRADORES, Operadora, ProcedimentoTemplate, ItemTemplate, Medico, classeDoItem, homologadoPor,
} from "./catalogo";
import { DestaqueOpcao, ItemPedido, OpcaoPedido, PedidoCirurgico, SugestaoTroca, TipoFornecimento, TipoProcedimento } from "@opme/types/produto";
import { margemUnitaria, riscoCirurgia } from "@opme/lib/produto";

// ---------------- PRNG determinístico ----------------

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function prng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T,>(arr: T[]): T => arr[Math.floor(next() * arr.length)],
    weighted: <T extends { peso: number }>(arr: T[]): T => {
      const total = arr.reduce((s, x) => s + x.peso, 0);
      let r = next() * total;
      for (const x of arr) {
        r -= x.peso;
        if (r <= 0) return x;
      }
      return arr[arr.length - 1];
    },
  };
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const round2 = (v: number) => Math.round(v * 100) / 100;

// ---------------- Datas ----------------

const DIA = 24 * 60 * 60 * 1000;
const hoje = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const isoDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const addDias = (d: Date, dias: number) => new Date(d.getTime() + dias * DIA);

// ---------------- Tipos do banco ----------------

export interface MockBackendItem {
  item: string;
  quantidade: number;
  fornecedores: string[];
  homolog: boolean[];
}

export interface MockSurgery {
  HOSPITAL_ID: string;
  ESPECIALIDADE: string;
  CD_AVISO_CIRURGIA: number;
  CD_PRESTADOR: number;
  NM_PRESTADOR: string;
  CD_CONVENIO: number;
  NM_CONVENIO: string;
  SN_PACOTE: string;
  SN_MISTO: boolean;
  CD_CIRURGIA: number;
  DS_CIRURGIA: string;
  DT_AVISO_CIRURGIA: string;
  DT_INICIO_AGE_CIR: string;
  DT_CIRURGIA: string;
  TP_CIRURGIA: string;
  ETAPA_PROCESSO: string;
  TP_CIRURGIAS: string;
  VL_PREVISTO: number;
  DIF_CP_RA: number | null;
  DIF_RA_PA: number | null;
  NM_PACIENTE: string;
  items: MockBackendItem[];
  // ---- Campos do produto ----
  TIPO_PROCEDIMENTO: TipoProcedimento;
  RISCO_GLOSA: number;
  VL_RECEITA_PREVISTA: number;
  VL_CUSTO_PREVISTO: number;
  ITENS_PEDIDO: ItemPedido[];
  PEDIDO: PedidoCirurgico;
  // ---- Acompanhamento (tático) ----
  /** Dias desde a entrada na etapa atual */
  DIAS_NA_ETAPA: number;
  /** Prazo esperado da etapa atual (dias) */
  SLA_ETAPA: number;
  /** Fornecedor confirmou a entrega do material */
  MATERIAL_CONFIRMADO: boolean;
  COMPRADOR: string;
}

// ---------------- Cálculo de risco e sugestões ----------------

/** Escala do risco-base do catálogo para taxas de glosa realistas de OPME */
export const ESCALA_RISCO = 0.62;

export function riscoItem(base: number, op: Operadora, fornecedor: string, medico: Medico, ruido: number) {
  const fForn = FORNECEDORES[fornecedor]?.fatorGlosa ?? 1;
  return Math.round(clamp(base * ESCALA_RISCO * op.fatorGlosa * fForn * medico.fatorGlosa + ruido, 2, 88));
}

const margemEsperada = margemUnitaria;

/**
 * Alternativas para um item do pedido:
 * - fornecedor com menor glosa histórica para o mesmo item;
 * - fornecedor com maior rentabilidade (margem esperada) para o mesmo item;
 * - item equivalente por equivalência técnica (registro ANVISA).
 * Quando o mesmo fornecedor vence nos dois critérios, vira uma sugestão só.
 */
function montarSugestoes(
  itemId: string, tpl: ItemTemplate, qtd: number, fornecedor: string, risco: number,
  custo: number, cobrado: number, op: Operadora, medico: Medico, especialidade: string,
): SugestaoTroca[] {
  const sugestoes: SugestaoTroca[] = [];
  const margemAtual = margemEsperada(cobrado, custo, risco) * qtd;

  const candidatos = (FORNECEDORES_POR_ESPECIALIDADE[especialidade] ?? [])
    .filter((f) => f !== fornecedor)
    .map((f) => {
      const forn = FORNECEDORES[f];
      const riscoNovo = riscoItem(tpl.risco, op, f, medico, 0);
      const custoNovo = round2(tpl.custo * forn.fatorPreco);
      return {
        forn,
        riscoNovo,
        custoNovo,
        delta: Math.round(margemEsperada(cobrado, custoNovo, riscoNovo) * qtd - margemAtual),
      };
    });

  const menorGlosa = [...candidatos].sort((a, b) => a.riscoNovo - b.riscoNovo)[0];
  const maiorRent = [...candidatos].sort((a, b) => b.delta - a.delta)[0];

  const porFornecedor = new Map<string, { c: (typeof candidatos)[number]; categorias: SugestaoTroca["categorias"] }>();
  if (menorGlosa && menorGlosa.riscoNovo < risco - 3) {
    porFornecedor.set(menorGlosa.forn.nome, { c: menorGlosa, categorias: ["menor_glosa"] });
  }
  if (maiorRent && maiorRent.delta >= 50) {
    const existente = porFornecedor.get(maiorRent.forn.nome);
    if (existente) existente.categorias.push("maior_rentabilidade");
    else porFornecedor.set(maiorRent.forn.nome, { c: maiorRent, categorias: ["maior_rentabilidade"] });
  }

  porFornecedor.forEach(({ c, categorias }, nome) => {
    const partes: string[] = [];
    if (categorias.includes("menor_glosa")) {
      partes.push(`risco de glosa ${Math.round((1 - c.riscoNovo / risco) * 100)}% menor que com ${fornecedor} neste item com ${op.nome}`);
    }
    if (categorias.includes("maior_rentabilidade")) {
      const economia = custo - c.custoNovo;
      partes.push(
        economia > 0
          ? `custo ${formatarReais(economia)} menor por unidade; maior margem esperada entre os fornecedores cotados`
          : "maior margem esperada entre os fornecedores cotados",
      );
    }
    sugestoes.push({
      id: `${itemId}-${hashString(nome) % 100000}`,
      categorias,
      tipo: "fornecedor",
      itemOriginal: tpl.nome,
      fornecedorOriginal: fornecedor,
      itemSugerido: tpl.nome,
      fornecedorSugerido: nome,
      equivalenciaTecnica: false,
      registroAnvisa: tpl.anvisa,
      valorUnitario: c.custoNovo,
      riscoAntes: risco,
      riscoDepois: c.riscoNovo,
      margemDelta: c.delta,
      motivo: partes.map((p, i) => (i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p)).join("; "),
    });
  });

  // Item equivalente, com o fornecedor que dá a maior margem para ele
  if (tpl.equivalente) {
    const eq = tpl.equivalente;
    const cobradoNovo = round2(eq.cobrado * op.fatorPagamento);
    const melhorEq = (FORNECEDORES_POR_ESPECIALIDADE[especialidade] ?? [])
      .map((f) => {
        const riscoNovo = riscoItem(eq.risco, op, f, medico, 0);
        const custoNovo = round2(eq.custo * (FORNECEDORES[f]?.fatorPreco ?? 1));
        return { f, riscoNovo, custoNovo, delta: Math.round(margemEsperada(cobradoNovo, custoNovo, riscoNovo) * qtd - margemAtual) };
      })
      .sort((a, b) => b.delta - a.delta)[0];
    if (melhorEq && (melhorEq.delta > 0 || melhorEq.riscoNovo < risco - 5)) {
      sugestoes.push({
        id: `${itemId}-e`,
        categorias: ["equivalente"],
        tipo: "item",
        itemOriginal: tpl.nome,
        fornecedorOriginal: fornecedor,
        itemSugerido: eq.nome,
        fornecedorSugerido: melhorEq.f,
        equivalenciaTecnica: true,
        registroAnvisa: eq.anvisa,
        valorUnitario: melhorEq.custoNovo,
        riscoAntes: risco,
        riscoDepois: melhorEq.riscoNovo,
        margemDelta: melhorEq.delta,
        motivo: `Equivalente técnico com registro ANVISA ${eq.anvisa}; histórico de glosa menor com ${op.nome}`,
      });
    }
  }

  return sugestoes;
}

// ---------------- Preferência do médico e opções do pedido ----------------

/**
 * Histórico do médico com um item: em quantas cirurgias ele usou e a fatia de cada fornecedor.
 * Determinístico por médico e item. O favorito de cada médico concentra boa parte do uso.
 */
export function preferenciaMedico(medico: Medico, itemNome: string, especialidade: string) {
  const r = prng(hashString(`pref-${medico.cd}-${itemNome}`));
  const fornecedores = FORNECEDORES_POR_ESPECIALIDADE[especialidade] ?? [];
  const favorito = r.int(0, Math.max(0, fornecedores.length - 1));
  const pesos = fornecedores.map((_, i) => r.next() ** 2 + 0.06 + (i === favorito ? 1.1 : 0));
  const total = pesos.reduce((a, b) => a + b, 0);
  const cirurgias = r.int(9, 64);
  const uso = fornecedores
    .map((f, i) => ({ fornecedor: f, pct: Math.round((pesos[i] / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);
  return { cirurgias, uso };
}

const notaDoUso = (pct: number, maxPct: number) => (pct <= 0 ? 0 : Math.max(1, Math.round((pct / Math.max(1, maxPct)) * 5)));

/**
 * Opções do item: os 3 fornecedores indicados pelo médico (os que ele mais usa) e as
 * alternativas fora da indicação (o fornecedor restante e o item equivalente ANVISA).
 */
export function montarOpcoes(
  itemId: string, tpl: ItemTemplate, qtd: number, op: Operadora, medico: Medico, especialidade: string, ruido: number,
) {
  const pref = preferenciaMedico(medico, tpl.nome, especialidade);
  const usoDe = (f: string) => pref.uso.find((u) => u.fornecedor === f)?.pct ?? 0;
  const maxPct = pref.uso[0]?.pct ?? 1;
  const cobrado = round2(tpl.cobrado * op.fatorPagamento);
  const indicados = pref.uso.slice(0, 3).map((u) => u.fornecedor);

  const opcao = (origem: OpcaoPedido["origem"], f: string, nome: string, anvisa: string, custoBase: number,
    cobradoUnit: number, riscoBase: number, equivalente: boolean, sufixo: string): OpcaoPedido => {
    // Não homologado pela operadora: glosa certa
    const homologado = homologadoPor(op.cd, f, nome, equivalente);
    const risco = homologado ? riscoItem(riscoBase, op, f, medico, ruido) : 100;
    const custo = round2(custoBase * (FORNECEDORES[f]?.fatorPreco ?? 1));
    const pct = equivalente ? 0 : usoDe(f);
    return {
      id: `${itemId}-${sufixo}`,
      origem, fornecedor: f, item: nome, registroAnvisa: anvisa, equivalente,
      custoUnitario: custo, cobradoUnitario: cobradoUnit, riscoGlosa: risco,
      margem: Math.round(margemUnitaria(cobradoUnit, custo, risco) * qtd),
      usoMedicoPct: pct,
      usoMedicoCirurgias: Math.round((pref.cirurgias * pct) / 100),
      notaMedico: notaDoUso(pct, maxPct),
      homologado,
      destaques: [],
    };
  };

  const doMedico = indicados.map((f, i) => opcao("medico", f, tpl.nome, tpl.anvisa, tpl.custo, cobrado, tpl.risco, false, `m${i}`));
  const alternativas: OpcaoPedido[] = (FORNECEDORES_POR_ESPECIALIDADE[especialidade] ?? [])
    .filter((f) => !indicados.includes(f))
    .map((f, i) => opcao("alternativa", f, tpl.nome, tpl.anvisa, tpl.custo, cobrado, tpl.risco, false, `a${i}`));
  if (tpl.equivalente) {
    const eq = tpl.equivalente;
    const cobradoEq = round2(eq.cobrado * op.fatorPagamento);
    const melhor = (FORNECEDORES_POR_ESPECIALIDADE[especialidade] ?? [])
      .map((f) => opcao("alternativa", f, eq.nome, eq.anvisa, eq.custo, cobradoEq, eq.risco, true, "e"))
      .sort((a, b) => b.margem - a.margem)[0];
    if (melhor) alternativas.push(melhor);
  }

  const margens = doMedico.map((o) => o.margem);
  const marcar = (lista: OpcaoPedido[], d: DestaqueOpcao, melhor: (a: OpcaoPedido, b: OpcaoPedido) => number) => {
    const top = [...lista].sort(melhor)[0];
    if (top) top.destaques.push(d);
  };
  marcar(doMedico, "preferido_medico", (a, b) => b.usoMedicoPct - a.usoMedicoPct);
  marcar(doMedico, "maior_margem", (a, b) => b.margem - a.margem || b.usoMedicoPct - a.usoMedicoPct);
  marcar(doMedico, "menor_custo", (a, b) => a.custoUnitario - b.custoUnitario);
  marcar(doMedico, "menor_glosa", (a, b) => a.riscoGlosa - b.riscoGlosa);
  // Alternativas só ganham destaque quando superam todos os indicados
  const melhorMargemMedico = Math.max(...margens);
  const menorRiscoMedico = Math.min(...doMedico.map((o) => o.riscoGlosa));
  alternativas.forEach((a) => {
    if (a.margem > melhorMargemMedico + 50) a.destaques.push("maior_margem");
    if (a.riscoGlosa < menorRiscoMedico - 3) a.destaques.push("menor_glosa");
  });

  return { opcoes: [...doMedico, ...alternativas], indicados, cirurgiasMedico: pref.cirurgias };
}

const formatarReais = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

// ---------------- Geração das cirurgias ----------------

const INICIAIS = "ABCDEFGHIJLMNOPRSTV";

function gerarCirurgias(hospitalId: string, quantidade: number, avisoInicial: number): MockSurgery[] {
  const r = prng(hashString(hospitalId));
  const base = hoje();
  const lista: MockSurgery[] = [];

  for (let i = 0; i < quantidade; i++) {
    const proc: ProcedimentoTemplate = r.weighted(PROCEDIMENTOS);
    const op = r.weighted(OPERADORAS);
    const medicosEsp = MEDICOS.filter((m) => m.especialidade === proc.especialidade);
    const medico = r.pick(medicosEsp);
    const fornecedoresEsp = FORNECEDORES_POR_ESPECIALIDADE[proc.especialidade];
    const aviso = avisoInicial + i * 7 + r.int(0, 6);

    const diasAteCirurgia = r.int(1, 42);
    const dtCirurgia = addDias(base, diasAteCirurgia);
    const dtAviso = addDias(base, -r.int(1, 18));
    const etapa = r.weighted(ETAPAS_PROCESSO).nome;

    const pacote = r.next() < proc.pacoteProb;
    const misto = !pacote && r.next() < 0.18;
    const tipoProc: TipoProcedimento = pacote ? "Pacote" : misto ? "Misto" : "Aberto";

    const itens: ItemPedido[] = proc.itens.map((tpl, idx) => {
      const qtd = r.int(tpl.qtd[0], tpl.qtd[1]);
      const itemId = `${aviso}-${idx}`;
      const ruido = r.int(-6, 8);
      // O pedido traz 3 fornecedores indicados pelo médico; o primeiro é o que ele mais usa
      const { opcoes, indicados, cirurgiasMedico } = montarOpcoes(itemId, tpl, qtd, op, medico, proc.especialidade, ruido);
      const fornecedor = indicados[0] ?? r.pick(fornecedoresEsp);
      const risco = opcoes[0]?.riscoGlosa ?? riscoItem(tpl.risco, op, fornecedor, medico, ruido);
      const custo = round2(tpl.custo * (FORNECEDORES[fornecedor]?.fatorPreco ?? 1));
      const cobrado = round2(tpl.cobrado * op.fatorPagamento);
      const tipoFornecimento: TipoFornecimento = pacote
        ? "pacote"
        : misto && idx === 0
          ? "pacote"
          : r.next() < 0.3 ? "fornecimento_direto" : "cobranca_em_conta";
      const cotacao = indicados;
      return {
        id: itemId,
        nome: tpl.nome,
        classe: classeDoItem(tpl.nome),
        historicoMedicoCirurgias: cirurgiasMedico,
        opcoes,
        quantidade: qtd,
        tipoFornecimento,
        fornecedor,
        fornecedoresCotacao: cotacao,
        registroAnvisa: tpl.anvisa,
        codigoTuss: tpl.tuss,
        valorUnitario: custo,
        valorCobrado: cobrado,
        riscoGlosa: risco,
        tipoGlosa: risco >= 12 ? tpl.tipoGlosa : undefined,
        motivoRisco: tpl.motivo,
        sugestoes: montarSugestoes(itemId, tpl, qtd, fornecedor, risco, custo, cobrado, op, medico, proc.especialidade),
      };
    });

    const custoTotal = round2(itens.reduce((s, it) => s + it.valorUnitario * it.quantidade, 0));
    const receitaOpme = itens.reduce((s, it) => s + it.valorCobrado * it.quantidade, 0);
    const receitaTotal = round2(receitaOpme + proc.honorario * op.fatorPagamento);
    const etapaIdx = ETAPAS_PROCESSO.findIndex((e) => e.nome === etapa);
    const iniciais = Array.from({ length: 3 }, () => r.pick(INICIAIS.split(""))).join(".") + ".";

    // Comprador responsável e, depois da autorização, a compra já fechada por ele
    // (prng próprio para não alterar o resto da geração)
    const rc = prng(hashString(`compra-${aviso}`));
    const comprador = rc.pick(COMPRADORES);
    if (etapaIdx >= 4 && rc.next() < 0.85) {
      itens.forEach((it) => {
        const preferida = it.opcoes[0];
        const maior = it.opcoes
          .filter((o) => o.origem === "medico" && o.homologado)
          .sort((a, b) => b.margem - a.margem)[0];
        const escolhida = maior && rc.next() < comprador.aproveitamento ? maior : preferida;
        if (escolhida) it.compra = { opcaoId: escolhida.id, por: comprador.nome, em: isoDate(addDias(dtAviso, rc.int(1, 6))) };
      });
    }

    // Acompanhamento: tempo na etapa atual contra o prazo esperado (autorização usa o prazo da operadora)
    const sla = etapa === "Aguardando Autorização" || etapa === "Em Análise" ? op.prazoAutorizacao : SLA_ETAPA[etapa] ?? 3;
    const diasNaEtapa = r.next() < 0.3 ? r.int(sla + 1, sla + 9) : r.int(0, Math.max(1, sla));
    const materialConfirmado = etapaIdx >= 4 ? r.next() < 0.6 + Math.min(0.35, diasAteCirurgia / 60) : false;

    const camposRevisar: string[] = [];
    const confianca = r.int(82, 99);
    if (confianca < 90) camposRevisar.push("Quantidade de parafusos");
    if (confianca < 86) camposRevisar.push("Código TUSS do item 2");

    lista.push({
      HOSPITAL_ID: hospitalId,
      ESPECIALIDADE: proc.especialidade,
      CD_AVISO_CIRURGIA: aviso,
      CD_PRESTADOR: medico.cd,
      NM_PRESTADOR: medico.nome,
      CD_CONVENIO: op.cd,
      NM_CONVENIO: op.nome,
      SN_PACOTE: pacote ? "S" : "N",
      SN_MISTO: misto,
      CD_CIRURGIA: proc.cd,
      DS_CIRURGIA: proc.nome,
      DT_AVISO_CIRURGIA: isoDate(dtAviso),
      DT_INICIO_AGE_CIR: isoDate(dtCirurgia),
      DT_CIRURGIA: isoDate(dtCirurgia),
      TP_CIRURGIA: proc.porte,
      ETAPA_PROCESSO: etapa,
      TP_CIRURGIAS: r.next() < 0.82 ? "E" : r.next() < 0.75 ? "U" : "EM",
      VL_PREVISTO: receitaTotal,
      DIF_CP_RA: etapaIdx >= 4 ? r.int(Math.max(2, op.prazoAutorizacao - 6), op.prazoAutorizacao + 6) : null,
      DIF_RA_PA: etapaIdx >= 2 ? r.int(2, 11) : null,
      NM_PACIENTE: iniciais,
      items: itens.map((it) => ({
        item: it.nome,
        quantidade: it.quantidade,
        fornecedores: it.fornecedoresCotacao,
        homolog: it.fornecedoresCotacao.map((f) => it.opcoes.find((o) => o.fornecedor === f && !o.equivalente)?.homologado ?? true),
      })),
      TIPO_PROCEDIMENTO: tipoProc,
      RISCO_GLOSA: riscoCirurgia(itens.map((it) => it.riscoGlosa)),
      VL_RECEITA_PREVISTA: receitaTotal,
      VL_CUSTO_PREVISTO: custoTotal,
      ITENS_PEDIDO: itens,
      PEDIDO: {
        arquivo: `pedido_cirurgico_${aviso}.pdf`,
        origem: HOSPITAIS.find((h) => h.id === hospitalId)?.erp ?? "MV Soul",
        paginas: r.int(1, 3),
        lidoEm: new Date(dtAviso.getTime() + r.int(1, 8) * 60 * 60 * 1000).toISOString(),
        confianca,
        cid: proc.cid,
        justificativa: `Paciente com indicação cirúrgica para ${proc.nome.toLowerCase()} após falha do tratamento conservador.`,
        camposRevisar,
      },
      DIAS_NA_ETAPA: diasNaEtapa,
      SLA_ETAPA: sla,
      MATERIAL_CONFIRMADO: materialConfirmado,
      COMPRADOR: comprador.nome,
    });
  }
  return lista;
}

let cache: MockSurgery[] | null = null;

export function todasCirurgias(): MockSurgery[] {
  if (!cache) {
    cache = [
      ...gerarCirurgias("h-aurora", 230, 481000),
      ...gerarCirurgias("h-horizonte", 170, 523000),
    ];
  }
  return cache;
}

export function cirurgiasDoHospital(hospitalId: string | null): MockSurgery[] {
  const todas = todasCirurgias();
  if (!hospitalId || hospitalId === "rede") return todas;
  return todas.filter((c) => c.HOSPITAL_ID === hospitalId);
}

// ---------------- Histórico (cirurgias realizadas) ----------------

export interface HistoricoProcedimento {
  procedimento: ProcedimentoTemplate;
  totalCirurgias: number;
  totalGlosadas: number;
  percGlosada: number;
  custoMedio: number;
  valorGlosaMedio: number;
}

/** Histórico agregado de um procedimento (opcionalmente numa operadora), 24 meses */
export function historicoProcedimento(cdCirurgia: number, cdConvenio?: number, hospitalId?: string | null): HistoricoProcedimento | null {
  const proc = PROCEDIMENTOS.find((p) => p.cd === cdCirurgia);
  if (!proc) return null;
  const op = OPERADORAS.find((o) => o.cd === cdConvenio);
  const r = prng(hashString(`hist-${cdCirurgia}-${cdConvenio ?? "all"}-${hospitalId ?? "rede"}`));
  const escala = hospitalId && hospitalId !== "rede" ? 1 : 1.8;
  const totalCirurgias = Math.round(r.int(proc.peso * 9, proc.peso * 16) * (op ? op.peso / 15 : 1) * escala);
  const riscoMedio = proc.itens.reduce((s, it) => s + it.risco, 0) / proc.itens.length;
  const percGlosada = round2(clamp(riscoMedio * 0.55 * (op?.fatorGlosa ?? 1) + r.int(-3, 3), 1, 70));
  const totalGlosadas = Math.round((totalCirurgias * percGlosada) / 100);
  const custoMedio = round2(proc.itens.reduce((s, it) => s + it.custo * ((it.qtd[0] + it.qtd[1]) / 2), 0));
  // Valor médio glosado por cirurgia glosada (glosa parcial: metade do valor do item)
  const valorGlosaMedio = round2(
    proc.itens.reduce((s, it) => s + it.cobrado * ((it.qtd[0] + it.qtd[1]) / 2) * 0.5 * (it.risco / 40), 0) * (op?.fatorGlosa ?? 1),
  );
  return { procedimento: proc, totalCirurgias, totalGlosadas, percGlosada, custoMedio, valorGlosaMedio };
}

/** Série mensal de taxa de glosa de OPME (últimos 12 meses) */
export function serieMensalGlosa(hospitalId: string | null) {
  const r = prng(hashString(`serie-${hospitalId ?? "rede"}`));
  const base = hoje();
  const meses: Array<{ mes: string; taxaGlosa: number; valorGlosado: number; cirurgias: number }> = [];
  let taxa = 7.8;
  for (let i = 11; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    // Queda gradual a partir do início do uso do produto (últimos 4 meses)
    taxa = clamp(taxa + (i <= 3 ? -0.45 : 0) + (r.next() - 0.5) * 0.6, 3, 12);
    const cirurgias = r.int(170, 240) * (hospitalId === "rede" || !hospitalId ? 2 : 1);
    meses.push({
      mes: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      taxaGlosa: round2(taxa),
      valorGlosado: Math.round(cirurgias * 21000 * (taxa / 100)),
      cirurgias,
    });
  }
  return meses;
}

export { hoje as dataHoje, isoDate, addDias };
