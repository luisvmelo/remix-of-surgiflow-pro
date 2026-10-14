import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OpmeEmbutido, { OpmeProviders } from "@opme/embutido";
import Sidebar from "@opme/components/Sidebar";

const comRouter = (ui: React.ReactNode) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );

describe("OPME embutido na Gestão", () => {
  it("esconde a barra lateral do OPME e aplica o tema", () => {
    const { container } = comRouter(
      <OpmeEmbutido>
        <Sidebar />
        <p>conteúdo</p>
      </OpmeEmbutido>,
    );
    expect(screen.queryByRole("complementary", { name: "Módulos" })).toBeNull();
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
    expect(container.querySelector(".opme-theme")).not.toBeNull();
  });

  it("os portais (diálogos e menus) recebem o tema sem pintar o resto do app", () => {
    const { unmount } = comRouter(<OpmeEmbutido><p>x</p></OpmeEmbutido>);
    expect(document.body.classList.contains("opme-portais")).toBe(true);
    expect(document.body.classList.contains("opme-theme")).toBe(false);
    unmount();
    expect(document.body.classList.contains("opme-portais")).toBe(false);
  });

  it("fora da Gestão a barra aparece, mas sem o botão Configurações (que foi para a Gestão)", () => {
    comRouter(
      <OpmeProviders>
        <Sidebar />
      </OpmeProviders>,
    );
    expect(screen.getByRole("complementary", { name: "Módulos" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /configurações/i })).toBeNull();
  });
});
