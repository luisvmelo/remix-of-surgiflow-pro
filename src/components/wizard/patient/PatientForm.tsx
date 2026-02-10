import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface PatientData {
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
}

interface PatientFormProps {
  title: string;
  icon: ReactNode;
  data: PatientData;
  onChange: (data: PatientData) => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  canConfirm?: boolean;
  showPlaceholders?: boolean;
}

const PatientForm = ({ title, icon, data, onChange, onCancel, onConfirm, confirmLabel, canConfirm, showPlaceholders }: PatientFormProps) => (
  <div className="glass-card rounded-xl p-5 mb-6 animate-fade-in border-l-4 border-l-accent">
    <Label className="text-sm font-semibold mb-4 block flex items-center gap-2">
      {icon} {title}
    </Label>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Nome completo *</Label>
        <Input value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} placeholder={showPlaceholders ? "Nome do paciente" : undefined} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">CPF</Label>
        <Input value={data.cpf} onChange={(e) => onChange({ ...data, cpf: e.target.value })} placeholder={showPlaceholders ? "000.000.000-00" : undefined} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Data de Nascimento</Label>
        <Input type="date" value={data.birthDate} onChange={(e) => onChange({ ...data, birthDate: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Telefone *</Label>
        <Input value={data.phone} onChange={(e) => onChange({ ...data, phone: e.target.value })} placeholder={showPlaceholders ? "(00) 00000-0000" : undefined} />
      </div>
    </div>
    {onCancel && onConfirm && (
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" onClick={onConfirm} disabled={!canConfirm}>{confirmLabel}</Button>
      </div>
    )}
  </div>
);

export default PatientForm;
