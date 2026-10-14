import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { DominioProvider, useDominio } from "@/dominio/store";
import { Carteira, Benchmark, Comercial } from "@/consultor/ConsultorHome";

let ctx: ReturnType<typeof useDominio>;
const Sonda = () => {
  ctx = useDominio();
  return null;
};
const renderCom = (ui: ReactNode) =>
  render(
    <DominioProvider>
      <MemoryRouter>
        <Sonda />
        {ui}
      </MemoryRouter>
    </DominioProvider>,
  );

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});
beforeEach(() => localStorage.clear());

describe("Consultor", () => {
  it("a carteira mostra os 3 hospitais com a fase de cada um", () => {
    renderCom(<Carteira />);
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByText("Maturidade")).toBeInTheDocument();
    expect(screen.getByText("Acompanhamento")).toBeInTheDocument();
    expect(screen.getByText("Implantação")).toBeInTheDocument();
  });

  it("o benchmark leva a escolha de outro hospital para a comissão do RHP, sem duplicar", () => {
    renderCom(<Benchmark />);
    const antes = ctx.dominio.padroes["artroscopia-joelho"].sugestoes.length;
    const botao = screen.getByRole("button", { name: "Sugerir ao RHP: Stryker em Lâmina de shaver" });
    fireEvent.click(botao);
    fireEvent.click(botao);
    const sugestoes = ctx.dominio.padroes["artroscopia-joelho"].sugestoes;
    expect(sugestoes.length).toBe(antes + 1);
    expect(sugestoes.at(-1)).toEqual(expect.objectContaining({ itemId: "lamina-shaver", para: "ls-c", de: "ls-a" }));
  });

  it("o comercial mostra o taxímetro de cada hospital", () => {
    renderCom(<Comercial />);
    expect(screen.getAllByText(/Taxímetro/).length).toBeGreaterThan(0);
    expect(screen.getByRole("table", { name: "Valores por mês" })).toBeInTheDocument();
  });
});
