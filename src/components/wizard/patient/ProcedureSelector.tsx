import { useState } from "react";
import { mockProcedures } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Stethoscope, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
interface ProcedureSelectorProps {
  doctorName?: string;
  selectedProc: typeof mockProcedures[0] | null;
  onSelect: (proc: typeof mockProcedures[0]) => void;
}
const ProcedureSelector = ({
  doctorName,
  selectedProc,
  onSelect
}: ProcedureSelectorProps) => {
  const [procSearch, setProcSearch] = useState("");
  const doctorProcs = mockProcedures.filter(p => p.doctorUses);
  const searchResults = procSearch.length >= 2 ? mockProcedures.filter(p => p.name.toLowerCase().includes(procSearch.toLowerCase()) || p.code.includes(procSearch)) : [];
  return <div className="glass-card rounded-xl p-5 mb-8">
      <Label className="text-sm font-semibold mb-4 block flex items-center gap-2">
        <Stethoscope className="w-4 h-4 text-primary" /> Cirurgia Principal *
      </Label>

      <p className="text-xs text-muted-foreground mb-2">Procedimentos comuns de {doctorName || "seu médico"}:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {doctorProcs.map(proc => <button key={proc.code} onClick={() => {
        onSelect(proc);
        setProcSearch("");
      }} className={cn("flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-all border-2", selectedProc?.code === proc.code ? "border-primary bg-primary/10" : "border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", selectedProc?.code === proc.code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">{proc.name}</div>
              <div className="text-xs text-muted-foreground">{proc.code}</div>
            </div>
            {selectedProc?.code === proc.code && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
          </button>)}
      </div>

      <p className="text-xs text-muted-foreground mb-2">Ou busque outro procedimento:</p>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou código..." className="pl-10" value={procSearch} onChange={e => setProcSearch(e.target.value)} />
      </div>
      {searchResults.length > 0 && <div className="mt-2 border rounded-lg bg-card shadow-md max-h-48 overflow-y-auto">
          {searchResults.map(proc => <button key={proc.code} onClick={() => {
        onSelect(proc);
        setProcSearch("");
      }} className={cn("w-full flex items-center justify-between p-3 text-left text-sm hover:bg-muted transition-colors border-b last:border-b-0", selectedProc?.code === proc.code && "bg-primary/5")}>
              <div>
                <div className="font-medium text-foreground">{proc.name}</div>
                <div className="text-xs text-muted-foreground">{proc.code}</div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {proc.doctorUses && <span className="badge-doctor text-[10px] px-2 py-0.5 rounded-full">Seu médico</span>}
                {proc.common && <span className="badge-info text-[10px] px-2 py-0.5 rounded-full">Comum</span>}
              </div>
            </button>)}
        </div>}
      {procSearch.length >= 2 && searchResults.length === 0 && <p className="text-xs text-muted-foreground mt-2 text-center py-2">Nenhum procedimento encontrado</p>}

    </div>;
};
export default ProcedureSelector;