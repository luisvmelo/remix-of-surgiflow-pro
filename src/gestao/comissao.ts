// ============================================================
// GESTÃO — funções da Comissão (fluxo do GME)
// ============================================================

import { aplicarSugestao, avaliarPedido, contratoDaOperadora, pedidoSugerido } from "@/dominio/motor";
import type { Avaliacao, Dominio, Padrao, SugestaoAlteracao } from "@/dominio/tipos";
import { dentroDoPadrao, type Registro } from "./analise";

const media = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);

/**
 * Ganho possível por mês: quanto a margem média sobe quando todos seguem o padrão,
 * vezes o volume mensal do procedimento.
 */
export function ganhoPossivel(regs: Registro[], d: Dominio, procedimentoId: string): number {
  const proc = d.procedimentos.find((p) => p.id === procedimentoId);
  const lista = regs.filter((r) => r.pedido.procedimentoId === procedimentoId);
  const dentro = lista.filter((r) => dentroDoPadrao(r.a));
  if (!proc || !lista.length || !dentro.length) return 0;
  const diferenca = media(dentro.map((r) => r.a.hospital.margem)) - media(lista.map((r) => r.a.hospital.margem));
  return Math.max(0, Math.round(diferenca * proc.volumeMes));
}

/** Por que a IA sugere (ou não) uma marca: os números dela e quanto os médicos do hospital já usam. */
export function explicacaoIA(marcaId: string, procedimentoId: string, regs: Registro[], d: Dominio) {
  const marca = d.marcas.find((m) => m.id === marcaId);
  const comMarca = regs.filter((r) => r.pedido.procedimentoId === procedimentoId && r.pedido.itens.some((i) => i.marcaId === marcaId));
  const medicos = new Set(comMarca.map((r) => r.pedido.medicoId)).size;
  if (!marca) return { usos: 0, medicos: 0, texto: "" };
  const partes = [`libera em ${marca.liberacaoDias} dias`, `glosa ${marca.glosaPct}%`];
  partes.push(comMarca.length ? `usada em ${comMarca.length} cirurgias por ${medicos} médico(s)` : "ainda não usada aqui");
  if (marca.glosaPct >= 15) partes.push("a IA não recomenda: glosa alta");
  return { usos: comMarca.length, medicos, texto: partes.join(" · ") };
}

/** Pedido montado com as marcas indicadas (uma por item) para avaliar no motor. */
function simular(padrao: Padrao, operadoraId: string, d: Dominio, itens = pedidoSugerido(padrao.procedimentoId, operadoraId, { ...d, padroes: { ...d.padroes, [padrao.procedimentoId]: padrao } }).itens, medicoId = "__previa__"): Avaliacao {
  const dd: Dominio = {
    ...d,
    padroes: { ...d.padroes, [padrao.procedimentoId]: padrao },
    // Médico fictício que participa do complemento, para a prévia mostrar o valor
    contratosMedico: [...d.contratosMedico, { medicoId: "__previa__", procedimentos: [padrao.procedimentoId], participaComplemento: true, repasseEletivaDias: 60, repasseUrgenciaDias: 30, vigencia: "2099-12-31" }],
  };
  return avaliarPedido({
    id: "previa", medicoId, paciente: { nome: "", cpf: "" }, operadoraId, plano: "Especial", procedimentoId: padrao.procedimentoId,
    codigos: padrao.codigosRecomendados.map((c) => c.codigo), itens, documentos: [...padrao.protocolo.documentos],
    status: "rascunho", ajustes: [], urgencia: false, criadoEm: "", dataCirurgia: "",
  }, dd);
}

/** O que o médico recebe de complemento seguindo o pedido sugerido pelo hospital. */
export function previaComplemento(padrao: Padrao, operadoraId: string, d: Dominio): number {
  return simular(padrao, operadoraId, d).complemento.garantido;
}

const complementoMaximo = (padrao: Padrao) =>
  padrao.complemento.modo === "predefinido" ? padrao.complemento.valor : padrao.complemento.condicoes.reduce((a, c) => a + c.valor, 0);

/**
 * Melhor e pior caso do leque nesta operadora.
 * Pacote: consumo do teto (custo hospitalar + OPME + complemento). Conta aberta: margem.
 */
export function faixaPadrao(padrao: Padrao, operadoraId: string, d: Dominio) {
  const contrato = contratoDaOperadora(d, operadoraId, padrao.procedimentoId);
  const comp = complementoMaximo(padrao);
  let barato = 0;
  let caro = 0;
  let margemMelhor = 0;
  let margemPior = 0;
  for (const ip of padrao.itens) {
    const marcas = d.marcas.filter((m) => ip.aceitas.includes(m.id) && m.homologadaEm.includes(operadoraId));
    if (!marcas.length) continue;
    const custos = marcas.map((m) => m.custo);
    barato += Math.min(...custos) * ip.qtdTipica;
    caro += Math.max(...custos) * ip.qtdTipica;
    if (contrato?.tipo === "aberta") {
      const tabela = contrato.tabelaItem[ip.itemId] ?? 0;
      margemMelhor += (tabela - Math.min(...custos)) * ip.qtdTipica;
      margemPior += (tabela - Math.max(...custos)) * ip.qtdTipica;
    }
  }
  if (contrato?.tipo === "pacote") {
    return { tipo: "pacote" as const, teto: contrato.teto, complementoMaximo: comp, melhor: contrato.custoHospitalar + barato + comp, pior: contrato.custoHospitalar + caro + comp };
  }
  return { tipo: "aberta" as const, teto: undefined, complementoMaximo: comp, melhor: margemMelhor - comp, pior: margemPior - comp };
}

export type StatusRevisao = "ok" | "vencendo" | "vencida" | "sem_data";

/** Revisão do padrão: vencendo nos próximos 90 dias, vencida depois da data. */
export function statusRevisao(padrao: Padrao, hoje = new Date()): StatusRevisao {
  const data = padrao.revisaoEm;
  if (!data) return "sem_data";
  const dias = (new Date(`${data}T12:00:00`).getTime() - hoje.getTime()) / (24 * 3600 * 1000);
  if (Number.isNaN(dias)) return "sem_data";
  if (dias < 0) return "vencida";
  return dias <= 90 ? "vencendo" : "ok";
}

/** Efeito de aceitar uma sugestão, no pedido sugerido desta operadora. */
export function efeitoSugestao(padrao: Padrao, sug: SugestaoAlteracao, operadoraId: string, d: Dominio) {
  const numeros = (p: Padrao) => {
    const a = simular(p, operadoraId, d);
    // A pior marca do leque do item sugerido: é onde a troca costuma fazer diferença
    const ip = p.itens.find((i) => i.itemId === sug.itemId);
    const doLeque = d.marcas.filter((m) => ip?.aceitas.includes(m.id) && m.homologadaEm.includes(operadoraId));
    return {
      liberacaoDias: a.liberacaoDias,
      riscoGlosa: a.riscoGlosa,
      margem: a.hospital.margem,
      consumoTeto: a.hospital.consumoTeto,
      teto: a.hospital.teto,
      piorLiberacao: doLeque.length ? Math.max(...doLeque.map((m) => m.liberacaoDias)) : 0,
      piorGlosa: doLeque.length ? Math.max(...doLeque.map((m) => m.glosaPct)) : 0,
      piorCaso: faixaPadrao(p, operadoraId, d).pior,
    };
  };
  return { antes: numeros(padrao), depois: numeros({ ...padrao, itens: aplicarSugestao(padrao, sug) }) };
}
