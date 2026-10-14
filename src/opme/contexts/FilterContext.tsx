import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { Patient, Especialidade } from "@opme/types/patient";
import { usePatients } from "@opme/hooks/usePatients";

export interface FilterState {
  search: string;
  cirurgia: string;
  dateRange: { start: Date | undefined; end: Date | undefined };
  convenios: string[];
  paciente: string;
  opmes: string;
  portes: string[];
  especialidades: Especialidade[];
  procedimentos: string[];
  operadoras: string[];
  periodo: string;
  etapaProcesso: string;
  tipoCirurgia: string;
}

interface FilterContextType {
  filters: FilterState;
  setSearch: (value: string) => void;
  setCirurgia: (value: string) => void;
  setDateRange: (start: Date | undefined, end: Date | undefined) => void;
  setConvenios: (values: string[]) => void;
  setPaciente: (value: string) => void;
  setOpmes: (value: string) => void;
  setPortes: (values: string[]) => void;
  setEspecialidades: (values: Especialidade[]) => void;
  setProcedimentos: (values: string[]) => void;
  setOperadoras: (values: string[]) => void;
  setPeriodo: (value: string) => void;
  setEtapaProcesso: (value: string) => void;
  setTipoCirurgia: (value: string) => void;
  clearFilters: () => void;
  filteredPatients: Patient[];
  getFilteredBySpecialty: (specialty: Especialidade) => Patient[];
  isLoading: boolean;
  etapasProcesso: string[];
}

const initialFilters: FilterState = {
  search: "",
  cirurgia: "",
  dateRange: { start: undefined, end: undefined },
  convenios: [],
  paciente: "",
  opmes: "",
  portes: [],
  especialidades: [],
  procedimentos: [],
  operadoras: [],
  periodo: "",
  etapaProcesso: "",
  tipoCirurgia: "",
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const { data: allPatients = [], isLoading } = usePatients();
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const filteredPatients = useMemo(() => {
    let results = [...allPatients];

    // Search filter (nome, procedimento, medico, aviso de cirurgia)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.nome.toLowerCase().includes(searchLower) ||
          p.procedimento.toLowerCase().includes(searchLower) ||
          p.medico.toLowerCase().includes(searchLower) ||
          (p.numeroAviso && String(p.numeroAviso).includes(searchLower)) ||
          (p.codigoAviso && p.codigoAviso.toLowerCase().includes(searchLower))
      );
    }

    // Cirurgia filter
    if (filters.cirurgia) {
      const cirurgiaLower = filters.cirurgia.toLowerCase();
      results = results.filter((p) =>
        p.cirurgia.toLowerCase().includes(cirurgiaLower)
      );
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      results = results.filter((p) => {
        const [day, month, year] = p.dataCirurgia.split("/");
        const patientDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );

        if (filters.dateRange.start && patientDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && patientDate > filters.dateRange.end) {
          return false;
        }
        return true;
      });
    }

    // Convenios filter
    if (filters.convenios.length > 0) {
      results = results.filter((p) => filters.convenios.includes(p.convenio));
    }

    // Paciente filter
    if (filters.paciente) {
      const pacienteLower = filters.paciente.toLowerCase();
      results = results.filter((p) =>
        p.nome.toLowerCase().includes(pacienteLower)
      );
    }

    // OPMES filter
    if (filters.opmes) {
      const opmesNum = parseInt(filters.opmes);
      if (!isNaN(opmesNum)) {
        results = results.filter((p) => p.opmes === opmesNum);
      }
    }

    // Portes filter
    if (filters.portes.length > 0) {
      results = results.filter((p) => filters.portes.includes(p.porte));
    }

    // Especialidades filter
    if (filters.especialidades.length > 0) {
      results = results.filter((p) =>
        filters.especialidades.includes(p.especialidade)
      );
    }

    // Procedimentos filter
    if (filters.procedimentos.length > 0) {
      results = results.filter((p) =>
        filters.procedimentos.includes(p.procedimento)
      );
    }

    // Operadoras filter
    if (filters.operadoras.length > 0) {
      results = results.filter((p) => filters.operadoras.includes(p.convenio));
    }

    // Periodo filter (applied via date range)
    if (filters.periodo && filters.periodo !== "personalizado") {
      const hoje = new Date();
      const dataInicio = new Date();

      if (filters.periodo === "7dias") {
        dataInicio.setDate(hoje.getDate() - 7);
      } else if (filters.periodo === "30dias") {
        dataInicio.setDate(hoje.getDate() - 30);
      } else if (filters.periodo === "90dias") {
        dataInicio.setDate(hoje.getDate() - 90);
      }

      results = results.filter((p) => {
        const [day, month, year] = p.dataCirurgia.split("/");
        const patientDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
        return patientDate >= dataInicio && patientDate <= hoje;
      });
    }

    // Etapa Processo filter
    if (filters.etapaProcesso) {
      results = results.filter((p) => p.etapaProcesso === filters.etapaProcesso);
    }

    // Tipo de Cirurgia filter
    if (filters.tipoCirurgia) {
      results = results.filter((p) => p.tipoCirurgia === filters.tipoCirurgia);
    }

    return results;
  }, [filters, allPatients]);

  const getFilteredBySpecialty = (specialty: Especialidade): Patient[] => {
    return filteredPatients.filter((p) => p.especialidade === specialty);
  };

  // Extract unique etapas do processo from all patients
  const etapasProcesso = useMemo(() => {
    const etapas = new Set<string>();
    allPatients.forEach((p) => {
      if (p.etapaProcesso) {
        etapas.add(p.etapaProcesso);
      }
    });
    return Array.from(etapas).sort();
  }, [allPatients]);

  const value: FilterContextType = {
    filters,
    setSearch: (value) => setFilters((f) => ({ ...f, search: value })),
    setCirurgia: (value) => setFilters((f) => ({ ...f, cirurgia: value })),
    setDateRange: (start, end) =>
      setFilters((f) => ({ ...f, dateRange: { start, end } })),
    setConvenios: (values) => setFilters((f) => ({ ...f, convenios: values })),
    setPaciente: (value) => setFilters((f) => ({ ...f, paciente: value })),
    setOpmes: (value) => setFilters((f) => ({ ...f, opmes: value })),
    setPortes: (values) => setFilters((f) => ({ ...f, portes: values })),
    setEspecialidades: (values) =>
      setFilters((f) => ({ ...f, especialidades: values })),
    setProcedimentos: (values) =>
      setFilters((f) => ({ ...f, procedimentos: values })),
    setOperadoras: (values) =>
      setFilters((f) => ({ ...f, operadoras: values })),
    setPeriodo: (value) => setFilters((f) => ({ ...f, periodo: value })),
    setEtapaProcesso: (value) => setFilters((f) => ({ ...f, etapaProcesso: value })),
    setTipoCirurgia: (value) => setFilters((f) => ({ ...f, tipoCirurgia: value })),
    clearFilters: () => setFilters(initialFilters),
    filteredPatients,
    getFilteredBySpecialty,
    isLoading,
    etapasProcesso,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider");
  }
  return context;
};
