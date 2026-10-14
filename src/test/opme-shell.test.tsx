import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OpmeShell from "@opme/OpmeShell";

describe("OpmeShell", () => {
  it("aplica o tema do OPME no body enquanto está montado, para as janelas sobrepostas (portais) também o receberem", () => {
    const { unmount } = render(
      <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={["/x"]}>
        <Routes>
          <Route element={<OpmeShell />}>
            <Route path="/x" element={<p>tela do opme</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(document.body.classList.contains("opme-theme")).toBe(true);
    unmount();
    expect(document.body.classList.contains("opme-theme")).toBe(false);
  });
});
