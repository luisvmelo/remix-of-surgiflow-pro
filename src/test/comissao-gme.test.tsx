import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DominioProvider, useDominio } from "@/dominio/store";
import { DOMINIO_SEMENTE as D } from "@/dominio/dados";
import { aplicarSugestao } from "@/dominio/motor";
import { gerarHistorico } from "@/gestao/historico";
import { avaliar } from "@/gestao/analise";
import { efeitoSugestao, explicacaoIA, faixaPadrao, ganhoPossivel, previaComplemento, statusRevisao } from "@/gestao/comissao";
import ComissaoTab from "@/components/gestao/ComissaoTab";

const regs = avaliar(gerarHistorico(D), D);

describe("funções da comissão", () => {
  it("ganho possível nunca é negativo e existe em algum procedimento", () => {
    const ganhos = D.procedimentos.map((p) => ganhoPossivel(regs, D, p.id));
    expect(ganhos.every((g) => g >= 0)).toBe(true);
    expect(ganhos.some((g) => g > 0)).toBe(true);
  });

  it("a explicação da IA traz liberação, glosa e o uso pelos médicos do hospital", () => {
    const e = explicacaoIA("st-b", "angioplastia", regs, D);
    const usos = regs.filter((r) => r.pedido.procedimentoId === "angioplastia" && r.pedido.itens.some((i) => i.marcaId === "st-b")).length;
    expect(e.usos).toBe(usos);
    expect(e.texto).toContain("libera em 2 dias");
    expect(e.texto).toContain("glosa 1%");
  });

  it("melhor e pior caso do teto: o melhor usa a marca aceita e homologada mais barata de cada item", () => {
    const padrao = D.padroes["artrodese-lombar"];
    const f = faixaPadrao(padrao, "4", D); // SulAmérica: pacote
    expect(f.tipo).toBe("pacote");
    expect(f.melhor).toBeLessThanOrEqual(f.pior);
    const contrato = D.contratosOperadora.find((c) => c.operadoraId === "4" && c.procedimentoId === "artrodese-lombar")!;
    const opme = padrao.itens.reduce((acc, ip) => {
      const custos = D.marcas.filter((m) => ip.aceitas.includes(m.id) && m.homologadaEm.includes("4")).map((m) => m.custo);
      return acc + (custos.length ? Math.min(...custos) * ip.qtdTipica : 0);
    }, 0);
    expect(f.melhor).toBe((contrato.tipo === "pacote" ? contrato.custoHospitalar : 0) + opme + f.complementoMaximo);
  });

  it("item sem marca homologada na operadora não gera NaN", () => {
    const padrao = { ...D.padroes["artrodese-lombar"], itens: [...D.padroes["artrodese-lombar"].itens, { itemId: "cage", qtdTipica: 1, aceitas: ["ca-d"], preferenciais: [] }] };
    const f = faixaPadrao(padrao, "6", D); // ca-d não é homologada na Hapvida
    expect(Number.isFinite(f.melhor) && Number.isFinite(f.pior)).toBe(true);
  });

  it("a prévia do complemento é o que o médico recebe seguindo o pedido sugerido", () => {
    expect(previaComplemento(D.padroes["artroscopia-joelho"], "1", D)).toBe(1500); // predefinido
    expect(previaComplemento(D.padroes["artrodese-lombar"], "4", D)).toBeGreaterThan(0);
  });

  it("status de revisão: vencendo até 90 dias, vencida depois da data, sem data quando vazia", () => {
    const hoje = new Date("2026-10-14T12:00:00");
    expect(statusRevisao({ ...D.padroes.angioplastia, revisaoEm: "2026-12-20" }, hoje)).toBe("vencendo");
    expect(statusRevisao({ ...D.padroes.angioplastia, revisaoEm: "2026-09-01" }, hoje)).toBe("vencida");
    expect(statusRevisao({ ...D.padroes.angioplastia, revisaoEm: "2027-08-01" }, hoje)).toBe("ok");
    expect(statusRevisao({ ...D.padroes.angioplastia, revisaoEm: undefined }, hoje)).toBe("sem_data");
  });

  it("aplicar uma sugestão 'incluir item' que já está no padrão não duplica o item", () => {
    const padrao = D.padroes["artrodese-lombar"];
    const itens = aplicarSugestao(padrao, { id: "x", titulo: "", motivo: "", tipo: "incluir_item", itemId: "cage", para: "ca-c", antes: "", depois: "" });
    expect(itens.filter((i) => i.itemId === "cage")).toHaveLength(1);
  });

  it("o efeito de uma sugestão compara antes e depois na operadora", () => {
    const padrao = D.padroes.angioplastia;
    const e = efeitoSugestao(padrao, padrao.sugestoes[0], "1", D); // Unimed homologa o Meril
    expect(e.antes.liberacaoDias).toBeGreaterThan(0);
    // Tirar o Meril (8 dias, glosa 9%) melhora a pior marca do leque de stent
    expect(e.antes.piorLiberacao).toBe(8);
    expect(e.depois.piorLiberacao).toBeLessThan(8);
    expect(e.depois.piorGlosa).toBeLessThan(e.antes.piorGlosa);
  });
});

let ctx: ReturnType<typeof useDominio>;
const Sonda = () => {
  ctx = useDominio();
  return null;
};
const renderComissao = (abrir?: string) =>
  render(
    <DominioProvider>
      <MemoryRouter>
        <Sonda />
        <ComissaoTab abrir={abrir} />
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

describe("tela da comissão", () => {
  it("o catálogo mostra o selo de sugestão, o ganho possível e a revisão vencendo", () => {
    renderComissao();
    const angio = screen.getByRole("button", { name: /Angioplastia coronária/ });
    expect(within(angio).getByText("Nova sugestão de alteração")).toBeInTheDocument();
    expect(within(angio).getByText("Revisão vencendo")).toBeInTheDocument();
    expect(screen.getAllByText(/Ganho possível/).length).toBeGreaterThan(0);
  });

  it("a montagem segue os passos do GME", () => {
    renderComissao("lca");
    for (const passo of ["Abrir o leque", "Direcionar", "Protocolo e códigos", "Complemento", "Revisar e aprovar"]) {
      expect(screen.getByRole("button", { name: new RegExp(passo) })).toBeInTheDocument();
    }
  });

  it("o protocolo editado pela comissão vai para o store", () => {
    renderComissao("lca");
    fireEvent.click(screen.getByRole("button", { name: /Protocolo e códigos/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "Novo critério de entrada" }), { target: { value: "Instabilidade com falha de reabilitação de 3 meses" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar critério" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Fonte do protocolo" }), { target: { value: "Protocolo GME Ortopedia 2026" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar ajustes" }));
    const prot = ctx.dominio.padroes.lca.protocolo;
    expect(prot.criterios).toContain("Instabilidade com falha de reabilitação de 3 meses");
    expect(prot.fonte).toBe("Protocolo GME Ortopedia 2026");
  });

  it("as sugestões aparecem no topo do procedimento com o efeito", () => {
    renderComissao("angioplastia");
    const aviso = screen.getByRole("region", { name: "Sugestões de alteração" });
    expect(within(aviso).getAllByText(/Meril/).length).toBeGreaterThan(0);
    expect(within(aviso).getAllByText(/Liberação/).length).toBeGreaterThan(0);
  });

  it("o passo do complemento mostra a prévia do que o médico recebe", () => {
    renderComissao("artroscopia-joelho");
    fireEvent.click(screen.getByRole("button", { name: /Complemento/ }));
    expect(screen.getByText(/Seguindo o pedido sugerido, o médico recebe/)).toBeInTheDocument();
  });
});
