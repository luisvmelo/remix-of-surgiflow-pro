import { describe, it, expect } from "vitest";
import { DOMINIO_SEMENTE } from "@/dominio/dados";
import { gerarHistorico } from "@/gestao/historico";
import {
  avaliar, indicadores, recorte, foraDoPadrao, previsibilidade, equilibrio, serieMensal, balanceamento,
} from "@/gestao/analise";

const D = DOMINIO_SEMENTE;

describe("histórico de exemplo", () => {
  it("é determinístico e só tem cirurgias confirmadas", () => {
    const h1 = gerarHistorico(D);
    const h2 = gerarHistorico(D);
    expect(h1.length).toBe(h2.length);
    expect(h1.length).toBeGreaterThan(100);
    expect(h1[0]).toEqual(h2[0]);
    expect(h1.every((p) => p.status === "confirmado")).toBe(true);
  });

  it("a adesão ao padrão melhora ao longo dos meses", () => {
    const serie = serieMensal(avaliar(gerarHistorico(D), D));
    expect(serie.at(-1)!.dentroPadraoPct).toBeGreaterThan(serie[0].dentroPadraoPct);
  });
});

describe("análises da gestão", () => {
  const regs = avaliar(gerarHistorico(D), D);

  it("indicadores em faixas válidas", () => {
    const i = indicadores(regs);
    expect(i.dentroPadraoPct).toBeGreaterThanOrEqual(0);
    expect(i.dentroPadraoPct).toBeLessThanOrEqual(100);
    expect(i.glosaMediaPct).toBeGreaterThanOrEqual(0);
    expect(i.liberacaoMediaDias).toBeGreaterThan(0);
  });

  it("recorte por operadora tem uma linha por operadora presente", () => {
    const linhas = recorte(regs, D, "operadora");
    const presentes = new Set(regs.map((r) => r.pedido.operadoraId));
    expect(linhas.length).toBe(presentes.size);
  });

  it("o BI de fora do padrão só lista marcas fora do leque ou não homologadas", () => {
    for (const f of foraDoPadrao(regs, D)) {
      const ocorrencias = regs.filter((r) => r.a.foraPadrao.includes(f.marcaId) || r.a.naoHomologados.includes(f.marcaId) || r.pedido.itens.some((i) => i.marcaId === f.marcaId && r.a.foraProtocolo.includes(i.itemId)));
      expect(ocorrencias.length).toBe(f.vezes);
    }
  });

  it("balanceamento tem um ponto por procedimento com histórico", () => {
    const pontos = balanceamento(regs, D);
    expect(pontos.length).toBe(new Set(regs.map((r) => r.pedido.procedimentoId)).size);
  });
});

describe("previsibilidade e equilíbrio", () => {
  it("previsibilidade marca 'sem contrato' quando a operadora não tem contrato", () => {
    const semContratos = { ...D, contratosOperadora: D.contratosOperadora.filter((c) => c.procedimentoId !== "tavi") };
    const linha = previsibilidade(semContratos, "4", "Especial").find((l) => l.procedimentoId === "tavi")!;
    expect(linha.semContrato).toBe(true);
  });

  it("com 'considerar margem' desligado, o peso da margem é ignorado", () => {
    const padrao = D.padroes["artrodese-lombar"];
    const semMargem = { considerarMargem: false, pesos: { liberacao: 50, glosa: 50, margem: 100 } };
    const pesoZero = { considerarMargem: true, pesos: { liberacao: 50, glosa: 50, margem: 0 } };
    expect(equilibrio(padrao, "4", D, semMargem, "equilibrio")).toEqual(equilibrio(padrao, "4", D, pesoZero, "equilibrio"));
  });

  it("'mais rápido' deixa como preferencial a marca de menor liberação de cada item", () => {
    const itens = equilibrio(D.padroes["artrodese-lombar"], "4", D, { considerarMargem: true, pesos: { liberacao: 1, glosa: 1, margem: 1 } }, "rapido");
    for (const ip of itens) {
      const homologadas = D.marcas.filter((m) => m.itemId === ip.itemId && m.homologadaEm.includes("4"));
      const menor = Math.min(...homologadas.map((m) => m.liberacaoDias));
      expect(D.marcas.find((m) => m.id === ip.preferenciais[0])!.liberacaoDias).toBe(menor);
    }
  });
});
