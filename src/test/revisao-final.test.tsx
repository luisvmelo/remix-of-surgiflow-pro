import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, renderHook, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import type { ReactNode } from "react";
import { DominioProvider, useDominio } from "@/dominio/store";
import { DOMINIO_SEMENTE as D } from "@/dominio/dados";
import { equilibrio } from "@/gestao/analise";
import { sugestaoBenchmark } from "@/consultor/carteira";
import { desviosCobertos } from "@/dominio/motor";
import { avaliarPedido } from "@/dominio/motor";
import ComissaoTab from "@/components/gestao/ComissaoTab";
import RevisaoPedido from "@/compras/RevisaoPedido";

const wrapper = ({ children }: { children: ReactNode }) => <DominioProvider>{children}</DominioProvider>;
let ctx: ReturnType<typeof useDominio>;
const Sonda = () => {
  ctx = useDominio();
  return null;
};
beforeEach(() => localStorage.clear());

describe("revisão final — correções", () => {
  it("salvar um padrão vigente duas vezes não perde versões do histórico", () => {
    render(<DominioProvider><MemoryRouter><Sonda /><ComissaoTab abrir="artroscopia-joelho" /></MemoryRouter></DominioProvider>);
    fireEvent.change(screen.getByLabelText("Qtd. típica", { selector: "#qtd-canula" }), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar ajustes" }));
    expect(ctx.dominio.padroes["artroscopia-joelho"].versao).toBe(3);
    expect(screen.getByRole("button", { name: "Salvar ajustes" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Qtd. típica", { selector: "#qtd-canula" }), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar ajustes" }));
    expect(ctx.dominio.padroes["artroscopia-joelho"].historico.map((h) => h.versao)).toEqual([1, 2, 3, 4]);
  });

  it("um atalho numa operadora não tira do leque as marcas que ela não homologa", () => {
    const itens = equilibrio(D.padroes["artrodese-lombar"], "6", D, D.config, "equilibrio");
    const pp = itens.find((i) => i.itemId === "parafuso-pedicular")!;
    expect(pp.aceitas).toContain("pp-c"); // Globus: não homologado na Hapvida, mas aceito nas outras
  });

  it("o aceite fora do padrão cobre só os desvios aceitos: um desvio novo volta a bloquear", () => {
    const { result } = renderHook(() => useDominio(), { wrapper });
    act(() => result.current.aceitarForaPadrao("p3", "Osteopenia", ["parafuso-pedicular:pp-c", "enxerto:en-b"]));
    let p3 = result.current.pedidos.find((p) => p.id === "p3")!;
    expect(desviosCobertos(p3, avaliarPedido(p3, result.current.dominio))).toBe(true);
    act(() => result.current.atualizarPedido("p3", { itens: p3.itens.map((i) => (i.itemId === "cage" ? { ...i, marcaId: "ca-d" } : i)) }));
    p3 = result.current.pedidos.find((p) => p.id === "p3")!;
    expect(desviosCobertos(p3, avaliarPedido(p3, result.current.dominio))).toBe(false);
  });

  it("na tela de Compras, o desvio novo depois do aceite bloqueia o Confirmar", () => {
    render(
      <DominioProvider>
        <MemoryRouter initialEntries={["/revisao/p3"]}>
          <Sonda />
          <Routes><Route path="/revisao/:id" element={<RevisaoPedido />} /></Routes>
        </MemoryRouter>
      </DominioProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Aceitar fora do padrão" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Motivo do aceite" }), { target: { value: "Osteopenia" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar aceite" }));
    expect(screen.getByRole("button", { name: "Confirmar pedido" })).toBeEnabled();
    const p3 = ctx.pedidos.find((p) => p.id === "p3")!;
    act(() => ctx.atualizarPedido("p3", { itens: p3.itens.map((i) => (i.itemId === "cage" ? { ...i, marcaId: "ca-d" } : i)) }));
    expect(screen.getByRole("button", { name: "Confirmar pedido" })).toBeDisabled();
  });

  it("aceitar uma sugestão num pré-modelo não aprova o padrão", () => {
    const { result } = renderHook(() => useDominio(), { wrapper });
    const lca = result.current.dominio.padroes.lca;
    const marca = D.marcas.find((m) => m.itemId === lca.itens[0].itemId && !lca.itens[0].aceitas.includes(m.id))!;
    act(() => result.current.salvarPadrao({ ...lca, sugestoes: [{ id: "s-x", titulo: "x", motivo: "y", tipo: "trocar_marca", itemId: lca.itens[0].itemId, para: marca.id, antes: "-", depois: "-" }] }));
    act(() => result.current.aceitarSugestao("lca", "s-x"));
    const depois = result.current.dominio.padroes.lca;
    expect(depois.status).toBe("em_ajuste");
    expect(depois.versao).toBe(0);
    expect(depois.itens[0].aceitas).toContain(marca.id);
  });

  it("sugestão de benchmark 'como preferencial' mantém a preferencial antiga no leque", () => {
    const { result } = renderHook(() => useDominio(), { wrapper });
    const sug = sugestaoBenchmark(result.current.dominio, "sjr", "artroscopia-joelho", "lamina-shaver", "ls-c");
    expect(sug.tipo).toBe("tornar_preferencial");
    const pad = result.current.dominio.padroes["artroscopia-joelho"];
    act(() => result.current.salvarPadrao({ ...pad, sugestoes: [...pad.sugestoes, sug] }));
    act(() => result.current.aceitarSugestao("artroscopia-joelho", sug.id));
    const item = result.current.dominio.padroes["artroscopia-joelho"].itens.find((i) => i.itemId === "lamina-shaver")!;
    expect(item.preferenciais[0]).toBe("ls-c");
    expect(item.aceitas).toEqual(expect.arrayContaining(["ls-a", "ls-c"]));
  });
});
