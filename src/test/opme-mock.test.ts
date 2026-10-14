import { describe, it, expect } from "vitest";
import { mockFetch } from "@opme/mock/api";
import { IS_MOCK } from "@opme/config/produto";

describe("OPME.AI portado", () => {
  it("roda sempre em modo mock", () => {
    expect(IS_MOCK).toBe(true);
  });

  it("o banco simulado devolve cirurgias", async () => {
    const res = await mockFetch("/get_surgeries_by_page?page=1&number_of_results=5");
    expect(res.status).toBe(200);
    const lista = await res.json();
    expect(Array.isArray(lista)).toBe(true);
    expect(lista.length).toBeGreaterThan(0);
  });
});
