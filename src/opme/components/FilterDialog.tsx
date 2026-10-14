import { useState, useMemo } from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useFilters } from "@opme/contexts/FilterContext";
import { usePatients } from "@opme/hooks/usePatients";
import { cn } from "@opme/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@opme/components/ui/sheet";
import { Button } from "@opme/components/ui/button";
import { Calendar } from "@opme/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@opme/components/ui/popover";
import { Input } from "@opme/components/ui/input";
import { Label } from "@opme/components/ui/label";
import { Checkbox } from "@opme/components/ui/checkbox";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FilterDialog = ({ open, onOpenChange }: FilterDialogProps) => {
  const { filters, setCirurgia, setDateRange, setOperadoras, setPaciente, setOpmes, setPortes, setEspecialidades, clearFilters } = useFilters();
  const { data: allPatients = [] } = usePatients();

  // Get unique values from actual patient data
  const uniqueOperadoras = useMemo(() =>
    Array.from(new Set(allPatients.map((p) => p.convenio))).sort(),
    [allPatients]
  );
  const especialidades = useMemo(() =>
    Array.from(new Set(allPatients.map((p) => p.especialidade))).sort(),
    [allPatients]
  );
  const portes = ["Pequeno", "Médio", "Grande"];

  const [localDateStart, setLocalDateStart] = useState<Date | undefined>(
    filters.dateRange.start
  );
  const [localDateEnd, setLocalDateEnd] = useState<Date | undefined>(
    filters.dateRange.end
  );

  const handleApply = () => {
    setDateRange(localDateStart, localDateEnd);
    onOpenChange(false);
  };

  const handleClear = () => {
    clearFilters();
    setLocalDateStart(undefined);
    setLocalDateEnd(undefined);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] bg-neutral-0 border-l-2 border-neutral-200 overflow-y-auto shadow-elevation-modal">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold text-neutral-600">
            Filtros Avançados
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Cirurgia */}
          <div>
            <Label className="text-sm font-medium text-neutral-600 mb-2 block">
              Cirurgia
            </Label>
            <Input
              placeholder="Digite o nome da cirurgia"
              value={filters.cirurgia}
              onChange={(e) => setCirurgia(e.target.value)}
              className="border-neutral-200 bg-neutral-0"
            />
          </div>

          {/* Data da Cirurgia */}
          <div>
            <Label className="text-sm font-medium text-neutral-600 mb-2 block">
              Data da Cirurgia
            </Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal border-neutral-200 bg-neutral-0",
                      !localDateStart && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localDateStart ? (
                      format(localDateStart, "dd/MM/yyyy")
                    ) : (
                      <span>Início</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-neutral-0 border-2 border-neutral-200 shadow-elevation-modal z-[100]" align="start">
                  <Calendar
                    mode="single"
                    selected={localDateStart}
                    onSelect={setLocalDateStart}
                    initialFocus
                    className="pointer-events-auto bg-neutral-0"
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal border-neutral-200 bg-neutral-0",
                      !localDateEnd && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localDateEnd ? (
                      format(localDateEnd, "dd/MM/yyyy")
                    ) : (
                      <span>Fim</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-neutral-0 border-2 border-neutral-200 shadow-elevation-modal z-[100]" align="start">
                  <Calendar
                    mode="single"
                    selected={localDateEnd}
                    onSelect={setLocalDateEnd}
                    initialFocus
                    className="pointer-events-auto bg-neutral-0"
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Operadora */}
          <div>
            <Label className="text-sm font-medium text-neutral-600 mb-2 block">
              Operadora
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border-2 border-neutral-200 rounded-lg p-3 bg-neutral-0">
              {uniqueOperadoras.map((operadora) => (
                <div key={operadora} className="flex items-center space-x-2">
                  <Checkbox
                    id={`operadora-${operadora}`}
                    checked={filters.operadoras.includes(operadora)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setOperadoras([...filters.operadoras, operadora]);
                      } else {
                        setOperadoras(
                          filters.operadoras.filter((c) => c !== operadora)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`operadora-${operadora}`}
                    className="text-sm text-neutral-600 cursor-pointer"
                  >
                    {operadora}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Paciente */}
          <div>
            <Label className="text-sm font-medium text-neutral-600 mb-2 block">
              Paciente
            </Label>
            <Input
              placeholder="Digite o nome do paciente"
              value={filters.paciente}
              onChange={(e) => setPaciente(e.target.value)}
              className="border-neutral-200 bg-neutral-0"
            />
          </div>

          {/* OPMES */}
          <div>
            <Label className="text-sm font-medium text-neutral-600 mb-2 block">
              OPMES
            </Label>
            <Input
              placeholder="Número de OPMES"
              value={filters.opmes}
              onChange={(e) => setOpmes(e.target.value)}
              className="border-neutral-200 bg-neutral-0"
              type="number"
            />
          </div>

          {/* Porte */}
          <div>
            <Label className="text-sm font-medium text-neutral-600 mb-2 block">
              Porte
            </Label>
            <div className="space-y-2">
              {portes.map((porte) => (
                <div key={porte} className="flex items-center space-x-2">
                  <Checkbox
                    id={`porte-${porte}`}
                    checked={filters.portes.includes(porte)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPortes([...filters.portes, porte]);
                      } else {
                        setPortes(filters.portes.filter((p) => p !== porte));
                      }
                    }}
                  />
                  <label
                    htmlFor={`porte-${porte}`}
                    className="text-sm text-neutral-600 cursor-pointer"
                  >
                    {porte}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Especialidade */}
          <div>
            <Label className="text-sm font-medium text-neutral-600 mb-2 block">
              Especialidade
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border-2 border-neutral-200 rounded-lg p-3 bg-neutral-0">
              {especialidades.map((esp) => (
                <div key={esp} className="flex items-center space-x-2">
                  <Checkbox
                    id={`esp-${esp}`}
                    checked={filters.especialidades.includes(esp)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setEspecialidades([...filters.especialidades, esp]);
                      } else {
                        setEspecialidades(
                          filters.especialidades.filter((e) => e !== esp)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`esp-${esp}`}
                    className="text-sm text-neutral-600 cursor-pointer"
                  >
                    {esp}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-2 border-neutral-300 bg-neutral-0"
            onClick={handleClear}
          >
            Limpar
          </Button>
          <Button
            className="flex-1 bg-brand-400 hover:bg-brand-500 text-neutral-0"
            onClick={handleApply}
          >
            Aplicar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
