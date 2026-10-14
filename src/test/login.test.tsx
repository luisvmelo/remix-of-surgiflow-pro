import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { SurgicalProvider } from "@/contexts/SurgicalContext";
import Login from "@/pages/Login";

const renderLogin = () =>
  render(
    <SurgicalProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/revisao" element={<p>tela de compras</p>} />
        </Routes>
      </HashRouter>
    </SurgicalProvider>,
  );

describe("login por perfil", () => {
  it("mostra um botão por perfil", () => {
    window.location.hash = "#/";
    renderLogin();
    for (const nome of ["Gestão", "Consultor", "Médico", "Secretária", "Compras", "Gerente de compras"]) {
      expect(screen.getByRole("button", { name: new RegExp(`^${nome}`, "i") })).toBeInTheDocument();
    }
  });

  it("entrar como Compras leva para a revisão de pedidos", () => {
    window.location.hash = "#/";
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /^Compras/i }));
    expect(screen.getByText("tela de compras")).toBeInTheDocument();
  });
});
