import { describe, it, expect } from "vitest";
import { OPME_CAMINHOS } from "@opme/rotas";

const ROTAS_SURGIFLOW = ["/", "/select-doctor", "/home", "/wizard", "/analises", "/medico", "/hospital"];

describe("rotas do OPME.AI no app unificado", () => {
  it("expõe as telas de Compras e Gerente com os caminhos originais", () => {
    expect(OPME_CAMINHOS).toEqual(
      expect.arrayContaining(["/dashboard", "/bi/procedimento/:pacienteId", "/paciente/:id", "/acompanhamento"]),
    );
  });

  it("não colide com nenhuma rota do SurgiFlow", () => {
    for (const caminho of OPME_CAMINHOS) {
      expect(ROTAS_SURGIFLOW.some((r) => caminho === r || (r !== "/" && caminho.startsWith(r + "/")))).toBe(false);
    }
  });
});
