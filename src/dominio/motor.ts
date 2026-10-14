// ============================================================
// DOMÍNIO — motor de regras (funções puras)
// ============================================================

import type {
  Avaliacao, CondicaoAvaliada, CondicaoTipo, ContratoOperadora, Dominio, ItemPedido, Marca, Padrao, Pedido,
} from "./tipos";

const DIAS_EXTRA_FORA_PADRAO = 7;
const GLOSA_EXTRA_FORA_PROTOCOLO = 15;

export const LABEL_CONDICAO: Record<CondicaoTipo, string> = {
  homologados: "Todos os itens homologados",
  dentro_padrao: "Dentro do padrão e do protocolo",
  codigo_recomendado: "Código recomendado",
  documentos: "Documentos completos",
  prazo_liberacao: "Liberação rápida",
  margem_minima: "Margem mínima do hospital",
  fornecedor_preferencial: "Fornecedores preferenciais",
};

export const CONDICOES_COM_AVISO_JURIDICO: CondicaoTipo[] = ["margem_minima", "fornecedor_preferencial"];

const marcaPorId = (d: Dominio, id: string) => d.marcas.find((x) => x.id === id);

export const contratoDaOperadora = (d: Dominio, operadoraId: string, procedimentoId: string): ContratoOperadora | undefined =>
  d.contratosOperadora.find((c) => c.operadoraId === operadoraId && c.procedimentoId === procedimentoId);

