import { useState } from "react";
import { mockPatients, mockOperadoras } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, UserCheck } from "lucide-react";

interface PatientSearchProps {
  selectedPatient: typeof mockPatients[0] | null;
  onSelect: (patient: typeof mockPatients[0]) => void;
  onShowNew: () => void;
}

const PatientSearch = ({ selectedPatient, onSelect, onShowNew }: PatientSearchProps) => {
  const [search, setSearch] = useState("");

  const filtered = search.length >= 2
    ? mockPatients.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.cpf.includes(search) ||
          p.phone.includes(search)
      )
    : [];

  return (
    <div className="glass-card rounded-xl p-5 mb-6">
      <Label className="text-sm font-semibold mb-3 block">Buscar Paciente</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Nome, CPF ou telefone (mínimo 2 caracteres)..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {filtered.length > 0 && (
        <div className="mt-3 space-y-2">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setSearch(""); }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-all ${
                selectedPatient?.id === p.id
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-muted border border-transparent"
              }`}
            >
              <UserCheck className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-foreground">{p.name}</div>
                <div className="text-muted-foreground text-xs">{p.cpf} · {p.phone}</div>
              </div>
              <span className="text-xs text-muted-foreground">
                {mockOperadoras.find(o => o.id === p.operadoraId)?.name}
              </span>
            </button>
          ))}
        </div>
      )}
      {search.length >= 2 && filtered.length === 0 && (
        <div className="mt-4 text-center py-6 border border-dashed rounded-lg">
          <p className="text-muted-foreground text-sm mb-3">Nenhum paciente encontrado para "{search}"</p>
          <Button variant="outline" size="sm" onClick={() => { onShowNew(); setSearch(""); }}>
            <UserPlus className="w-4 h-4 mr-2" /> Cadastrar novo paciente
          </Button>
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
