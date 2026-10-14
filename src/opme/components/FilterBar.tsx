import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useFilters } from "@opme/contexts/FilterContext";
import { FilterDialog } from "./FilterDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@opme/components/ui/popover";
import { Button } from "@opme/components/ui/button";
const FilterBar = () => {
  const {
    filters,
    setSearch,
    setPeriodo,
    setEtapaProcesso,
    setTipoCirurgia,
    etapasProcesso
  } = useFilters();
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [periodoOpen, setPeriodoOpen] = useState(false);
  const [etapaOpen, setEtapaOpen] = useState(false);
  const [tipoCirurgiaOpen, setTipoCirurgiaOpen] = useState(false);

  const periodoOptions = [{
    value: "7dias",
    label: "Últimos 7 dias"
  }, {
    value: "30dias",
    label: "Últimos 30 dias"
  }, {
    value: "90dias",
    label: "Últimos 90 dias"
  }, {
    value: "personalizado",
    label: "Personalizado"
  }];
  const periodoDisplay = periodoOptions.find(p => p.value === filters.periodo)?.label || "Período";
  const etapaDisplay = filters.etapaProcesso || "Etapa do Processo";
  
  const tipoCirurgiaOptions = [
    { value: "", label: "Todos os Tipos" },
    { value: "eletiva", label: "Eletiva" },
    { value: "urgencia", label: "Urgência" },
    { value: "emergencia", label: "Emergência" }
  ];
  const tipoCirurgiaDisplay = tipoCirurgiaOptions.find(t => t.value === filters.tipoCirurgia)?.label || "Tipo de Cirurgia";
  return <>
      <div className="sticky top-0 z-10 bg-neutral-0 px-6 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input type="text" placeholder="Buscar paciente, procedimento, médico ou aviso de cirurgia" value={filters.search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-3 border border-neutral-200 rounded-lg text-paragraph text-neutral-600 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#f0f3f7]" />
          </div>

          {/* Filter button */}
          <button onClick={() => setFilterDialogOpen(true)} className="h-10 px-4 flex items-center gap-2 bg-neutral-100 border border-neutral-200 rounded-lg hover:bg-brand-100 transition-colors">
            <SlidersHorizontal className="w-5 h-5 text-neutral-500" />
            <span className="text-paragraph font-semibold text-neutral-600">Filtros</span>
          </button>

          {/* Período dropdown */}
          <Popover open={periodoOpen} onOpenChange={setPeriodoOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 px-4 justify-between min-w-[140px] bg-neutral-100 border-neutral-200 hover:bg-brand-100">
                <span className="text-paragraph font-semibold text-neutral-600 truncate">
                  {periodoDisplay}
                </span>
                <ChevronDown className="w-5 h-5 text-neutral-500 ml-2 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 bg-neutral-0 border-2 border-neutral-200 shadow-elevation-modal z-[100]" align="start">
              <div className="space-y-1">
                {periodoOptions.map(option => <button key={option.value} onClick={() => {
                setPeriodo(option.value);
                if (option.value === "personalizado") {
                  setFilterDialogOpen(true);
                }
                setPeriodoOpen(false);
              }} className="w-full text-left px-3 py-2.5 text-paragraph text-neutral-600 hover:bg-brand-100 rounded-lg transition-colors">
                    {option.label}
                  </button>)}
              </div>
            </PopoverContent>
          </Popover>

          {/* Etapa do Processo dropdown */}
          <Popover open={etapaOpen} onOpenChange={setEtapaOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 px-4 justify-between min-w-[170px] bg-neutral-100 border-neutral-200 hover:bg-brand-100">
                <span className="text-paragraph font-semibold text-neutral-600 truncate">
                  {etapaDisplay}
                </span>
                <ChevronDown className="w-5 h-5 text-neutral-500 ml-2 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 bg-neutral-0 border-2 border-neutral-200 shadow-elevation-modal z-[100]" align="start">
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                <button
                  onClick={() => {
                    setEtapaProcesso("");
                    setEtapaOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-paragraph text-neutral-600 hover:bg-brand-100 rounded-lg transition-colors"
                >
                  Todas as Etapas
                </button>
                {etapasProcesso.map(etapa => <button
                  key={etapa}
                  onClick={() => {
                    setEtapaProcesso(etapa);
                    setEtapaOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-paragraph text-neutral-600 hover:bg-brand-100 rounded-lg transition-colors"
                >
                    {etapa}
                  </button>)}
              </div>
            </PopoverContent>
          </Popover>

          {/* Tipo de Cirurgia dropdown */}
          <Popover open={tipoCirurgiaOpen} onOpenChange={setTipoCirurgiaOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 px-4 justify-between min-w-[160px] bg-neutral-100 border-neutral-200 hover:bg-brand-100">
                <span className="text-paragraph font-semibold text-neutral-600 truncate">
                  {tipoCirurgiaDisplay}
                </span>
                <ChevronDown className="w-5 h-5 text-neutral-500 ml-2 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 bg-neutral-0 border-2 border-neutral-200 shadow-elevation-modal z-[100]" align="start">
              <div className="space-y-1">
                {tipoCirurgiaOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTipoCirurgia(option.value);
                      setTipoCirurgiaOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-paragraph text-neutral-600 hover:bg-brand-100 rounded-lg transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <FilterDialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen} />
    </>;
};
export default FilterBar;