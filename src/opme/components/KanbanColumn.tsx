import { Patient, Especialidade } from "@opme/types/patient";
import PatientCard from "./PatientCard";
import { useFilters } from "@opme/contexts/FilterContext";
import { Loader2 } from "lucide-react";

interface KanbanColumnProps {
  title: Especialidade;
  /** Linha de apoio sob o título (ex.: quanto a coluna pode ganhar) */
  detalhe?: string;
  patients: Patient[];
  onPatientExpand?: (patient: Patient) => void;
}

const KanbanColumn = ({ title, detalhe, patients, onPatientExpand }: KanbanColumnProps) => {
  const { clearFilters, isLoading } = useFilters();

  return (
    <div className="flex flex-col min-w-[320px] flex-1 pr-2">
      {/* Column Header */}
      <div className="flex items-center mb-6 w-full">
        {/* Caixa esquerda - Nome da coluna */}
        <div className="flex flex-col justify-center flex-1 h-[56px] px-2.5 bg-neutral-100 rounded-l-lg border border-[#9DA5B2]">
          <h2 className="text-base font-bold leading-[1.2] tracking-normal text-[#636D80]">{title}</h2>
          {detalhe && <p className="text-[12px] font-semibold text-status-success-text mt-0.5">{detalhe}</p>}
        </div>
        
        {/* Caixa direita - Número de casos */}
        <div className="flex items-center justify-center min-w-[84px] h-[56px] gap-2.5 px-2.5 bg-[#325AA4] rounded-r-lg border-l-[3px] border-l-[#9DA5B2]">
          <span className="text-2xl font-bold leading-[1.2] tracking-normal text-white">
            {patients.length.toLocaleString('pt-BR')}
          </span>
          {isLoading && (
            <Loader2 className="w-4 h-4 text-white animate-spin ml-1" />
          )}
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {patients.length > 0 ? (
          patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} onExpand={onPatientExpand} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <span className="text-2xl text-cinza-500">📋</span>
            </div>
            <p className="text-sm text-cinza-500 mb-2">Nenhuma cirurgia nesta etapa</p>
            <button 
              onClick={clearFilters}
              className="text-sm text-brand-azul hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
