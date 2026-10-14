// ============================================================
// API FICTÍCIA DO MOCK
// Responde nos mesmos endpoints e formatos do backend FastAPI,
// para que as telas funcionem sem backend. Os endpoints marcados
// como "NOVO" são o contrato proposto para o backend do produto.
// ============================================================

import { HOSPITAL_STORAGE_KEY } from "@opme/config/produto";
import { margemUnitaria } from "@opme/lib/produto";
import { FORNECEDORES, FORNECEDORES_POR_ESPECIALIDADE, HOSPITAIS, MEDICOS, OPERADORAS, PROCEDIMENTOS, USUARIO_DEMO } from "./catalogo";
import {
  addDias, cirurgiasDoHospital, dataHoje, ESCALA_RISCO, hashString, historicoProcedimento, prng, serieMensalGlosa, todasCirurgias,
} from "./db";

const LATENCIA_MS = 250;
const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const round2 = (v: number) => Math.round(v * 100) / 100;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function hospitalDaRequisicao(init?: RequestInit): string | null {
  const headers = new Headers(init?.headers || {});
  const doHeader = headers.get("X-Hospital-Id");
  if (doHeader) return doHeader;
  try {
    return localStorage.getItem(HOSPITAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

// ---------------- Handlers ----------------

function getGlosa(params: URLSearchParams, hospitalId: string | null) {
  const cdCirurgia = Number(params.get("CD_CIRURGIA"));
  const cdConvenio = params.get("CD_CONVENIO") ? Number(params.get("CD_CONVENIO")) : undefined;
  const cdPrestador = params.get("CD_PRESTADOR") ? Number(params.get("CD_PRESTADOR")) : undefined;
  const hist = historicoProcedimento(cdCirurgia, cdConvenio, hospitalId);
  if (!hist) return json({ detail: "Procedimento não encontrado" }, 404);

  const proc = hist.procedimento;
  const op = OPERADORAS.find((o) => o.cd === cdConvenio);
  const medico = MEDICOS.find((m) => m.cd === cdPrestador);
  const r = prng(hashString(`glosa-${cdCirurgia}-${cdConvenio}-${cdPrestador}-${hospitalId}`));
  const fornecedores = FORNECEDORES_POR_ESPECIALIDADE[proc.especialidade] ?? [];

  const totalMedico = r.int(18, 70);
  const percMedico = round2(Math.min(80, hist.percGlosada * (medico?.fatorGlosa ?? 1) + r.int(-2, 2)));

  const procedimentosGlosados = Array.from({ length: r.int(10, 18) }, (_, i) => {
    const d = addDias(dataHoje(), -r.int(10, 540));
    const glosado = r.next() < hist.percGlosada / 100 + 0.1;
    return {
      data: d.toLocaleDateString("pt-BR"),
      numero_atendimento: 7_300_000 + r.int(1000, 99999),
      codigo_aviso: 440000 + r.int(1000, 39999) + i,
      nome_medico: r.pick(MEDICOS.filter((m) => m.especialidade === proc.especialidade)).nome,
      valor_opme_glosado: glosado ? round2(hist.valorGlosaMedio * (0.4 + r.next() * 1.2)) : 0,
    };
  }).sort((a, b) => b.data.split("/").reverse().join("").localeCompare(a.data.split("/").reverse().join("")));

  return json({
    glosa_medico: medico
      ? [{
          CD_PRESTADOR: medico.cd,
          total_cirurgias_glosadas: Math.round((totalMedico * percMedico) / 100),
          total_cirurgias: totalMedico,
          perc_glosada: percMedico,
        }]
      : [],
    cobertura_historica: [{
      CD_CIRURGIA: cdCirurgia,
      total_glosas: hist.totalGlosadas,
      total_nao_glosas: hist.totalCirurgias - hist.totalGlosadas,
      perc_glosada: hist.percGlosada,
    }],
    historico_medico_fornecedor: fornecedores.map((f) => {
      const total = r.int(6, 40);
      const perc = round2(Math.max(2, percMedico * (FORNECEDORES[f]?.fatorGlosa ?? 1) * (0.9 + r.next() * 0.2)));
      return {
        CD_PRESTADOR: medico?.cd ?? 0,
        nome_prestador: medico?.nome ?? "",
        NM_FORNECEDOR: f,
        total_itens: total,
        total_glosas: Math.round((total * perc) / 100),
        perc_glosado: perc,
      };
    }),
    // Glosa histórica por fornecedor coerente com o fator usado nas sugestões
    ranking_fornecedor_por_procedimento: fornecedores
      .map((f) => {
        const total = r.int(20, 160);
        const perc = round2(Math.max(2, hist.percGlosada * (FORNECEDORES[f]?.fatorGlosa ?? 1) * (0.92 + r.next() * 0.16)));
        return {
          CD_CIRURGIA: cdCirurgia,
          NM_FORNECEDOR: f,
          total_itens: total,
          total_glosas: Math.round((total * perc) / 100),
          total_nao_glosas: total - Math.round((total * perc) / 100),
          perc_glosado: perc,
          media_valor_glosa_por_aviso: round2(hist.valorGlosaMedio * (0.5 + r.next())),
        };
      })
      .sort((a, b) => a.perc_glosado - b.perc_glosado),
    custo_medio_historico: hist.custoMedio,
    tempo_medio_previsto_de_aprovacao: op?.prazoAutorizacao ?? 14,
    valor_glosa_media_historico: hist.valorGlosaMedio,
    ranking_itens_com_glosa: proc.itens
      .map((it) => ({
        CD_MAT_MED: it.tuss,
        NM_ITEM: it.nome,
        total_glosas: Math.round(hist.totalCirurgias * (it.risco / 100) * ESCALA_RISCO),
        valor_medio_glosa: round2(it.cobrado * 0.5),
        taxa_glosa_pct: Math.round(Math.min(88, it.risco * ESCALA_RISCO * (op?.fatorGlosa ?? 1))),
      }))
      .sort((a, b) => b.taxa_glosa_pct - a.taxa_glosa_pct),
    ranking_itens_opme_utilizados: proc.itens.map((it) => ({
      CD_MAT_MED: it.tuss,
      NM_ITEM: it.nome,
      total_utilizacoes: Math.round(hist.totalCirurgias * ((it.qtd[0] + it.qtd[1]) / 2) * 0.9),
      cirurgias_com_item: Math.round(hist.totalCirurgias * (0.55 + r.next() * 0.45)),
      total_cirurgias_periodo: hist.totalCirurgias,
      media_qtd_por_cirurgia: round2((it.qtd[0] + it.qtd[1]) / 2),
      valor_medio_item: it.cobrado,
    })),
    procedimentos_glosados_operadora: procedimentosGlosados,
  });
}

function getTicketMedio(params: URLSearchParams, hospitalId: string | null) {
  const cdCirurgia = Number(params.get("CD_CIRURGIA"));
  const cdConvenio = params.get("CD_CONVENIO") ? Number(params.get("CD_CONVENIO")) : undefined;
  const meses = params.get("meses") ? Number(params.get("meses")) : null;
  const proc = PROCEDIMENTOS.find((p) => p.cd === cdCirurgia);
  if (!proc) return json({ ticket_medio_geral: 0, ticket_medio_operadora: 0 });
  const op = OPERADORAS.find((o) => o.cd === cdConvenio);
  const r = prng(hashString(`ticket-${cdCirurgia}-${cdConvenio}-${meses}-${hospitalId}`));
  const opmeMedio = proc.itens.reduce((s, it) => s + it.cobrado * ((it.qtd[0] + it.qtd[1]) / 2), 0);
  const geral = (opmeMedio + proc.honorario) * (0.94 + r.next() * 0.08) * (meses && meses <= 12 ? 1.04 : 1);
  return json({
    ticket_medio_geral: round2(geral),
    ticket_medio_operadora: round2(geral * (op?.fatorPagamento ?? 1) * (0.96 + r.next() * 0.06)),
  });
}

function getRankingsFiltrado(params: URLSearchParams, hospitalId: string | null) {
  const operadora = params.get("operadora");
  const especialidade = params.get("especialidade");
  const cirurgia = params.get("cirurgia");
  const procs = PROCEDIMENTOS.filter(
    (p) => (!especialidade || p.especialidade === especialidade) && (!cirurgia || p.nome === cirurgia),
  );
  const op = OPERADORAS.find((o) => o.nome === operadora);
  const r = prng(hashString(`rank-${operadora}-${especialidade}-${cirurgia}-${hospitalId}`));
  const fatorVolume = (op ? op.peso / 15 : 1) * (hospitalId && hospitalId !== "rede" ? 1 : 1.8);

  const fornecedoresMap = new Map<string, number>();
  const itensMap = new Map<string, { quantidade: number; valor: number }>();
  let totalProcedimentos = 0;
  procs.forEach((p) => {
    const volume = Math.round(p.peso * r.int(8, 14) * fatorVolume);
    totalProcedimentos += volume;
    (FORNECEDORES_POR_ESPECIALIDADE[p.especialidade] ?? []).forEach((f) =>
      fornecedoresMap.set(f, (fornecedoresMap.get(f) ?? 0) + Math.round(volume * (0.2 + r.next() * 0.6))),
    );
    p.itens.forEach((it) => {
      const atual = itensMap.get(it.nome) ?? { quantidade: 0, valor: it.cobrado };
      itensMap.set(it.nome, {
        quantidade: atual.quantidade + Math.round(volume * ((it.qtd[0] + it.qtd[1]) / 2)),
        valor: it.cobrado * (op?.fatorPagamento ?? 1),
      });
    });
  });

  return json({
    fornecedores: Array.from(fornecedoresMap.entries())
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 20),
    itensOpme: Array.from(itensMap.entries())
      .map(([nome, v]) => ({ nome, quantidade: v.quantidade, valor_medio: round2(v.valor) }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 20),
    totalProcedimentos,
  });
}

/** NOVO: opções do comparador de operadoras */
function getOpcoesComparador() {
  return json({
    operadoras: OPERADORAS.filter((o) => o.nome !== "SUS").map((o) => o.nome),
    itens: PROCEDIMENTOS.flatMap((p) => p.itens.map((it) => ({ nome: it.nome, especialidade: p.especialidade }))),
    cirurgias: PROCEDIMENTOS.map((p) => ({ nome: p.nome, especialidade: p.especialidade })),
  });
}

/**
 * NOVO: comparador de operadoras. Para as operadoras escolhidas devolve:
 * - geral: situação atual (cirurgias agendadas, valores, glosa, margem, prazos);
 * - itens: por item OPME escolhido, valor pago, custo, glosa e margem por unidade;
 * - cirurgias: por procedimento escolhido, ticket, custo OPME, glosa e margem.
 */
function getComparadorOperadoras(params: URLSearchParams, hospitalId: string | null) {
  const lista = (chave: string) => (params.get(chave) ?? "").split("|").map((s) => s.trim()).filter(Boolean);
  const ops = lista("operadoras").map((n) => OPERADORAS.find((o) => o.nome === n)).filter((o): o is (typeof OPERADORAS)[number] => !!o);
  const escala = hospitalId && hospitalId !== "rede" ? 1 : 1.8;
  const agendadas = cirurgiasDoHospital(hospitalId);

  const geral = ops.map((op) => {
    const r = prng(hashString(`geral-${op.nome}-${hospitalId}`));
    const cirurgias = agendadas.filter((c) => c.CD_CONVENIO === op.cd);
    const itens = cirurgias.flatMap((c) => c.ITENS_PEDIDO);
    const receitaOpme = itens.reduce((s, it) => s + it.valorCobrado * it.quantidade, 0);
    const custoOpme = itens.reduce((s, it) => s + it.valorUnitario * it.quantidade, 0);
    const margem = itens.reduce((s, it) => s + margemUnitaria(it.valorCobrado, it.valorUnitario, it.riscoGlosa) * it.quantidade, 0);
    const exposto = itens.reduce((s, it) => s + it.valorCobrado * it.quantidade * (it.riscoGlosa / 100), 0);
    const cirurgias12m = Math.round(op.peso * r.int(55, 70) * escala);
    const taxaGlosa = round2(Math.min(30, 5.6 * op.fatorGlosa * (0.92 + r.next() * 0.16)));
    return {
      operadora: op.nome,
      cirurgiasAgendadas: cirurgias.length,
      receitaOpmePrevista: round2(receitaOpme),
      custoOpmePrevisto: round2(custoOpme),
      margemOpmePrevista: round2(margem),
      margemPercentual: receitaOpme > 0 ? round2((margem / receitaOpme) * 100) : 0,
      valorExposto: round2(exposto),
      riscoMedio: cirurgias.length ? Math.round(cirurgias.reduce((s, c) => s + c.RISCO_GLOSA, 0) / cirurgias.length) : 0,
      taxaGlosa12m: taxaGlosa,
      valorGlosado12m: Math.round(cirurgias12m * 21000 * (taxaGlosa / 100)),
      prazoAutorizacao: op.prazoAutorizacao,
      fatorPagamento: round2(op.fatorPagamento * 100),
    };
  });

  const itens = lista("itens").map((nome) => {
    const proc = PROCEDIMENTOS.find((p) => p.itens.some((it) => it.nome === nome));
    const item = proc?.itens.find((it) => it.nome === nome);
    return {
      nome,
      procedimento: proc?.nome ?? "",
      porOperadora: ops.map((op) => {
        if (!proc || !item) return { operadora: op.nome, volume: 0, valorPago: 0, custo: 0, taxaGlosa: 0, margemUnidade: 0 };
        const r = prng(hashString(`comp-item-${nome}-${op.nome}-${hospitalId}`));
        const valorPago = round2(item.cobrado * op.fatorPagamento * (0.97 + r.next() * 0.06));
        const taxaGlosa = round2(Math.min(88, item.risco * ESCALA_RISCO * op.fatorGlosa * (0.9 + r.next() * 0.2)));
        return {
          operadora: op.nome,
          volume: Math.round(proc.peso * op.peso * (0.3 + r.next() * 0.3) * ((item.qtd[0] + item.qtd[1]) / 2) * escala),
          valorPago,
          custo: item.custo,
          taxaGlosa,
          margemUnidade: round2(margemUnitaria(valorPago, item.custo, taxaGlosa)),
        };
      }),
    };
  });

  const cirurgias = lista("cirurgias").map((nome) => {
    const proc = PROCEDIMENTOS.find((p) => p.nome === nome);
    return {
      nome,
      especialidade: proc?.especialidade ?? "",
      porOperadora: ops.map((op) => {
        const hist = proc ? historicoProcedimento(proc.cd, op.cd, hospitalId) : null;
        if (!proc || !hist) return { operadora: op.nome, volume: 0, ticketMedio: 0, custoOpme: 0, taxaGlosa: 0, valorGlosadoMedio: 0, margemOpme: 0, prazoAutorizacao: op.prazoAutorizacao };
        const receitaOpme = proc.itens.reduce((s, it) => s + it.cobrado * op.fatorPagamento * ((it.qtd[0] + it.qtd[1]) / 2), 0);
        const margemOpme = proc.itens.reduce(
          (s, it) => s + margemUnitaria(it.cobrado * op.fatorPagamento, it.custo, Math.min(88, it.risco * ESCALA_RISCO * op.fatorGlosa)) * ((it.qtd[0] + it.qtd[1]) / 2),
          0,
        );
        return {
          operadora: op.nome,
          volume: hist.totalCirurgias,
          ticketMedio: round2(receitaOpme + proc.honorario * op.fatorPagamento),
          custoOpme: hist.custoMedio,
          taxaGlosa: hist.percGlosada,
          valorGlosadoMedio: hist.valorGlosaMedio,
          margemOpme: round2(margemOpme),
          prazoAutorizacao: op.prazoAutorizacao,
        };
      }),
    };
  });

  return json({ geral, itens, cirurgias });
}

/** NOVO: indicadores históricos de glosa (série mensal) e por hospital */
function getIndicadoresGlosa(hospitalId: string | null) {
  const serie = serieMensalGlosa(hospitalId);
  const porHospital = HOSPITAIS.map((h) => {
    const s = serieMensalGlosa(h.id);
    const ultimos3 = s.slice(-3);
    const cirurgias = cirurgiasDoHospital(h.id);
    return {
      hospitalId: h.id,
      hospital: h.nome,
      erp: h.erp,
      taxaGlosa: round2(ultimos3.reduce((acc, m) => acc + m.taxaGlosa, 0) / ultimos3.length),
      valorGlosado12m: s.reduce((acc, m) => acc + m.valorGlosado, 0),
      cirurgiasAgendadas: cirurgias.length,
      riscoMedio: Math.round(cirurgias.reduce((acc, c) => acc + c.RISCO_GLOSA, 0) / cirurgias.length),
    };
  });
  return json({ serie, porHospital });
}

// ---------------- Roteador ----------------

export async function mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  await esperar(LATENCIA_MS);
  const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, "http://mock.local");
  const path = url.pathname.replace(/\/+$/, "");
  const metodo = (init?.method || "GET").toUpperCase();
  const params = url.searchParams;
  const hospitalId = hospitalDaRequisicao(init);

  if (path.endsWith("/auth/login") && metodo === "POST") {
    const body = new URLSearchParams(String(init?.body ?? ""));
    return json({ access_token: "mock-token", token_type: "bearer", username: body.get("username") || USUARIO_DEMO.username });
  }

  if (path.endsWith("/get_surgeries_by_page")) {
    const page = Number(params.get("page") || 1);
    const size = Number(params.get("number_of_results") || 10);
    const lista = cirurgiasDoHospital(hospitalId);
    return json(lista.slice((page - 1) * size, page * size));
  }

  if (path.endsWith("/get_glosa")) return getGlosa(params, hospitalId);
  if (path.endsWith("/get_ticket_medio_simples")) return getTicketMedio(params, hospitalId);
  if (path.endsWith("/get_rankings_bi_filtrado")) return getRankingsFiltrado(params, hospitalId);
  if (path.endsWith("/get_comparador_operadoras")) return getComparadorOperadoras(params, hospitalId);
  if (path.endsWith("/get_opcoes_comparador")) return getOpcoesComparador();
  if (path.endsWith("/get_indicadores_glosa")) return getIndicadoresGlosa(hospitalId);

  if (path.endsWith("/salvar_itens_cirurgia_atual") && metodo === "POST") {
    const payload = JSON.parse(String(init?.body ?? "{}"));
    const cirurgia = todasCirurgias().find((c) => c.CD_AVISO_CIRURGIA === payload.cod_cirurgia);
    if (cirurgia && Array.isArray(payload.itens)) {
      cirurgia.items = payload.itens.map((it: { nome_item: string; quantidade_item: number }) => ({
        item: it.nome_item,
        quantidade: it.quantidade_item,
        fornecedores: payload.fornecedores ?? [],
        homolog: (payload.fornecedores ?? []).map(() => true),
      }));
      cirurgia.ITENS_PEDIDO = cirurgia.ITENS_PEDIDO.map((it) => {
        const editado = payload.itens.find((p: { nome_item: string }) => p.nome_item === it.nome);
        return editado ? { ...it, quantidade: editado.quantidade_item } : it;
      });
    }
    return json({ status: "ok", itens_salvos: payload.itens?.length ?? 0 });
  }

  if (path.endsWith("/salvar_misto_boolean_for_surgery") && metodo === "PUT") {
    const cirurgia = todasCirurgias().find((c) => c.CD_AVISO_CIRURGIA === Number(params.get("CD_AVISO_CIRURGIA")));
    if (cirurgia) cirurgia.SN_MISTO = params.get("SN_MISTO") === "true";
    return json({ status: "ok" });
  }

  const deletar = path.match(/\/deletar_itens_opme\/(\d+)$/);
  if (deletar && metodo === "DELETE") {
    const cirurgia = todasCirurgias().find((c) => c.CD_AVISO_CIRURGIA === Number(deletar[1]));
    const qtd = cirurgia?.items.length ?? 0;
    if (cirurgia) cirurgia.items = [];
    return json({ status: "ok", itens_deletados: qtd });
  }

  return json({ detail: "Endpoint não encontrado no mock" }, 404);
}
