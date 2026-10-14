import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X, Filter, Search, Calendar } from "lucide-react";
import { cn } from "@opme/lib/utils";
import { Button } from "@opme/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@opme/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@opme/components/ui/popover";
import {
  biGeralProvider,
  FiltrosDinamicos,
  OpcoesFiltros,
  RankingsFiltrados,
} from "@opme/services/biGeralProvider";

interface FiltrosDinamicosBIProps {
  onRankingsChange: (rankings: RankingsFiltrados | null) => void;
}

export function FiltrosDinamicosBI({ onRankingsChange }: FiltrosDinamicosBIProps) {
  const [opcoes, setOpcoes] = useState<OpcoesFiltros>({
    operadoras: [],
    especialidades: [],
    cirurgias: [],
  });

  const [filtros, setFiltros] = useState<FiltrosDinamicos>({
    operadora: undefined,
    especialidade: undefined,
    cirurgia: undefined,
    dataInicio: undefined,
    dataFim: undefined,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Popover states
  const [openOperadora, setOpenOperadora] = useState(false);
  const [openEspecialidade, setOpenEspecialidade] = useState(false);
  const [openCirurgia, setOpenCirurgia] = useState(false);

  // Carrega opções de filtros ao montar
  useEffect(() => {
    const loadOpcoes = async () => {
      const opcoesData = await biGeralProvider.getOpcoesFiltros();
      setOpcoes(opcoesData);
    };
    loadOpcoes();
  }, []);

  // Função para buscar rankings
  const handleFiltrar = async () => {
    const hasAnyFilter = filtros.operadora || filtros.especialidade || filtros.cirurgia || filtros.dataInicio || filtros.dataFim;

    if (!hasAnyFilter) {
      onRankingsChange(null);
      return;
    }

    setIsLoading(true);
    try {
      const rankings = await biGeralProvider.getRankingsFiltrados(filtros);
      onRankingsChange(rankings);
    } catch (error) {
      console.error("Erro ao buscar rankings:", error);
      onRankingsChange(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimparFiltros = () => {
    setFiltros({
      operadora: undefined,
      especialidade: undefined,
      cirurgia: undefined,
      dataInicio: undefined,
      dataFim: undefined,
    });
    onRankingsChange(null);
  };

  const hasAnyFilter = filtros.operadora || filtros.especialidade || filtros.cirurgia || filtros.dataInicio || filtros.dataFim;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Análise por Filtros
          </h2>
          <p className="text-[12px] text-cinza-500 mt-1">
            Selecione os filtros e clique em "Filtrar" para ver os Top 20 Fornecedores e Itens OPME
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasAnyFilter && (
            <button
              type="button"
              onClick={handleLimparFiltros}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-white text-red-600 border border-red-400 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar Tudo
            </button>
          )}
          <button
            type="button"
            onClick={handleFiltrar}
            disabled={!hasAnyFilter || isLoading}
            className="inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4 mr-2" />
            {isLoading ? "Filtrando..." : "Filtrar"}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Operadora */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-cinza-600 uppercase tracking-wide">
            Operadora
          </label>
          <Popover open={openOperadora} onOpenChange={setOpenOperadora}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openOperadora}
                className="w-full justify-between font-normal h-10 text-[13px]"
              >
                <span className="truncate">
                  {filtros.operadora || "Selecione..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar operadora..." />
                <CommandList>
                  <CommandEmpty>Nenhuma operadora encontrada.</CommandEmpty>
                  <CommandGroup>
                    {opcoes.operadoras.map((operadora) => (
                      <CommandItem
                        key={operadora}
                        value={operadora}
                        onSelect={() => {
                          setFiltros((prev) => ({
                            ...prev,
                            operadora: operadora === prev.operadora ? undefined : operadora,
                          }));
                          setOpenOperadora(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filtros.operadora === operadora ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {operadora}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Especialidade */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-cinza-600 uppercase tracking-wide">
            Especialidade
          </label>
          <Popover open={openEspecialidade} onOpenChange={setOpenEspecialidade}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openEspecialidade}
                className="w-full justify-between font-normal h-10 text-[13px]"
              >
                <span className="truncate">
                  {filtros.especialidade || "Selecione..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar especialidade..." />
                <CommandList>
                  <CommandEmpty>Nenhuma especialidade encontrada.</CommandEmpty>
                  <CommandGroup>
                    {opcoes.especialidades.map((especialidade) => (
                      <CommandItem
                        key={especialidade}
                        value={especialidade}
                        onSelect={() => {
                          setFiltros((prev) => ({
                            ...prev,
                            especialidade: especialidade === prev.especialidade ? undefined : especialidade,
                          }));
                          setOpenEspecialidade(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filtros.especialidade === especialidade ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {especialidade}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Cirurgia */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-cinza-600 uppercase tracking-wide">
            Cirurgia
          </label>
          <Popover open={openCirurgia} onOpenChange={setOpenCirurgia}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCirurgia}
                className="w-full justify-between font-normal h-10 text-[13px]"
              >
                <span className="truncate">
                  {filtros.cirurgia || "Selecione..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar cirurgia..." />
                <CommandList>
                  <CommandEmpty>Nenhuma cirurgia encontrada.</CommandEmpty>
                  <CommandGroup>
                    {opcoes.cirurgias.map((cirurgia) => (
                      <CommandItem
                        key={cirurgia}
                        value={cirurgia}
                        onSelect={() => {
                          setFiltros((prev) => ({
                            ...prev,
                            cirurgia: cirurgia === prev.cirurgia ? undefined : cirurgia,
                          }));
                          setOpenCirurgia(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filtros.cirurgia === cirurgia ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="truncate">{cirurgia}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Data Início */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-cinza-600 uppercase tracking-wide">
            Data Início
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cinza-400 pointer-events-none" />
            <input
              type="date"
              value={filtros.dataInicio || ""}
              onChange={(e) =>
                setFiltros((prev) => ({
                  ...prev,
                  dataInicio: e.target.value || undefined,
                }))
              }
              className="w-full h-10 pl-9 pr-3 text-[13px] rounded-md border border-input bg-background hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Data Fim */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-cinza-600 uppercase tracking-wide">
            Data Fim
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cinza-400 pointer-events-none" />
            <input
              type="date"
              value={filtros.dataFim || ""}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setFiltros((prev) => ({
                  ...prev,
                  dataFim: e.target.value || undefined,
                }))
              }
              className="w-full h-10 pl-9 pr-3 text-[13px] rounded-md border border-input bg-background hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-4">
          <p className="text-[13px] text-cinza-500">Carregando rankings...</p>
        </div>
      )}
    </section>
  );
}
