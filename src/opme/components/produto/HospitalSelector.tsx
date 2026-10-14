import { Building2, Network } from "lucide-react";
import { REDE_ID } from "@opme/config/produto";
import { useHospital } from "@opme/contexts/HospitalContext";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger } from "@opme/components/ui/select";

/** Seleção do hospital (cada um com sua base) ou da visão consolidada da rede */
const HospitalSelector = () => {
  const { hospitalId, hospitais, nomeRede, isRede, hospital, setHospitalId } = useHospital();

  return (
    <Select value={hospitalId} onValueChange={setHospitalId}>
      <SelectTrigger className="h-11 min-w-[240px] bg-neutral-100 border-neutral-200" aria-label="Hospital">
        <div className="flex items-center gap-2.5 text-left">
          {isRede ? (
            <Network className="w-5 h-5 text-[#325AA4] shrink-0" />
          ) : (
            <Building2 className="w-5 h-5 text-[#325AA4] shrink-0" />
          )}
          <div className="leading-tight">
            <p className="text-sm font-bold text-neutral-600">{isRede ? nomeRede : hospital?.nome}</p>
            <p className="text-[11px] text-neutral-500">
              {isRede ? `Visão consolidada · ${hospitais.length} hospitais` : `${hospital?.cidade} · ${hospital?.erp}`}
            </p>
          </div>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Hospitais</SelectLabel>
          {hospitais.map((h) => (
            <SelectItem key={h.id} value={h.id}>
              {h.nome} <span className="text-neutral-500">· {h.erp}</span>
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Rede</SelectLabel>
          <SelectItem value={REDE_ID}>{nomeRede} (consolidado)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default HospitalSelector;
