// ============================================================
// REMUNERAÇÃO — honorário médico x rentabilidade do hospital
// Fonte única de cálculo usada pelo wizard, telas do médico e tela do hospital.
// ============================================================

import { mockLinkedProcedures } from "./mockData";

export type Faixa = "A" | "B" | "C";
export type NivelPlano = "Básico" | "Especial" | "Executivo";

export const niveisPlano: NivelPlano[] = ["Básico", "Especial", "Executivo"];

export const faixaDescricao: Record<Faixa, string> = {
  A: "Padronizado pelo hospital",
  B: "Alternativa aceita",
  C: "Fora da padronização",
};

// ── Configuração definida pelo hospital ──────────────────────────
export interface HospitalConfig {
  /** Desligado: sem honorário complementar e sem otimização por rentabilidade. */
  rentabilidadeHabilitada: boolean;
  /** % máxima do ganho extra de cada escolha que vira honorário do médico (0–60). */
  proporcaoMedico: number;
  /** Quanto da proporção cada faixa de MatMed recebe (0–100%). */
  fatorFaixa: Record<Faixa, number>;
}

export const defaultHospitalConfig: HospitalConfig = {
  rentabilidadeHabilitada: true,
  proporcaoMedico: 30,
  fatorFaixa: { A: 100, B: 50, C: 0 },
};

// ── Honorário base: procedimento × operadora × nível do plano ────
// Valor de referência (o plano que melhor paga) por procedimento principal.
export const honorarioReferenciaPrincipal: Record<string, number> = {
  "30725119": 14000, // Artroscopia de Joelho — Meniscectomia
  "30715016": 9500,  // Fratura de punho
  "30725097": 16000, // Reconstrução de LCA
  "30725080": 12500, // Osteossíntese de platô tibial
  "30725038": 13000, // Artroscopia de Ombro — Reparo do manguito
  "30725060": 18000, // Artroplastia total de quadril
};

// Procedimentos secundários também geram honorário para o cirurgião.
export const honorarioReferenciaVinculado: Record<string, number> = {
  "30725020": 3200, // Condroplastia artroscópica
  "30715024": 2400, // Sinovectomia parcial
  "30725038": 1800, // Desbridamento articular
  "31003079": 0,    // Bloqueio anestésico — honorário do anestesista
  "30725045": 2100, // Capsulotomia artroscópica
  "30725052": 1600, // Liberação de retináculo lateral
};

// Quanto cada operadora/nível paga em relação à referência.
export const fatorPlanoTabela: Record<string, Record<NivelPlano, number>> = {
  "1": { Básico: 0.4, Especial: 0.65, Executivo: 1 },      // Unimed
  "2": { Básico: 0.45, Especial: 0.7, Executivo: 0.95 },   // Bradesco Saúde
  "3": { Básico: 0.35, Especial: 0.55, Executivo: 0.85 },  // Amil
  "4": { Básico: 0.45, Especial: 0.75, Executivo: 1 },     // SulAmérica
  "5": { Básico: 0.4, Especial: 0.65, Executivo: 0.9 },    // Porto Seguro
  "6": { Básico: 0.15, Especial: 0.2, Executivo: 0.28 },   // Hapvida NotreDame
};

export const fatorPlano = (operadoraId?: string | null, nivel?: NivelPlano | null) =>
  fatorPlanoTabela[operadoraId || ""]?.[nivel || "Especial"] ?? 0.6;

const arredondar = (v: number) => Math.round(v / 10) * 10;

export const honorarioPrincipal = (code?: string | null, operadoraId?: string | null, nivel?: NivelPlano | null) =>
  arredondar((honorarioReferenciaPrincipal[code || ""] ?? 10000) * fatorPlano(operadoraId, nivel));

export const honorarioVinculado = (code: string, operadoraId?: string | null, nivel?: NivelPlano | null) =>
  arredondar((honorarioReferenciaVinculado[code] ?? 0) * fatorPlano(operadoraId, nivel));

// ── MatMed: ganho por unidade para o hospital e faixa ────────────
export interface MatMedInfo {
  ganho: number;
  faixa: Faixa;
}

export const catalogoMatMed: Record<string, MatMedInfo> = {
  "Placa LCP 3.5mm Distal Radius": { ganho: 900, faixa: "C" },
  "Placa VA-LCP 3.5mm": { ganho: 600, faixa: "A" },
  "Parafuso Bloqueado 3.5x28mm": { ganho: 120, faixa: "A" },
  "Âncora Bio-Compósita 5.5mm": { ganho: -340, faixa: "C" },
  "Âncora PEEK 5.5mm": { ganho: 450, faixa: "A" },
  "K-Wire 1.6mm": { ganho: 40, faixa: "A" },
  "Cânula Artroscópica 7mm": { ganho: 260, faixa: "A" },
  "Lâmina Shaver Agressiva": { ganho: -80, faixa: "C" },
  "Implante Interferencial Titânio 7x23": { ganho: -520, faixa: "C" },
  "Implante Interferencial PEEK 7x23": { ganho: 320, faixa: "A" },
  "Fio de Alta Resistência #2": { ganho: 150, faixa: "B" },
};

