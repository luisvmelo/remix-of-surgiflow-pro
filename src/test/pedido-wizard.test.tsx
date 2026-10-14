import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DominioProvider, useDominio } from "@/dominio/store";
import PedidoWizard from "@/components/pedido/PedidoWizard";

let pedidosNoStore: ReturnType<typeof useDominio>["pedidos"] = [];
const Sonda = () => {
  pedidosNoStore = useDominio().pedidos;
  return null;
};

const renderWizard = (modo: "secretaria" | "medico" = "secretaria") =>
  render(
    <DominioProvider>
      <MemoryRouter>
        <Sonda />
        <PedidoWizard
          modo={modo}
          medicoId="1"
          inicial={{ paciente: { nome: "Paciente Teste", cpf: "123" }, operadoraId: "4", plano: "Especial", procedimentoId: "artrodese-lombar", dataCirurgia: "2026-11-20" }}
          onConcluir={() => {}}
        />
      </MemoryRouter>
    </DominioProvider>,
  );

const irPara = (passo: string) => fireEvent.click(screen.getByRole("button", { name: new RegExp(passo, "i") }));

describe("wizard do pedido", () => {
  beforeEach(() => localStorage.clear());

  it("o pedido sugerido preenche os itens e o resumo mostra honorário e complemento garantidos", () => {
    renderWizard();
    fireEvent.click(screen.getByRole("button", { name: /usar pedido sugerido/i }));
    irPara("^Documentos");
    fireEvent.click(screen.getByRole("button", { name: /anexar todos/i }));
    irPara("^Resumo");
    expect(screen.getAllByText(/honorário garantido/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/complemento garantido/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/complemento perdido/i)).not.toBeInTheDocument();
  });

  it("item fora do protocolo mostra a tag e o complemento perdido", () => {
    renderWizard();
    fireEvent.click(screen.getByRole("button", { name: /usar pedido sugerido/i }));
    irPara("^Itens");
    expect(screen.queryByRole("button", { name: /^fora do protocolo$/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /adicionar item fora do protocolo/i }));
    fireEvent.click(screen.getByRole("button", { name: /lâmina de shaver/i }));
    expect(screen.getAllByRole("button", { name: /^fora do protocolo$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/complemento perdido/i).length).toBeGreaterThan(0);
  });

  it("a secretária finaliza e o pedido vai para a validação do médico", () => {
    renderWizard("secretaria");
    fireEvent.click(screen.getByRole("button", { name: /usar pedido sugerido/i }));
    irPara("^Documentos");
    fireEvent.click(screen.getByRole("button", { name: /anexar todos/i }));
    irPara("^Resumo");
    fireEvent.click(screen.getByRole("button", { name: /enviar ao médico/i }));
    const criado = pedidosNoStore.find((p) => p.paciente.nome === "Paciente Teste");
    expect(criado?.status).toBe("aguardando_medico");
    expect(criado?.itens.length).toBeGreaterThan(0);
  });
});
