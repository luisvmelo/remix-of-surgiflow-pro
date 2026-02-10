import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SurgicalProvider } from "@/contexts/SurgicalContext";
import Login from "./pages/Login";
import SelectDoctor from "./pages/SelectDoctor";
import Homepage from "./pages/Homepage";
import Wizard from "./pages/Wizard";
import Analises from "./pages/Analises";
import DoctorHome from "./pages/doctor/DoctorHome";
import DoctorGuiaDetail from "./pages/doctor/DoctorGuiaDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SurgicalProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/select-doctor" element={<SelectDoctor />} />
            <Route path="/home" element={<Homepage />} />
            <Route path="/wizard" element={<Wizard />} />
            <Route path="/analises" element={<Analises />} />
            <Route path="/medico" element={<DoctorHome />} />
            <Route path="/medico/guia/:id" element={<DoctorGuiaDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SurgicalProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