/** Trocas por equivalente técnico conhecidas (original → alternativa). */
export const equivalencias: { original: string; alternativa: string }[] = [
  { original: "Placa LCP 3.5mm Distal Radius", alternativa: "Placa VA-LCP 3.5mm" },
  { original: "Âncora Bio-Compósita 5.5mm", alternativa: "Âncora PEEK 5.5mm" },
  { original: "Implante Interferencial Titânio 7x23", alternativa: "Implante Interferencial PEEK 7x23" },
];

export const infoMatMed = (name: string): MatMedInfo | undefined => catalogoMatMed[name];

/** Honorário complementar (pago pelo hospital) por escolher este item. */
export const complementarItem = (name: string, quantity: number, config: HospitalConfig) => {
  const info = infoMatMed(name);
  if (!info || !config.rentabilidadeHabilitada || info.ganho <= 0) return 0;
  return Math.round(info.ganho * quantity * (config.proporcaoMedico / 100) * (config.fatorFaixa[info.faixa] / 100));
};

/** Ganho bruto do hospital com o item, antes de pagar o complementar. */
export const ganhoItem = (name: string, quantity: number) => (infoMatMed(name)?.ganho ?? 0) * quantity;

export const ganhoProcedimentoVinculado = (code: string) => {
  const proc = mockLinkedProcedures.find((p) => p.code === code);
  return proc ? parseInt(proc.rentabilityDelta.replace(/[^\d-]/g, "")) || 0 : 0;
};

// ── Cálculo de uma guia ──────────────────────────────────────────
export interface GuiaInput {
  procedimentoCode?: string | null;
  operadoraId?: string | null;
  nivel?: NivelPlano | null;
  vinculados: string[];
  itens: { name: string; quantity: number }[];
}

export interface GuiaCalculo {
  honorarioPrincipal: number;
  honorarioVinculados: number;
  honorarioBase: number;
  honorarioComplementar: number;
  honorarioTotal: number;
  ganhoBrutoHospital: number;
  margemHospital: number;
}

export const calcularGuia = (input: GuiaInput, config: HospitalConfig): GuiaCalculo => {
  const hPrincipal = honorarioPrincipal(input.procedimentoCode, input.operadoraId, input.nivel);
  const hVinculados = input.vinculados.reduce(
    (acc, code) => acc + honorarioVinculado(code, input.operadoraId, input.nivel), 0,
  );
  const complementar = input.itens.reduce((acc, i) => acc + complementarItem(i.name, i.quantity, config), 0);
  const ganhoBruto =
    input.vinculados.reduce((acc, code) => acc + ganhoProcedimentoVinculado(code), 0) +
    input.itens.reduce((acc, i) => acc + ganhoItem(i.name, i.quantity), 0);

  return {
    honorarioPrincipal: hPrincipal,
    honorarioVinculados: hVinculados,
    honorarioBase: hPrincipal + hVinculados,
    honorarioComplementar: complementar,
    honorarioTotal: hPrincipal + hVinculados + complementar,
    ganhoBrutoHospital: ganhoBruto,
    margemHospital: ganhoBruto - complementar,
  };
};

// ── Equilíbrio (barganha de Nash ponderada) ──────────────────────
export interface Opcao {
  id: string;
  hospital: number;
  medico: number;
}

/**
 * Escolhe a opção que maximiza (ganho hospital)^(1−w) × (ganho médico)^w,
 * medindo cada ganho a partir do pior resultado de cada lado entre as opções.
 * w = proporção do médico: o hospital pesa mais por ser a fonte pagadora.
 */
export const escolherEquilibrio = (opcoes: Opcao[], pesoMedico: number): string | undefined => {
  if (opcoes.length === 0) return undefined;
  const w = Math.min(0.99, Math.max(0.01, pesoMedico));
  const hMin = Math.min(...opcoes.map((o) => o.hospital));
  const mMin = Math.min(...opcoes.map((o) => o.medico));
  let melhor = opcoes[0];
  let melhorScore = -1;
  for (const o of opcoes) {
    const score = Math.pow(o.hospital - hMin, 1 - w) * Math.pow(o.medico - mMin, w);
    if (score > melhorScore) {
      melhor = o;
      melhorScore = score;
    }
  }
  // Sem ponto interior: fica com a de maior soma.
  if (melhorScore <= 0) {
    melhor = opcoes.reduce((a, b) => (b.hospital + b.medico > a.hospital + a.medico ? b : a));
  }
  return melhor.id;
};

// ── Formatação ───────────────────────────────────────────────────
export const brl = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;
export const brlDelta = (v: number) => `${v >= 0 ? "+" : "−"}R$ ${Math.abs(Math.round(v)).toLocaleString("pt-BR")}`;
