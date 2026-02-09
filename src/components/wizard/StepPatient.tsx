import { useState } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { mockPatients, mockOperadoras } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, UserCheck, ArrowRight, ChevronDown } from "lucide-react";

const StepPatient = () => {
  const { state, updateState, setStep } = useSurgical();
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(state.patient);
  const [operadoraId, setOperadoraId] = useState(state.operadora?.id || "");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCpf, setNewCpf] = useState("");
  const [newBirth, setNewBirth] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const filtered = search.length >= 2
    ? mockPatients.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.cpf.includes(search) ||
          p.phone.includes(search)
      )
    : [];

  const handleNext = () => {
    const operadora = mockOperadoras.find((o) => o.id === operadoraId) || null;
    const patient = selectedPatient || (showNew ? { id: "new", name: newName, cpf: newCpf, birthDate: newBirth, phone: newPhone, motherName: "", operadoraId } : null);
    if (patient && operadora) {
      updateState({ patient, operadora, currentStep: 2, rentabilityScore: 0, glossRisk: 0, historicalPercentile: 0, bestPossible: 0 });
      setStep(2);
    }
  };

  const canProceed = (selectedPatient || (showNew && newName && newPhone)) && operadoraId;

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-1">Paciente e Operadora</h2>
      <p className="text-muted-foreground mb-8">Busque ou cadastre o paciente e selecione a operadora</p>

      {/* Search */}
      <div className="glass-card rounded-xl p-5 mb-6">
        <Label className="text-sm font-semibold mb-3 block">Buscar Paciente</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Nome, CPF ou telefone (mínimo 2 caracteres)..."
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowNew(false); setSelectedPatient(null); }}
          />
        </div>
        {filtered.length > 0 && (
          <div className="mt-3 space-y-2">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedPatient(p); setOperadoraId(p.operadoraId); setShowNew(false); }}
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
            <Button variant="outline" size="sm" onClick={() => { setShowNew(true); setSelectedPatient(null); }}>
              <UserPlus className="w-4 h-4 mr-2" /> Cadastrar novo paciente
            </Button>
          </div>
        )}
      </div>

      {/* Selected patient card */}
      {selectedPatient && (
        <div className="glass-card rounded-xl p-5 mb-6 animate-fade-in border-l-4 border-l-primary">
          <Label className="text-sm font-semibold mb-3 block flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" /> Paciente Selecionado
          </Label>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div><span className="text-muted-foreground">Nome:</span> <span className="font-medium text-foreground">{selectedPatient.name}</span></div>
            <div><span className="text-muted-foreground">CPF:</span> <span className="font-medium text-foreground">{selectedPatient.cpf}</span></div>
            <div><span className="text-muted-foreground">Nascimento:</span> <span className="font-medium text-foreground">{selectedPatient.birthDate}</span></div>
            <div><span className="text-muted-foreground">Telefone:</span> <span className="font-medium text-foreground">{selectedPatient.phone}</span></div>
          </div>
        </div>
      )}

      {/* New patient form */}
      {showNew && !selectedPatient && (
        <div className="glass-card rounded-xl p-5 mb-6 animate-fade-in border-l-4 border-l-accent">
          <Label className="text-sm font-semibold mb-4 block flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-accent" /> Novo Paciente
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome completo *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do paciente" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">CPF</Label>
              <Input value={newCpf} onChange={(e) => setNewCpf(e.target.value)} placeholder="000.000.000-00" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data de Nascimento *</Label>
              <Input type="date" value={newBirth} onChange={(e) => setNewBirth(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Telefone *</Label>
              <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
          </div>
        </div>
      )}

      {/* Operadora */}
      <div className="glass-card rounded-xl p-5 mb-8">
        <Label className="text-sm font-semibold mb-3 block">Operadora de Saúde *</Label>
        <Select value={operadoraId} onValueChange={setOperadoraId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a operadora" />
          </SelectTrigger>
          <SelectContent>
            {mockOperadoras.map((op) => (
              <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!canProceed} className="h-11 px-6">
          Próxima etapa <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepPatient;
