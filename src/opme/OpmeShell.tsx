import { Outlet } from "react-router-dom";
import { AuthProvider } from "@opme/contexts/AuthContext";
import { HospitalProvider } from "@opme/contexts/HospitalContext";
import { ConfigProvider } from "@opme/contexts/ConfigContext";
import { EscolhasProvider } from "@opme/contexts/EscolhasContext";
import { OtimizadorProvider } from "@opme/contexts/OtimizadorContext";
import { FilterProvider } from "@opme/contexts/FilterContext";
import { Toaster } from "@opme/components/ui/toaster";
import { Toaster as Sonner } from "@opme/components/ui/sonner";

/**
 * Layout das telas do OPME.AI (Compras e Gerente de compras).
 * Fica montado enquanto se navega entre elas, para não perder escolhas e otimizações.
 */
const OpmeShell = () => (
  <AuthProvider>
    <HospitalProvider>
      <ConfigProvider>
        <EscolhasProvider>
          <OtimizadorProvider>
            <FilterProvider>
              <div className="opme-theme min-h-screen bg-background text-foreground">
                <Toaster />
                <Sonner />
                <Outlet />
              </div>
            </FilterProvider>
          </OtimizadorProvider>
        </EscolhasProvider>
      </ConfigProvider>
    </HospitalProvider>
  </AuthProvider>
);

export default OpmeShell;
