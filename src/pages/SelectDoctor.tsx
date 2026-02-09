import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSurgical } from "@/contexts/SurgicalContext";
import { mockDoctors } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Search, Stethoscope, ArrowRight, Activity } from "lucide-react";

const SelectDoctor = () => {
  const [search, setSearch] = useState("");
  const { updateState } = useSurgical();
  const navigate = useNavigate();

  const filtered = mockDoctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.crm.toLowerCase().includes(search.toLowerCase())
  );

  const selectDoctor = (doc: typeof mockDoctors[0]) => {
    updateState({ doctor: doc, currentStep: 1 });
    navigate("/wizard");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center gap-3">
        <Activity className="w-6 h-6 text-primary" />
        <span className="font-bold text-lg text-foreground">SolicitaCirurg</span>
      </header>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Selecionar Médico</h1>
        <p className="text-muted-foreground mb-8">Escolha o médico para esta solicitação cirúrgica</p>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, especialidade ou CRM..."
            className="pl-11 h-12 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filtered.map((doc) => (
            <button
              key={doc.id}
              onClick={() => selectDoctor(doc)}
              className="w-full glass-card rounded-lg p-5 flex items-center gap-4 hover:border-primary/50 transition-all group text-left"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Stethoscope className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">{doc.name}</div>
                <div className="text-sm text-muted-foreground">{doc.specialty} · {doc.crm}</div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectDoctor;
