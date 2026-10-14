import { createContext, useContext, useEffect, type ReactNode } from "react";
import { AuthProvider } from "@opme/contexts/AuthContext";
import { HospitalProvider } from "@opme/contexts/HospitalContext";
import { ConfigProvider } from "@opme/contexts/ConfigContext";
import { EscolhasProvider } from "@opme/contexts/EscolhasContext";
import { OtimizadorProvider } from "@opme/contexts/OtimizadorContext";
import { FilterProvider } from "@opme/contexts/FilterContext";
import { Toaster } from "@opme/components/ui/toaster";
import { Toaster as Sonner } from "@opme/components/ui/sonner";

const EmbutidoContext = createContext(false);

/** true quando a tela do OPME está dentro de uma aba da Gestão (sem a barra lateral própria). */
export const useEmbutido = () => useContext(EmbutidoContext);

/** Providers que as telas do OPME.AI esperam encontrar. */
export function OpmeProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <HospitalProvider>
        <ConfigProvider>
          <EscolhasProvider>
            <OtimizadorProvider>
              <FilterProvider>{children}</FilterProvider>
            </OtimizadorProvider>
          </EscolhasProvider>
        </ConfigProvider>
      </HospitalProvider>
    </AuthProvider>
  );
}

/**
 * Uma tela do OPME.AI (Insights, Resultados, Configurações) dentro de uma aba da Gestão.
 * O tema fica só nesta caixa; os portais do Radix recebem o tema pela classe .opme-portais no <body>.
 */
export default function OpmeEmbutido({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.classList.add("opme-portais");
    return () => document.body.classList.remove("opme-portais");
  }, []);

  return (
    <EmbutidoContext.Provider value={true}>
      <OpmeProviders>
        <div className="opme-theme opme-embutido rounded-lg overflow-hidden border border-border bg-background text-foreground">
          <Toaster />
          <Sonner />
          {children}
        </div>
      </OpmeProviders>
    </EmbutidoContext.Provider>
  );
}
