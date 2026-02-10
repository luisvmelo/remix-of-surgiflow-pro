import { useState } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { mockPatients, mockOperadoras, mockProcedures } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, UserCheck, ArrowRight, Pencil, Stethoscope, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PatientSearch from "./patient/PatientSearch";
import PatientCard from "./patient/PatientCard";
import PatientForm from "./patient/PatientForm";
import ProcedureSelector from "./patient/ProcedureSelector";

const StepPatient = () => {
  const { state, updateState, setStep } = useSurgical();
  const [selectedPatient, setSelectedPatient] = useState(state.patient);
  const [operadoraId, setOperadoraId] = useState(state.operadora?.id || "");
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", cpf: "", birthDate: "", phone: "" });
  const [newData, setNewData] = useState({ name: "", cpf: "", birthDate: "", phone: "" });
  const [selectedProc, setSelectedProc] = useState(state.selectedProcedure);

  const startEditing = () => {
    if (!selectedPatient) return;
    setEditData({
      name: selectedPatient.name,
      cpf: selectedPatient.cpf,
      birthDate: selectedPatient.birthDate,
      phone: selectedPatient.phone,
    });
    setEditing(true);
  };

  const confirmEdit = () => {
    if (selectedPatient) {
      setSelectedPatient({ ...selectedPatient, ...editData });
    }
    setEditing(false);
  };

  const handleNext = () => {
    const operadora = mockOperadoras.find((o) => o.id === operadoraId) || null;
    const patient = selectedPatient || (showNew ? { id: "new", name: newData.name, cpf: newData.cpf, birthDate: newData.birthDate, phone: newData.phone, motherName: "", operadoraId } : null);
    if (patient && operadora && selectedProc) {
      updateState({
        patient,
        operadora,
        selectedProcedure: selectedProc,
        currentStep: 2,
        rentabilityScore: 0,
        glossRisk: 0,
        historicalPercentile: 0,
        bestPossible: 0,
      });
      setStep(2);
    }
  };

  const canProceed = (selectedPatient || (showNew && newData.name && newData.phone)) && operadoraId && !editing && selectedProc;

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-1">Paciente, Operadora e Cirurgia</h2>
      <p className="text-muted-foreground mb-8">Busque ou cadastre o paciente, selecione a operadora e o procedimento principal</p>

      {/* Patient Search */}
      <PatientSearch
        selectedPatient={selectedPatient}
        onSelect={(p) => { setSelectedPatient(p); setOperadoraId(p.operadoraId); setShowNew(false); }}
        onShowNew={() => { setShowNew(true); setSelectedPatient(null); }}
      />

      {/* Selected patient card */}
      {selectedPatient && !editing && (
        <PatientCard patient={selectedPatient} onEdit={startEditing} />
      )}

      {/* Editing selected patient */}
      {selectedPatient && editing && (
        <PatientForm
          title="Editar Paciente"
          icon={<Pencil className="w-4 h-4 text-accent" />}
          data={editData}
          onChange={setEditData}
          onCancel={() => setEditing(false)}
          onConfirm={confirmEdit}
          confirmLabel="Salvar alterações"
          canConfirm={!!editData.name && !!editData.phone}
        />
      )}

      {/* New patient form */}
      {showNew && !selectedPatient && (
        <PatientForm
          title="Novo Paciente"
          icon={<UserPlus className="w-4 h-4 text-accent" />}
          data={newData}
          onChange={setNewData}
          showPlaceholders
        />
      )}

      {/* Operadora */}
      <div className="glass-card rounded-xl p-5 mb-6">
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

      {/* Procedure Selection */}
      <ProcedureSelector
        doctorName={state.doctor?.name}
        selectedProc={selectedProc}
        onSelect={setSelectedProc}
      />

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!canProceed} className="h-11 px-6">
          Próxima etapa <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepPatient;
