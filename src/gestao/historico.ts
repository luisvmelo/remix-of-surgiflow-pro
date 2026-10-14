// ============================================================
// GESTÃO — histórico de exemplo (abr–set/2026), gerado de forma determinística.
// A adesão ao padrão cresce mês a mês, como num hospital que implantou a plataforma em abril.
// ============================================================

import { pedidoSugerido } from "@/dominio/motor";
import type { Dominio, NivelPlano, Pedido } from "@/dominio/tipos";

export type PedidoHistorico = Pedido & { tempoCirurgiaMin: number };

const MESES = ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"];
const POR_MES = [26, 28, 29, 31, 32, 34];
const PESO_MEDICO: [string, number][] = [["1", 40], ["7", 20], ["3", 15], ["4", 15], ["2", 10]];
const PESO_OPERADORA: [string, number][] = [["1", 22], ["4", 20], ["2", 18], ["3", 14], ["5", 12], ["6", 14]];
const PESO_PLANO: [NivelPlano, number][] = [["Básico", 30], ["Especial", 45], ["Executivo", 25]];
const PACIENTES = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabriela", "Hugo", "Isabela", "João", "Karen", "Lucas", "Marta", "Nilo", "Olga", "Pedro"];
const SOBRENOMES = ["Silva", "Souza", "Lima", "Costa", "Rocha", "Alves", "Pereira", "Gomes", "Barros", "Melo"];

/** Gerador pseudoaleatório com semente (mulberry32): sempre o mesmo histórico. */
function prng(semente: number) {
  let a = semente;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sortearPeso<T>(r: () => number, opcoes: [T, number][]): T {
  const total = opcoes.reduce((a, [, p]) => a + p, 0);
  let alvo = r() * total;
  for (const [v, p] of opcoes) {
    alvo -= p;
    if (alvo <= 0) return v;
  }
  return opcoes[opcoes.length - 1][0];
}

const sortear = <T,>(r: () => number, lista: T[]): T => lista[Math.floor(r() * lista.length)];

export function gerarHistorico(d: Dominio): PedidoHistorico[] {
  const r = prng(42);
  const historico: PedidoHistorico[] = [];
  let n = 0;
  MESES.forEach((mes, idx) => {
    // Chance de o pedido sair do padrão: 60% em abril, 15% em setembro
    const chanceFora = 0.6 - (0.45 * idx) / (MESES.length - 1);
    for (let k = 0; k < POR_MES[idx]; k++) {
      const medicoId = sortearPeso(r, PESO_MEDICO);
      const contrato = d.contratosMedico.find((c) => c.medicoId === medicoId);
      if (!contrato || contrato.procedimentos.length === 0) continue;
      const procedimentoId = sortear(r, contrato.procedimentos);
      const padrao = d.padroes[procedimentoId];
      const proc = d.procedimentos.find((p) => p.id === procedimentoId);
      if (!padrao || !proc) continue;
      const operadoraId = sortearPeso(r, PESO_OPERADORA);
      const plano = sortearPeso(r, PESO_PLANO);
      const sugerido = pedidoSugerido(procedimentoId, operadoraId, d);
      // Dentro do leque os médicos também variam a marca (35% das vezes), sem sair do padrão
      let itens = sugerido.itens.map((i) => {
        const ip = padrao.itens.find((x) => x.itemId === i.itemId);
        const outras = d.marcas.filter((m) => ip?.aceitas.includes(m.id) && m.homologadaEm.includes(operadoraId) && m.id !== i.marcaId);
        return outras.length && r() < 0.35 ? { ...i, marcaId: sortear(r, outras).id } : i;
      });
      let codigos = [...sugerido.codigos];

      if (r() < chanceFora && itens.length > 0) {
        const tipo = r();
        if (tipo < 0.5) {
          // Troca uma marca por outra fora do leque
          const alvo = sortear(r, itens);
          const ip = padrao.itens.find((i) => i.itemId === alvo.itemId);
          const fora = d.marcas.filter((m) => m.itemId === alvo.itemId && !ip?.aceitas.includes(m.id));
          if (fora.length) itens = itens.map((i) => (i === alvo ? { ...i, marcaId: sortear(r, fora).id } : i));
        } else if (tipo < 0.8) {
          // Pede um item que o protocolo não prevê
          const candidatos = padrao.pedidosPorFora.length ? padrao.pedidosPorFora.map((p) => p.itemId) : d.itens.map((i) => i.id).filter((id) => !padrao.itens.some((x) => x.itemId === id));
          const itemId = sortear(r, candidatos);
          const marca = sortear(r, d.marcas.filter((m) => m.itemId === itemId));
          if (marca) itens = [...itens, { itemId, marcaId: marca.id, qtd: 1 }];
        } else if (padrao.codigosAlerta.length) {
          codigos = [padrao.codigosAlerta[0].codigo];
        }
      }

      const dia = String(1 + Math.floor(r() * 27)).padStart(2, "0");
      const deltaMarcas = itens.reduce((acc, i) => acc + (d.marcas.find((m) => m.id === i.marcaId)?.tempoCirurgiaDeltaMin ?? 0), 0);
      const docs = r() < 0.9 ? [...padrao.protocolo.documentos] : padrao.protocolo.documentos.slice(0, -1);
      historico.push({
        id: `h-${++n}`,
        medicoId,
        paciente: { nome: `${sortear(r, PACIENTES)} ${sortear(r, SOBRENOMES)}`, cpf: "***" },
        operadoraId,
        plano,
        procedimentoId,
        codigos,
        itens,
        documentos: docs,
        status: "confirmado",
        ajustes: [],
        urgencia: r() < 0.1,
        criadoEm: `${mes}-01`,
        dataCirurgia: `${mes}-${dia}`,
        tempoCirurgiaMin: Math.max(20, proc.tempoCirurgiaMin + deltaMarcas + Math.round((r() - 0.5) * 20)),
      });
    }
  });
  return historico;
}
