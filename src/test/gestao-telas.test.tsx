import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { DominioProvider, useDominio } from "@/dominio/store";
import ComissaoTab from "@/components/gestao/ComissaoTab";
import ContratosTab from "@/components/gestao/ContratosTab";
import GestaoHome from "@/components/gestao/GestaoHome";

let dominio: ReturnType<typeof useDominio>["dominio"];
const Sonda = () => {
  dominio = useDominio().dominio;
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
  // Recharts mede o contêiner com ResizeObserver
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

beforeEach(() => localStorage.clear());

describe("Comissão", () => {
  it("abrir um pré-modelo da IA e aprovar vira a versão 1 vigente", () => {
    renderCom(<ComissaoTab />);
    expect(dominio.padroes.lca.status).toBe("pre_modelo");
    fireEvent.click(screen.getByRole("button", { name: /Reconstrução de LCA/ }));
    fireEvent.click(screen.getByRole("button", { name: "Aprovar padrão" }));
    expect(dominio.padroes.lca.status).toBe("vigente");
    expect(dominio.padroes.lca.versao).toBe(1);
    expect(screen.getAllByText(/v1/).length).toBeGreaterThan(0);
  });

  it("marcar uma marca como preferencial a torna aceita também", () => {
    renderCom(<ComissaoTab />);
    fireEvent.click(screen.getByRole("button", { name: /Reconstrução de LCA/ }));
    fireEvent.click(screen.getByRole("button", { name: /Direcionar/ }));
    const item = dominio.padroes.lca.itens[0];
    const naoAceita = dominio.marcas.find((m) => m.itemId === item.itemId && !item.aceitas.includes(m.id))!;
    fireEvent.click(screen.getByRole("checkbox", { name: `Preferencial: ${naoAceita.fabricante} (${item.itemId})` }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar ajustes" }));
    const salvo = dominio.padroes.lca.itens[0];
    expect(salvo.preferenciais).toContain(naoAceita.id);
    expect(salvo.aceitas).toContain(naoAceita.id);
  });
});

describe("Contratos", () => {
  it("desligar 'participa do complemento' de um médico vai para o store", () => {
    renderCom(<ContratosTab />);
    expect(dominio.contratosMedico.find((c) => c.medicoId === "1")!.participaComplemento).toBe(true);
    fireEvent.click(screen.getByRole("switch", { name: "Participa do complemento: Dr. Ricardo Almeida" }));
    expect(dominio.contratosMedico.find((c) => c.medicoId === "1")!.participaComplemento).toBe(false);
  });

  it("a tabela de previsibilidade mostra 'sem contrato' sem quebrar", () => {
    renderCom(<ContratosTab />);
    expect(screen.getByRole("table", { name: "Tabela de previsibilidade" })).toBeInTheDocument();
  });
});

describe("Home da gestão", () => {
  it("o seletor de recorte troca as linhas e a comparação só aparece com 2 ou 3 selecionados", () => {
    renderCom(<GestaoHome />);
    fireEvent.click(screen.getByRole("button", { name: "Operadora" }));
    const tabela = screen.getByRole("table", { name: "Recorte por operadora" });
    expect(within(tabela).getByText("Hapvida NotreDame")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: "Comparar Unimed" }));
    expect(screen.queryByRole("region", { name: "Comparação" })).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "Comparar SulAmérica" }));
    expect(screen.getByRole("region", { name: "Comparação" })).toBeInTheDocument();
  });
});
