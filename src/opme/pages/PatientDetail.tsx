import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import Sidebar from "@opme/components/Sidebar";
import Topbar from "@opme/components/Topbar";
import PatientCard from "@opme/components/PatientCard";
import { usePatient } from "@opme/hooks/usePatients";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: patient, isLoading } = usePatient(id || "");

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-azul animate-spin" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-semibold text-cinza-700 mb-4">Paciente não encontrado</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-brand-azul hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col w-full">
        <Topbar />
        
        <main className="flex-1 p-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-brand-azul hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao board
          </button>
          
          <div className="max-w-2xl mx-auto">
            <PatientCard patient={patient} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDetail;
