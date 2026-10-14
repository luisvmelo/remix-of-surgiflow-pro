import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { SurgicalProvider } from "@/contexts/SurgicalContext";
import { DominioProvider } from "@/dominio/store";
import Login from "./pages/Login";
import SelectDoctor from "./pages/SelectDoctor";
import SecretariaHome from "./pages/secretaria/SecretariaHome";
import PedidoPage from "./pages/PedidoPage";
import MedicoHome from "./pages/medico/MedicoHome";
import MedicoPedido from "./pages/medico/MedicoPedido";
import HospitalHome from "./pages/hospital/HospitalHome";
import NotFound from "./pages/NotFound";
import TrocarPerfilButton from "@/components/TrocarPerfilButton";
import OpmeShell from "@/opme/OpmeShell";
import { OPME_ROTAS } from "@/opme/rotas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DominioProvider>
      <SurgicalProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <TrocarPerfilButton />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/select-doctor" element={<SelectDoctor />} />
            <Route path="/home" element={<SecretariaHome />} />
            <Route path="/pedido/novo" element={<PedidoPage />} />
            <Route path="/pedido/:id" element={<PedidoPage />} />
            <Route path="/medico" element={<MedicoHome />} />
            <Route path="/medico/pedido/:id" element={<MedicoPedido />} />
            <Route path="/hospital" element={<HospitalHome />} />
            <Route element={<OpmeShell />}>
              {OPME_ROTAS.map((r) => (
                <Route key={r.path} path={r.path} element={r.element} />
              ))}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </SurgicalProvider>
      </DominioProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
