import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { SurgicalProvider, useSurgical } from "@/contexts/SurgicalContext";
import TrocarPerfilButton from "@/components/TrocarPerfilButton";

const PerfilAtual = () => {
  const { perfil } = useSurgical();
  return <p>perfil: {perfil ?? "nenhum"}</p>;
};

const Entrar = () => {
  const { setPerfil } = useSurgical();
  return <button onClick={() => setPerfil("compras")}>entrar</button>;
};

const renderEm = (rota: string) =>
  render(
    <SurgicalProvider>
      <MemoryRouter initialEntries={[rota]}>
        <TrocarPerfilButton />
        <Routes>
          <Route path="/" element={<p>tela de perfis</p>} />
          <Route path="/dashboard" element={<><Entrar /><PerfilAtual /></>} />
        </Routes>
      </MemoryRouter>
    </SurgicalProvider>,
  );

describe("botão de trocar perfil", () => {
  it("não aparece na tela de escolha de perfis", () => {
    renderEm("/");
    expect(screen.queryByRole("button", { name: "Trocar perfil" })).not.toBeInTheDocument();
  });

  it("nas outras telas, limpa o perfil e volta para a escolha de perfis", () => {
    renderEm("/dashboard");
    fireEvent.click(screen.getByText("entrar"));
    expect(screen.getByText("perfil: compras")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Trocar perfil" }));
    expect(screen.getByText("tela de perfis")).toBeInTheDocument();
  });

  it("nas telas do OPME fica ao lado da barra lateral, sem cobrir o botão Sair", () => {
    renderEm("/revisao/p3");
    expect(screen.getByRole("button", { name: "Trocar perfil" }).className).toContain("left-[232px]");
  });

  it("fora do OPME fica no canto", () => {
    renderEm("/hospital");
    expect(screen.getByRole("button", { name: "Trocar perfil" }).className).toContain("left-3");
  });
});
