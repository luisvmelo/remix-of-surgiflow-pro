import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserCheck, Pencil } from "lucide-react";

interface PatientCardProps {
  patient: { name: string; cpf: string; birthDate: string; phone: string };
  onEdit: () => void;
}

const PatientCard = ({ patient, onEdit }: PatientCardProps) => (
  <div className="glass-card rounded-xl p-5 mb-6 animate-fade-in border-l-4 border-l-primary">
    <div className="flex items-center justify-between mb-3">
      <Label className="text-sm font-semibold flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-primary" /> Paciente Selecionado
      </Label>
      <Button variant="ghost" size="sm" onClick={onEdit} className="text-xs gap-1.5">
        <Pencil className="w-3.5 h-3.5" /> Editar
      </Button>
    </div>
    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
      <div><span className="text-muted-foreground">Nome:</span> <span className="font-medium text-foreground">{patient.name}</span></div>
      <div><span className="text-muted-foreground">CPF:</span> <span className="font-medium text-foreground">{patient.cpf}</span></div>
      <div><span className="text-muted-foreground">Nascimento:</span> <span className="font-medium text-foreground">{patient.birthDate}</span></div>
      <div><span className="text-muted-foreground">Telefone:</span> <span className="font-medium text-foreground">{patient.phone}</span></div>
    </div>
  </div>
);

export default PatientCard;
