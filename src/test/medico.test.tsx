import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { SurgicalProvider } from "@/contexts/SurgicalContext";
import { DominioProvider, useDominio } from "@/dominio/store";
import MedicoHome from "@/pages/medico/MedicoHome";
import MedicoPedido from "@/pages/medico/MedicoPedido";

let pedidos: ReturnType<typeof useDominio>["pedidos"] = [];
const Sonda = () => {
  pedidos = useDominio().pedidos;
  return null;
};

const renderEm = (rota: string) =>
  render(
    <DominioProvider>
      <SurgicalProvider>
        <MemoryRouter initialEntries={[rota]}>
          <Sonda />
          <Routes>
            <Route path="/medico" element={<MedicoHome />} />
            <Route path="/medico/pedido/:id" element={<MedicoPedido />} />
            <Route path="/pedido/:id" element={<p>wizard</p>} />
          </Routes>
        </MemoryRouter>
      </SurgicalProvider>
    </DominioProvider>,
  );

describe("telas do médico", () => {
  beforeEach(() => localStorage.clear());

  it("a home mostra a previsão de recebimento e as abas com as contagens do store", () => {
    renderEm("/medico");
    expect(screen.getByText(/previsão de recebimento/i)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /aguardando minha validação\s*1/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /esperando confirmação\s*2/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /confirmados\s*3/i })).toBeInTheDocument();
  });

  it("devolver com motivo volta o pedido para rascunho", () => {
    renderEm("/medico/pedido/p4");
    fireEvent.click(screen.getByRole("button", { name: /^devolver/i }));
    fireEvent.change(screen.getByLabelText(/motivo/i), { target: { value: "Faltou o código da descompressão" } });
    fireEvent.click(screen.getByRole("button", { name: /confirmar devolução/i }));
    const p4 = pedidos.find((p) => p.id === "p4")!;
    expect(p4.status).toBe("rascunho");
    expect(p4.devolvido).toBe("Faltou o código da descompressão");
  });

  it("aprovar leva o pedido para esperando confirmação", () => {
    renderEm("/medico/pedido/p4");
    fireEvent.click(screen.getByRole("button", { name: /^aprovar/i }));
    expect(pedidos.find((p) => p.id === "p4")!.status).toBe("esperando_confirmacao");
  });
});
