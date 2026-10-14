import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, BarChart3, Check } from "lucide-react";
import { Patient } from "@opme/types/patient";
import { LABEL_TIPO_FORNECIMENTO } from "@opme/types/produto";
import { cn } from "@opme/lib/utils";
import { formatNumber } from "@opme/utils/formatters";
import { compradorDoItem, formatBRL, opcaoAtual, opcaoEscolhida, resumoCirurgia, textoDias } from "@opme/lib/produto";
import { nomeComprador } from "@opme/lib/gerencia";
import { useFilters } from "@opme/contexts/FilterContext";
import { useEscolhas } from "@opme/contexts/EscolhasContext";
import { useOtimizador } from "@opme/contexts/OtimizadorContext";
import { analisarCirurgia } from "@opme/lib/otimizador";
import StatusOtimizacao from "./produto/StatusOtimizacao";
import TempoMedioAutorizacao from "./TempoMedioAutorizacao";
import RiscoBadge from "./produto/RiscoBadge";
import ChipHomologacao from "./produto/ChipHomologacao";

// Função para converter dias corridos em dias úteis
const converterParaDiasUteis = (diasCorridos: number): number => {
  // Considera que em 7 dias corridos, 5 são úteis (segunda a sexta)
  return (diasCorridos * 5) / 7;
};

const ESTILO_TIPO_PROCEDIMENTO = {
  Pacote: "bg-warning-100 border-warning-200 text-warning-600",
  Aberto: "bg-red-100 border-red-200 text-red-600",
  Misto: "bg-violet-100 border-violet-200 text-violet-700",
};

