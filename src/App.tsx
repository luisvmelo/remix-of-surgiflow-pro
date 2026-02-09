import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SurgicalProvider } from "@/contexts/SurgicalContext";
import Login from "./pages/Login";
import SelectDoctor from "./pages/SelectDoctor";
import Wizard from "./pages/Wizard";
import Analises from "./pages/Analises";
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
            <Route path="/wizard" element={<Wizard />} />
            <Route path="/analises" element={<Analises />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SurgicalProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
