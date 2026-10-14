import { describe, it, expect } from "vitest";
import { OPME_CAMINHOS } from "@opme/rotas";

const ROTAS_SURGIFLOW = ["/", "/select-doctor", "/home", "/pedido", "/medico", "/hospital", "/consultor"];

describe("rotas do OPME.AI no app unificado", () => {
  it("expõe as telas de Compras e Gerente com os caminhos originais", () => {
    expect(OPME_CAMINHOS).toEqual(
      expect.arrayContaining(["/dashboard", "/bi/procedimento/:pacienteId", "/paciente/:id", "/acompanhamento", "/revisao", "/revisao/:id"]),
    );
  });

  it("não colide com nenhuma rota do SurgiFlow", () => {
    for (const caminho of OPME_CAMINHOS) {
      expect(ROTAS_SURGIFLOW.some((r) => caminho === r || (r !== "/" && caminho.startsWith(r + "/")))).toBe(false);
    }
  });
});