export function addDias(dataIso: string, dias: number): string {
  const dt = new Date(`${dataIso}T12:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + dias);
  return dt.toISOString().slice(0, 10);
}

/** Leque do padrão para uma operadora: a base única filtrada pela homologação. */
export function leque(padrao: Padrao, operadoraId: string, d: Dominio) {
  return padrao.itens.map((ip) => {
    const todas = ip.aceitas.map((id) => marcaPorId(d, id)).filter(Boolean) as Marca[];
    const aceitas = todas.filter((x) => x.homologadaEm.includes(operadoraId));
    const naoHomologadas = todas.filter((x) => !x.homologadaEm.includes(operadoraId));
    const preferenciais = aceitas.filter((x) => ip.preferenciais.includes(x.id));
    return { itemId: ip.itemId, qtdTipica: ip.qtdTipica, aceitas, preferenciais, naoHomologadas, avisoMinimo: aceitas.length < 3 };
  });
}

/** Pedido sugerido pelo hospital: preferenciais homologadas (ou a primeira aceita) e os códigos recomendados. */
export function pedidoSugerido(procedimentoId: string, operadoraId: string, d: Dominio): { codigos: string[]; itens: ItemPedido[] } {
  const padrao = d.padroes[procedimentoId];
  if (!padrao) return { codigos: [], itens: [] };
  const itens = leque(padrao, operadoraId, d)
    .map((l) => {
      const marca = l.preferenciais[0] ?? l.aceitas[0];
      return marca ? { itemId: l.itemId, marcaId: marca.id, qtd: l.qtdTipica } : null;
    })
    .filter(Boolean) as ItemPedido[];
  return { codigos: padrao.codigosRecomendados.map((c) => c.codigo), itens };
}

/** Sugestão de compra rápida: por item, a marca aceita que libera mais rápido. */
export function compraRapida(procedimentoId: string, operadoraId: string, d: Dominio): ItemPedido[] {
  const padrao = d.padroes[procedimentoId];
  if (!padrao) return [];
  return leque(padrao, operadoraId, d)
    .map((l) => {
      const marca = [...l.aceitas].sort((a, b) => a.liberacaoDias - b.liberacaoDias || b.glosaPct - a.glosaPct)[0];
      return marca ? { itemId: l.itemId, marcaId: marca.id, qtd: l.qtdTipica } : null;
    })
    .filter(Boolean) as ItemPedido[];
}

const AVALIACAO_VAZIA = (): Avaliacao => ({
  completo: false,
  checklist: [],
  foraProtocolo: [],
  foraPadrao: [],
  naoHomologados: [],
  honorario: { valor: 0, garantido: false },
  complemento: { total: 0, garantido: 0, perdido: 0, condicoes: [] },
  recebimento: { valor: 0, dias: 0, data: "" },
  liberacaoDias: 0,
  riscoGlosa: 0,
  hospital: { tipo: "pacote", custoOpme: 0, margem: 0, margemPct: 0 },
});

export function avaliarPedido(p: Pedido, d: Dominio): Avaliacao {
  const padrao = d.padroes[p.procedimentoId];
  const contrato = contratoDaOperadora(d, p.operadoraId, p.procedimentoId);
  if (!padrao || !contrato) return AVALIACAO_VAZIA();

  const contratoMedico = d.contratosMedico.find((c) => c.medicoId === p.medicoId);
  const itensPrevistos = new Set(padrao.itens.map((i) => i.itemId));
  const leques = leque(padrao, p.operadoraId, d);

  const foraProtocolo: string[] = [];
  const foraPadrao: string[] = [];
  const naoHomologados: string[] = [];
  let custoOpme = 0;
  let liberacao = 0;
  let glosa = 0;
  let todosPreferenciais = true;

  for (const it of p.itens) {
    const marca = marcaPorId(d, it.marcaId);
    if (!marca) continue;
    custoOpme += marca.custo * it.qtd;
    liberacao = Math.max(liberacao, marca.liberacaoDias);
    glosa = Math.max(glosa, marca.glosaPct);
    if (!marca.homologadaEm.includes(p.operadoraId)) naoHomologados.push(marca.id);
    if (!itensPrevistos.has(it.itemId)) {
      foraProtocolo.push(it.itemId);
      todosPreferenciais = false;
      continue;
    }
    const ip = padrao.itens.find((i) => i.itemId === it.itemId)!;
    if (!ip.aceitas.includes(marca.id)) foraPadrao.push(marca.id);
    if (!ip.preferenciais.includes(marca.id)) todosPreferenciais = false;
  }

  const recomendados = new Set(padrao.codigosRecomendados.map((c) => c.codigo));
  const alerta = padrao.codigosAlerta.filter((c) => p.codigos.includes(c.codigo));
  const codigoOk = p.codigos.length > 0 && p.codigos.every((c) => recomendados.has(c));
  const faltandoDocs = padrao.protocolo.documentos.filter((doc) => !p.documentos.includes(doc));
  const fora = foraProtocolo.length > 0 || foraPadrao.length > 0;

  for (const c of alerta) glosa = Math.max(glosa, c.glosaPct);
  if (foraProtocolo.length > 0) glosa += GLOSA_EXTRA_FORA_PROTOCOLO;
  const riscoGlosa = Math.min(95, glosa);
  const liberacaoDias = liberacao + (fora ? DIAS_EXTRA_FORA_PADRAO : 0);

  const semItens = p.itens.length === 0;
  const checklist = [
    { id: "itens", label: "Materiais escolhidos", ok: !semItens, detalhe: semItens ? "Nenhum item escolhido ainda" : undefined },
    { id: "homologados", label: "Itens homologados na operadora", ok: naoHomologados.length === 0, detalhe: naoHomologados.length ? `${naoHomologados.length} item(ns) sem homologação` : undefined },
    { id: "protocolo", label: "Dentro do protocolo", ok: foraProtocolo.length === 0, detalhe: foraProtocolo.length ? `${foraProtocolo.length} item(ns) que o protocolo não prevê` : undefined },
    { id: "padrao", label: "Marcas do padrão", ok: foraPadrao.length === 0, detalhe: foraPadrao.length ? `${foraPadrao.length} marca(s) fora do leque` : undefined },
    { id: "codigo", label: "Código recomendado", ok: codigoOk, detalhe: alerta.length ? `Código ${alerta[0].codigo} costuma glosar (${alerta[0].glosaPct}%)` : undefined },
    { id: "documentos", label: "Documentos completos", ok: faltandoDocs.length === 0, detalhe: faltandoDocs.length ? `Faltam: ${faltandoDocs.join(", ")}` : undefined },
  ];
  const tudoOk = checklist.every((c) => c.ok);

  // Hospital: receita, custo e margem antes do complemento
  let receita: number;
  let custoBase: number;
  if (contrato.tipo === "pacote") {
    receita = contrato.teto;
    custoBase = contrato.custoHospitalar + custoOpme;
  } else {
    receita = p.itens.reduce((acc, i) => acc + (contrato.tabelaItem[i.itemId] ?? 0) * i.qtd, 0);
    custoBase = custoOpme;
  }
  const margemAntes = receita - custoBase;
  const margemPctAntes = receita > 0 ? (margemAntes / receita) * 100 : 0;

  // Complemento do médico
  const regra = padrao.complemento;
  let condicoes: CondicaoAvaliada[] = [];
  let motivo: string | undefined;
  if (!contratoMedico || !contratoMedico.participaComplemento) {
    motivo = contratoMedico ? "Médico não participa do complemento (contrato)" : "Médico sem contrato com o hospital";
  } else if (regra.modo === "predefinido") {
    condicoes = [{ tipo: "dentro_padrao", label: "Seguir o pedido sugerido pelo hospital", valor: regra.valor, cumprida: tudoOk, avisoJuridico: false }];
  } else {
    condicoes = regra.condicoes.map((c) => {
      const cumprida = !semItens && (() => {
        switch (c.tipo) {
          case "homologados": return naoHomologados.length === 0;
          case "dentro_padrao": return !fora;
          case "codigo_recomendado": return codigoOk;
          case "documentos": return faltandoDocs.length === 0;
          case "prazo_liberacao": return liberacaoDias <= (c.parametro ?? 0);
          case "margem_minima": return margemPctAntes >= (c.parametro ?? 0);
          case "fornecedor_preferencial": return todosPreferenciais && !fora;
        }
      })();
      const label = c.tipo === "prazo_liberacao" ? `Liberação em até ${c.parametro} dias`
        : c.tipo === "margem_minima" ? `Margem mínima de ${c.parametro}%`
        : LABEL_CONDICAO[c.tipo];
      return { tipo: c.tipo, label, valor: c.valor, cumprida, avisoJuridico: CONDICOES_COM_AVISO_JURIDICO.includes(c.tipo) };
    });
  }
  const total = condicoes.reduce((a, c) => a + c.valor, 0);
  const garantido = condicoes.filter((c) => c.cumprida).reduce((a, c) => a + c.valor, 0);

  const margem = Math.round(margemAntes - garantido);
  const hospital: Avaliacao["hospital"] =
    contrato.tipo === "pacote"
      ? { tipo: "pacote", custoOpme, margem, margemPct: receita > 0 ? (margem / receita) * 100 : 0, teto: contrato.teto, consumoTeto: custoBase + garantido }
      : { tipo: "aberta", custoOpme, margem, margemPct: receita > 0 ? (margem / receita) * 100 : 0 };

  const honorarioValor = contrato.honorario[p.plano] ?? 0;
  const dias = contratoMedico ? (p.urgencia ? contratoMedico.repasseUrgenciaDias : contratoMedico.repasseEletivaDias) : 60;

  return {
    completo: true,
    checklist,
    foraProtocolo,
    foraPadrao,
    naoHomologados,
    honorario: { valor: honorarioValor, garantido: tudoOk },
    complemento: { total, garantido, perdido: total - garantido, motivo, condicoes },
    recebimento: { valor: honorarioValor + garantido, dias, data: p.dataCirurgia ? addDias(p.dataCirurgia, dias) : "" },
    liberacaoDias,
    riscoGlosa,
    hospital,
  };
}

/** Quanto o médico vai receber nos próximos 30, 60 e 90 dias e em 12 meses (pedidos em andamento ou confirmados). */
export function previsaoMedico(medicoId: string, pedidos: Pedido[], d: Dominio, hoje: Date = new Date()) {
  const r = { d30: 0, d60: 0, d90: 0, ano: 0 };
  const hojeIso = hoje.toISOString().slice(0, 10);
  const diasAte = (iso: string) => Math.round((Date.parse(`${iso}T12:00:00Z`) - Date.parse(`${hojeIso}T12:00:00Z`)) / 86400000);
  for (const p of pedidos) {
    if (p.medicoId !== medicoId) continue;
    if (p.status !== "confirmado" && p.status !== "esperando_confirmacao") continue;
    const a = avaliarPedido(p, d);
    if (!a.recebimento.data) continue;
    const dias = diasAte(a.recebimento.data);
    if (dias < 0) continue;
    if (dias <= 30) r.d30 += a.recebimento.valor;
    if (dias <= 60) r.d60 += a.recebimento.valor;
    if (dias <= 90) r.d90 += a.recebimento.valor;
    if (dias <= 365) r.ano += a.recebimento.valor;
  }
  return r;
}
