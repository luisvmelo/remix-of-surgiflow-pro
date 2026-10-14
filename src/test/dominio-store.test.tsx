import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { DominioProvider, useDominio, CHAVE_STORAGE } from "@/dominio/store";

const wrapper = ({ children }: { children: ReactNode }) => <DominioProvider>{children}</DominioProvider>;

describe("store do domínio", () => {
  beforeEach(() => localStorage.clear());

  it("começa com os pedidos de exemplo", () => {
    const { result } = renderHook(() => useDominio(), { wrapper });
    expect(result.current.pedidos.length).toBeGreaterThan(5);
  });

  it("criar, mudar status e pedir ajuste refletem no estado", () => {
    const { result } = renderHook(() => useDominio(), { wrapper });
    let id = "";
    act(() => {
      id = result.current.criarPedido({
        medicoId: "1", paciente: { nome: "Novo", cpf: "1" }, operadoraId: "4", plano: "Especial",
        procedimentoId: "artrodese-lombar", codigos: [], itens: [], documentos: [], urgencia: false, dataCirurgia: "2026-12-01",
      });
    });
    expect(result.current.pedidos.find((p) => p.id === id)?.status).toBe("rascunho");
    act(() => result.current.mudarStatus(id, "esperando_confirmacao"));
    act(() => result.current.pedirAjuste(id, "Trocar parafuso", "parafuso-pedicular"));
    const p = result.current.pedidos.find((x) => x.id === id)!;
    expect(p.status).toBe("esperando_confirmacao");
    expect(p.ajustes).toEqual([expect.objectContaining({ motivo: "Trocar parafuso", resolvido: false })]);
    act(() => result.current.resolverAjustes(id));
    expect(result.current.pedidos.find((x) => x.id === id)!.ajustes.every((a) => a.resolvido)).toBe(true);
  });

  it("aceitar uma sugestão de alteração cria nova versão do padrão e aplica a troca", () => {
    const { result } = renderHook(() => useDominio(), { wrapper });
    const antes = result.current.dominio.padroes.angioplastia;
    act(() => result.current.aceitarSugestao("angioplastia", "s-ang-1"));
    const depois = result.current.dominio.padroes.angioplastia;
    expect(depois.versao).toBe(antes.versao + 1);
    expect(depois.sugestoes.find((s) => s.id === "s-ang-1")).toBeUndefined();
    const stent = depois.itens.find((i) => i.itemId === "stent")!;
    expect(stent.aceitas).not.toContain("st-e");
    expect(stent.aceitas).toContain("st-d");
    expect(depois.historico.at(-1)?.versao).toBe(depois.versao);
  });

  it("localStorage com dados corrompidos não quebra: volta aos dados de exemplo", () => {
    localStorage.setItem(CHAVE_STORAGE, "{isso não é json");
    const { result } = renderHook(() => useDominio(), { wrapper });
    expect(result.current.pedidos.length).toBeGreaterThan(5);
  });
});
