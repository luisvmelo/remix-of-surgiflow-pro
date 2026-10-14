import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SurgicalProvider } from "@/contexts/SurgicalContext";
import { DominioProvider } from "@/dominio/store";
import SecretariaHome from "@/pages/secretaria/SecretariaHome";

const renderHome = () =>
  render(
    <DominioProvider>
      <SurgicalProvider>
        <MemoryRouter>
          <SecretariaHome />
        </MemoryRouter>
      </SurgicalProvider>
    </DominioProvider>,
  );

describe("home da secretária", () => {
  beforeEach(() => localStorage.clear());

  it("mostra as 4 colunas com os pedidos do store", () => {
    renderHome();
    expect(screen.getByRole("heading", { name: /^rascunho\s*1$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^aguardando o médico\s*1$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^esperando confirmação\s*3$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^confirmado\s*4$/i })).toBeInTheDocument();
  });

  it("o pedido com ajuste pedido por Compras aparece com a tag na coluna Esperando confirmação", () => {
    renderHome();
    const coluna = screen.getByRole("region", { name: /esperando confirmação/i });
    const card = within(coluna).getByText("Ana Paula Ferreira").closest("article")!;
    expect(within(card as HTMLElement).getByText(/ajuste pedido/i)).toBeInTheDocument();
  });
});
