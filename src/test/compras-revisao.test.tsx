import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { DominioProvider, useDominio } from "@/dominio/store";
import { leque } from "@/dominio/motor";
import FilaRevisao from "@/compras/FilaRevisao";
import RevisaoPedido from "@/compras/RevisaoPedido";

let ctx: ReturnType<typeof useDominio>;
const Sonda = () => {
  ctx = useDominio();
  return null;
};

const renderEm = (rota: string) =>
  render(
    <DominioProvider>
      <MemoryRouter initialEntries={[rota]}>
        <Sonda />
        <Routes>
          <Route path="/revisao" element={<FilaRevisao />} />
          <Route path="/revisao/:id" element={<RevisaoPedido />} />
        </Routes>
      </MemoryRouter>
    </DominioProvider>,
  );

beforeEach(() => localStorage.clear());

describe("Compras — fila de revisão", () => {
  it("lista só os pedidos esperando confirmação", () => {
    renderEm("/revisao");
    const esperando = ctx.pedidos.filter((p) => p.status === "esperando_confirmacao");
    expect(screen.getAllByRole("article")).toHaveLength(esperando.length);
    expect(screen.getByText("Ana Paula Ferreira")).toBeInTheDocument();
    expect(screen.queryByText("João Carlos Silva")).toBeNull(); // confirmado
  });
});

describe("Compras — revisão do pedido", () => {
  it("a troca de marca só oferece marcas do leque da operadora", () => {
    renderEm("/revisao/p2");
    const p2 = ctx.pedidos.find((p) => p.id === "p2")!;
    const l = leque(ctx.dominio.padroes[p2.procedimentoId], p2.operadoraId, ctx.dominio).find((x) => x.itemId === "parafuso-pedicular")!;
    const select = screen.getByRole("combobox", { name: "Trocar marca: Parafuso pedicular poliaxial" });
    const opcoes = within(select).getAllByRole("option").map((o) => (o as HTMLOptionElement).value);
    expect(opcoes.sort()).toEqual(l.aceitas.map((m) => m.id).sort());
    fireEvent.change(select, { target: { value: l.aceitas.at(-1)!.id } });
    expect(ctx.pedidos.find((p) => p.id === "p2")!.itens.find((i) => i.itemId === "parafuso-pedicular")!.marcaId).toBe(l.aceitas.at(-1)!.id);
  });

  it("pedir ajuste com item e motivo vai para o store (e sem motivo não envia)", () => {
    renderEm("/revisao/p2");
    fireEvent.click(screen.getByRole("button", { name: "Pedir ajuste" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Item do ajuste" }), { target: { value: "cage" } });
    const enviar = screen.getByRole("button", { name: "Enviar ajuste" });
    expect(enviar).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox", { name: "Motivo do ajuste" }), { target: { value: "Cage sem estoque no fornecedor" } });
    fireEvent.click(enviar);
    const p2 = ctx.pedidos.find((p) => p.id === "p2")!;
    expect(p2.ajustes.at(-1)).toEqual(expect.objectContaining({ itemId: "cage", motivo: "Cage sem estoque no fornecedor", resolvido: false }));
  });

  it("confirmar fica bloqueado enquanto há item fora do padrão sem aceite; aceitar alimenta a comissão", () => {
    renderEm("/revisao/p3");
    const confirmar = screen.getByRole("button", { name: "Confirmar pedido" });
    expect(confirmar).toBeDisabled();
    const sugestoesAntes = ctx.dominio.padroes["artrodese-lombar"].sugestoes.length;

    fireEvent.click(screen.getByRole("button", { name: "Aceitar fora do padrão" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Motivo do aceite" }), { target: { value: "Osteopenia: enxerto indicado" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar aceite" }));

    expect(ctx.pedidos.find((p) => p.id === "p3")!.aceitoForaPadrao?.motivo).toBe("Osteopenia: enxerto indicado");
    expect(ctx.dominio.padroes["artrodese-lombar"].sugestoes.length).toBeGreaterThan(sugestoesAntes);

    fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));
    expect(ctx.pedidos.find((p) => p.id === "p3")!.status).toBe("confirmado");
  });
});
