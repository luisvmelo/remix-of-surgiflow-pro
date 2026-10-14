import { describe, it, expect } from "vitest";
import { PERFIS, rotaInicial } from "@/lib/perfis";

describe("perfis", () => {
  it("cada perfil tem uma rota inicial", () => {
    expect(rotaInicial("gestao")).toBe("/hospital");
    expect(rotaInicial("medico")).toBe("/medico");
    expect(rotaInicial("secretaria")).toBe("/home");
    expect(rotaInicial("compras")).toBe("/revisao");
    expect(rotaInicial("consultor")).toBe("/consultor");
    expect(rotaInicial("gerente_compras")).toBe("/acompanhamento");
  });

  it("lista os seis perfis na ordem do login", () => {
    expect(PERFIS.map((p) => p.id)).toEqual(["gestao", "consultor", "medico", "secretaria", "compras", "gerente_compras"]);
  });
});
