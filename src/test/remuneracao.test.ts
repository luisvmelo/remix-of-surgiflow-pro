import { describe, it, expect } from "vitest";
import {
  calcularGuia, complementarItem, defaultHospitalConfig, escolherEquilibrio, honorarioPrincipal,
  type HospitalConfig,
} from "@/lib/remuneracao";

const cfg = (partial: Partial<HospitalConfig> = {}): HospitalConfig => ({ ...defaultHospitalConfig, ...partial });

describe("honorário base", () => {
  it("varia conforme operadora e nível do plano", () => {
    // Artroscopia: Unimed Executivo paga a referência; Hapvida Básico paga ~15%
    expect(honorarioPrincipal("30725119", "1", "Executivo")).toBe(14000);
    expect(honorarioPrincipal("30725119", "6", "Básico")).toBe(2100);
  });
});

describe("honorário complementar", () => {
  it("faixa A repassa a proporção cheia do ganho", () => {
    // Cânula: ganho 260, faixa A, proporção 30% → 78
    expect(complementarItem("Cânula Artroscópica 7mm", 1, cfg())).toBe(78);
  });

  it("faixa B repassa metade e faixa C nada", () => {
    expect(complementarItem("Fio de Alta Resistência #2", 2, cfg())).toBe(45); // 300 × 30% × 50%
    expect(complementarItem("Placa LCP 3.5mm Distal Radius", 1, cfg())).toBe(0);
  });

  it("é zero quando a rentabilidade está desligada ou o item dá prejuízo", () => {
    expect(complementarItem("Cânula Artroscópica 7mm", 1, cfg({ rentabilidadeHabilitada: false }))).toBe(0);
    expect(complementarItem("Âncora Bio-Compósita 5.5mm", 1, cfg({ fatorFaixa: { A: 100, B: 100, C: 100 } }))).toBe(0);
  });
});

describe("calcularGuia", () => {
  it("o complementar sai da margem do hospital", () => {
    const c = calcularGuia(
      {
        procedimentoCode: "30725119", operadoraId: "1", nivel: "Executivo",
        vinculados: ["30725020"],
        itens: [{ name: "Cânula Artroscópica 7mm", quantity: 1 }],
      },
      cfg(),
    );
    expect(c.honorarioBase).toBe(14000 + 3200);
    expect(c.honorarioComplementar).toBe(78);
    expect(c.honorarioTotal).toBe(17278);
    expect(c.ganhoBrutoHospital).toBe(820 + 260);
    expect(c.margemHospital).toBe(820 + 260 - 78);
  });
});

describe("escolherEquilibrio", () => {
  it("prefere a opção intermediária que melhora os dois lados", () => {
    const opcoes = [
      { id: "x", hospital: 1000, medico: 0 },
      { id: "y", hospital: 722, medico: 128 },
      { id: "z", hospital: 490, medico: 210 },
    ];
    expect(escolherEquilibrio(opcoes, 0.3)).toBe("y");
  });
});