interface PatientCardProps {
  patient: Patient;
  onExpand?: (patient: Patient) => void;
}
const PatientCard = ({
  patient,
  onExpand
}: PatientCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { escolhas, escolherVarios } = useEscolhas();
  const { estado } = useOtimizador();
  const {
    filters
  } = useFilters();
  const resumo = resumoCirurgia(patient, escolhas);
  const analise = analisarCirurgia(patient, escolhas, estado);
  const aceitarSugestoes = () =>
    escolherVarios(
      analise.itens.filter((a) => a.situacao === "sugerido" && a.sugerida).map((a) => ({ itemId: a.item.id, cirurgiaId: patient.id, opcao: a.sugerida! }))
    );
  const tipoProcedimento = patient.tipoProcedimento ?? (patient.snPacote === "S" ? "Pacote" : "Aberto");

  const buildBIUrl = () => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.cirurgia) params.set("cirurgia", filters.cirurgia);
    if (filters.convenios.length > 0) params.set("convenios", filters.convenios.join(","));
    if (filters.paciente) params.set("paciente", filters.paciente);
    if (filters.opmes) params.set("opmes", filters.opmes);
    if (filters.portes.length > 0) params.set("portes", filters.portes.join(","));
    if (filters.especialidades.length > 0) params.set("especialidades", filters.especialidades.join(","));
    if (filters.procedimentos.length > 0) params.set("procedimentos", filters.procedimentos.join(","));
    if (filters.operadoras.length > 0) params.set("operadoras", filters.operadoras.join(","));
    if (filters.periodo) params.set("periodo", filters.periodo);
    const queryString = params.toString();
    return `/bi/procedimento/${patient.id}${queryString ? `?${queryString}` : ""}`;
  };
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && onExpand) {
      onExpand(patient);
    }
  };

  return <div className={cn("rounded-lg p-5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 transition-smooth", "bg-[#F0F3F7]", "[box-shadow:0_0_8px_0_rgba(99,109,128,1)]", "hover:[box-shadow:0_0_12px_0_rgba(99,109,128,0.8)]", isExpanded && "ring-2 ring-[#008DDF]")} onClick={handleToggle} role="button" aria-expanded={isExpanded} aria-label={`Card do paciente ${patient.nome}. ${isExpanded ? 'Expandido' : 'Recolhido'}. Pressione Enter ou Espaço para ${isExpanded ? 'recolher' : 'expandir'}.`} tabIndex={0} onKeyDown={e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-[7px] gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("inline-flex items-center px-3 py-1 rounded-pill border text-copy font-semibold uppercase tracking-wide", ESTILO_TIPO_PROCEDIMENTO[tipoProcedimento])}>
            {tipoProcedimento}
          </span>
          <RiscoBadge risco={resumo.riscoAtual} />
        </div>
        <div className="flex items-center gap-2">
          <button className="h-11 px-5 flex items-center gap-2.5 rounded-lg bg-[#008DDF] hover:bg-[#007CC9] transition-smooth text-neutral-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008DDF]" onClick={e => {
          e.stopPropagation();
          navigate(buildBIUrl());
        }} title="Montar o pedido desta cirurgia">
            <BarChart3 className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-[15px] font-bold leading-none">Pedido</span>
          </button>
          {patient.operadoraLogo && <img src={patient.operadoraLogo} alt="Logo operadora" className="w-6 h-6 rounded object-contain" />}
        </div>
      </div>

      {/* Patient Name */}
      <h3 className="text-d5 font-bold text-neutral-600 mb-[7px]">
      {patient.nmPaciente ?? patient.nome}
      </h3>

      {/* Aviso e Etapa do Processo na mesma linha */}
      <div className="flex items-center justify-between mb-[7px]">
        {/* Aviso */}
        {patient.numeroAviso && <p className="text-paragraph font-normal text-neutral-600">
            <span className="text-neutral-500">Aviso:</span> {String(patient.numeroAviso).padStart(3, '0')}
          </p>}

        {/* Etapa do Processo */}
        {patient.etapaProcesso && <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wide">
            {patient.etapaProcesso}
          </span>}
      </div>

      {/* Info */}
      <div className="space-y-[7px] text-paragraph text-neutral-600">
        <p>
          <span className="text-neutral-500 font-normal">Médico:</span> <span className="font-normal">{patient.medico}</span>
        </p>
        <p>
          <span className="text-neutral-500 font-normal">Convênio:</span> <span className="font-normal">{patient.convenio}</span>
        </p>
        <p className="line-clamp-2">
          <span className="text-neutral-500 font-normal">Proc:</span> <span className="font-normal">{patient.procedimento}</span>
        </p>
        <p>
          <span className="text-neutral-500 font-normal">Cirurgia:</span> <span className="font-normal">{patient.dataCirurgia} · {textoDias(patient.diasAteCirurgia)}</span>
        </p>
      </div>

      {/* Margem atual e com a otimização (maior margem entre os indicados) */}
      <div className="mt-3 grid grid-cols-2 rounded-md border border-neutral-200 bg-neutral-0 divide-x divide-neutral-200">
        <div className="px-3 py-2">
          <p className="text-[11px] font-semibold text-neutral-500">Margem atual</p>
          <p className={cn("text-[14px] font-bold tabular-nums", resumo.margemAtual >= 0 ? "text-neutral-600" : "text-status-error-text")}>
            {formatBRL(resumo.margemAtual)}
          </p>
        </div>
        <div className="px-3 py-2" title="Margem com o fornecedor de maior margem entre os indicados pelo médico">
          <p className="text-[11px] font-semibold text-neutral-500">Com otimização</p>
          <p className={cn("text-[14px] font-bold tabular-nums", resumo.margemAtual + analise.ganho >= 0 ? "text-status-success-text" : "text-status-error-text")}>
            {formatBRL(resumo.margemAtual + analise.ganho)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusOtimizacao analise={analise} />
        {analise.status === "sugerida" && (
          <button
            onClick={(e) => { e.stopPropagation(); aceitarSugestoes(); }}
            className="inline-flex items-center gap-1 h-8 px-3 rounded-md bg-[#27AE60] hover:bg-[#229954] text-[12px] font-semibold text-white"
          >
            <Check className="w-3.5 h-3.5" />
            Aceitar
          </button>
        )}
      </div>
      {analise.status === "nao_otimizavel" && analise.motivo && <p className="mt-1 text-[11px] text-red-700">{analise.motivo}</p>}

      {/* Expanded Content */}
      {isExpanded && <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4 card-expanded-content">
          {/* Meta fields grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="col-span-2">
              <p className="text-copy font-semibold text-neutral-500 mb-1">Cirurgia</p>
              <p className="text-paragraph font-normal text-neutral-600">{patient.cirurgia}</p>
              <p className="text-[12px] text-neutral-500 mt-1">
                Tipo identificado automaticamente: <span className="font-semibold text-neutral-600">{tipoProcedimento}</span>
              </p>
            </div>

            <div>
              <p className="text-copy font-semibold text-neutral-500 mb-1">Valor exposto a glosa</p>
              <p className="text-paragraph font-semibold text-status-warning-text">{formatBRL(resumo.valorEmRisco)}</p>
            </div>
            <div>
              <p className="text-copy font-semibold text-neutral-500 mb-1">Pode ganhar com a otimização</p>
              <p className="text-paragraph font-semibold text-status-success-text">+{formatBRL(analise.ganho)}</p>
            </div>

            <div>
              <p className="text-copy font-semibold text-neutral-500 mb-1">Tempo de Autorização</p>
              <p className="text-paragraph font-normal text-neutral-600">
                {patient.tempoAutorizacao !== undefined && patient.tempoAutorizacao !== null
                  ? `${converterParaDiasUteis(patient.tempoAutorizacao).toFixed(1)} dias úteis`
                  : 'N/A'}
              </p>
            </div>
            {patient.cdCirurgia && patient.cdConvenio && (
              <div>
                <p className="text-copy font-semibold text-neutral-500 mb-1">Tempo Médio de Autorização</p>
                <TempoMedioAutorizacao
                  cdCirurgia={patient.cdCirurgia}
                  cdConvenio={patient.cdConvenio}
                />
              </div>
            )}
            <div>
              <p className="text-copy font-semibold text-neutral-500 mb-1">Tempo de Envio</p>
              <p className="text-paragraph font-normal text-neutral-600">
                {patient.tempoEnvio !== undefined && patient.tempoEnvio !== null
                  ? `${converterParaDiasUteis(patient.tempoEnvio).toFixed(1)} dias úteis`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-copy font-semibold text-neutral-500 mb-1">OPMES</p>
              <p className="text-paragraph font-normal text-neutral-600">{formatNumber(patient.opmes)}</p>
            </div>
            <div>
              <p className="text-copy font-semibold text-neutral-500 mb-1">Porte</p>
              <p className="text-paragraph font-normal text-neutral-600">{patient.porte}</p>
            </div>
            {patient.dataCriacaoAviso && <div>
                <p className="text-copy font-semibold text-neutral-500 mb-1">Data criação do aviso</p>
                <p className="text-paragraph font-normal text-neutral-600">{patient.dataCriacaoAviso}</p>
              </div>}
            {patient.dataAgendadaProcedimento && <div>
                <p className="text-copy font-semibold text-neutral-500 mb-1">Data agendada procedimento</p>
                <p className="text-paragraph font-normal text-neutral-600">{patient.dataAgendadaProcedimento}</p>
              </div>}
            {patient.dataAgendadaInternacao && <div>
                <p className="text-copy font-semibold text-neutral-500 mb-1">Data agendada internação</p>
                <p className="text-paragraph font-normal text-neutral-600">{patient.dataAgendadaInternacao}</p>
              </div>}
            {patient.tipoCirurgia && <div>
                <p className="text-copy font-semibold text-neutral-500 mb-1">Tipo da cirurgia</p>
                <p className="text-paragraph font-normal text-neutral-600 capitalize">{patient.tipoCirurgia}</p>
              </div>}
          </div>

          {/* Itens do pedido cirúrgico */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-copy font-semibold text-neutral-600 uppercase tracking-wide">
                ITENS DO PEDIDO
              </h4>
              <div className="flex items-center gap-2">
                <button className="h-11 px-5 flex items-center gap-2.5 rounded-lg bg-[#008DDF] hover:bg-[#007CC9] transition-smooth text-neutral-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008DDF]" onClick={e => {
              e.stopPropagation();
              navigate(buildBIUrl());
            }} title="Montar o pedido desta cirurgia">
                  <BarChart3 className="w-6 h-6" strokeWidth={2.5} />
                  <span className="text-[15px] font-bold leading-none">Pedido</span>
                </button>
              </div>
            </div>

            <div className="h-px bg-cinza-200 mb-3" />

            <ul className="rounded-lg bg-neutral-0 border border-neutral-200 divide-y divide-neutral-100">
              {(patient.itensPedido ?? []).map((item) => {
                const atual = opcaoAtual(item, escolhas);
                const escolhida = opcaoEscolhida(item, escolhas);
                return (
                  <li key={item.id} className="p-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-paragraph text-neutral-600">
                        <span className="text-[11px] font-bold text-neutral-500 mr-1">{item.classe}</span>
                        {atual?.item ?? item.nome} <span className="text-neutral-500">x {item.quantidade}</span>
                      </p>
                      <p className="text-[12px] text-neutral-500 mt-0.5">
                        {atual?.fornecedor ?? item.fornecedor} · {LABEL_TIPO_FORNECIMENTO[item.tipoFornecimento]}
                      </p>
                      {atual && !atual.homologado && <ChipHomologacao operadora={patient.convenio} className="mt-1" />}
                      <p className={cn("text-[11px] font-semibold mt-0.5", escolhida ? "text-status-success-text" : "text-[#007CC9]")}>
                        {!escolhida
                          ? "A definir"
                          : escolhida.origem === "alternativa"
                            ? "Proposta ao médico"
                            : `Fechado por ${nomeComprador(compradorDoItem(item, escolhas))}`}
                      </p>
                    </div>
                    <RiscoBadge risco={atual?.riscoGlosa ?? item.riscoGlosa} />
                  </li>
                );
              })}
              {(patient.itensPedido ?? []).length === 0 && (
                <li className="p-3 text-[13px] text-neutral-500 italic">Pedido ainda não lido.</li>
              )}
            </ul>
          </div>
        </div>}

      {/* Expand indicator */}
      <div className="flex justify-end mt-3" aria-hidden="true">
        <ChevronDown className={cn("w-4 h-4 text-cinza-500 transition-smooth", isExpanded && "rotate-180")} />
      </div>
    </div>;
};
export default PatientCard;
