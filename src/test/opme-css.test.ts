import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(__dirname, "../opme/opme.css"), "utf-8");

describe("tema do OPME.AI confinado em .opme-theme", () => {
  it("não tem regras de elemento soltas (body, p, h1…) que mudariam as telas do SurgiFlow", () => {
    const vazamentos = css.match(/^\s*(html|body|h[1-6]|p|label|legend)\s*[,{]/gm) ?? [];
    expect(vazamentos).toEqual([]);
  });

  it("as variáveis do tema não ficam em :root", () => {
    expect(css).not.toMatch(/:root\s*\{/);
  });
});
