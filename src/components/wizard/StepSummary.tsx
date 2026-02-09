import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Save, TrendingUp, AlertTriangle, Shield, User, Stethoscope, Building, FileText, Package, Send, BarChart3, ShieldCheck, ShieldAlert, ArrowLeftRight, CircleDot, ClipboardCheck, Clock, FileWarning } from "lucide-react";
import { mockLinkedProcedures, mockRecommendedOPMEs } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const getItemVerdict = (name: string) => {
  const nameLower = name.toLowerCase();
  const exact = mockRecommendedOPMEs.find(o => o.name.toLowerCase() === nameLower);
  const similar = !exact ? mockRecommendedOPMEs.find(o => {
    const oW = o.name.toLowerCase().split(/\s+/);
    const iW = nameLower.split(/\s+/);
    return oW.filter(w => iW.some(iw => iw.includes(w) || w.includes(iw))).length >= 2;
  }) : undefined;
  const matched = exact || similar;
  if (!matched) return null;
  if (matched.isOfensor && matched.isGlosado) return { label: "Prejuízo", color: "text-destructive", bg: "bg-destructive/10", icon: ShieldAlert };
  if (matched.isOfensor) return { label: "Ofensor", color: "text-destructive", bg: "bg-destructive/10", icon: ShieldAlert };
  if (matched.isGlosado) return { label: "Risco glosa", color: "text-warning", bg: "bg-warning/10", icon: AlertTriangle };
  if (matched.improvesRent) return { label: "Melhor opção", color: "text-success", bg: "bg-success/10", icon: ShieldCheck };
  return { label: "OK", color: "text-muted-foreground", bg: "bg-muted", icon: CircleDot };
};

const StepSummary = () => {
  const { state, saveRequest, resetWizard } = useSurgical();
  const navigate = useNavigate();

  const rentColor = state.rentabilityScore > 15 ? "text-success" : state.rentabilityScore > 0 ? "text-warning" : "text-destructive";
  const glossColor = state.glossRisk < 15 ? "text-success" : state.glossRisk < 30 ? "text-warning" : "text-destructive";
  const attachedDocs = state.documents.filter((d) => d.attached);
  const missingRequired = state.documents.filter((d) => d.required && !d.attached);

  // Build pending steps for surgery
  const pendingSteps = useMemo(() => {
    const hasOffenders = state.extractedItems.some(item => {
      const v = getItemVerdict(item.name);
      return v && (v.label === "Ofensor" || v.label === "Prejuízo");
    });
    const hasGlossRisk = state.extractedItems.some(item => {
      const v = getItemVerdict(item.name);
      return v && v.label === "Risco glosa";
    });

    const steps = [
      { title: "Autorização da Operadora", description: "Aguardando aprovação da guia pela operadora", status: "pending" as const, icon: Clock },
      { title: "Documentação Completa", description: `${missingRequired.length} documento(s) obrigatório(s) pendente(s)`, status: missingRequired.length > 0 ? "warning" as const : "done" as const, icon: missingRequired.length > 0 ? FileWarning : CheckCircle2 },
      { title: "OPMEs Confirmados", description: hasOffenders ? "Existem itens ofensores não substituídos" : hasGlossRisk ? "Itens com risco de glosa identificados" : "Todos os itens conferidos", status: hasOffenders ? "warning" as const : hasGlossRisk ? "attention" as const : "done" as const, icon: hasOffenders ? ShieldAlert : hasGlossRisk ? AlertTriangle : ShieldCheck },
      { title: "Agendamento Cirúrgico", description: "Centro cirúrgico e equipe a confirmar", status: "pending" as const, icon: Clock },
      { title: "Cotação OPME (3 fornecedores)", description: "Cotações de pelo menos 3 fornecedores", status: "pending" as const, icon: Clock },
      { title: "Exames Pré-Operatórios", description: "Validação de exames dentro da validade", status: "pending" as const, icon: Clock },
    ];
    return steps;
  }, [state, missingRequired]);

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Resumo da Solicitação</h2>
          <p className="text-muted-foreground text-sm">Revise todos os dados antes de enviar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { saveRequest("draft"); navigate("/home"); }}>
            <Save className="w-4 h-4 mr-1" /> Rascunho
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" /> Pacote
          </Button>
          <Button size="sm" onClick={() => { saveRequest("awaiting-auth"); resetWizard(); navigate("/home"); }}>
            <Send className="w-4 h-4 mr-1" /> Finalizar
          </Button>
        </div>
      </div>

      {/* Alert */}
      {missingRequired.length > 0 && (
        <div className="rounded-xl border-2 border-warning/40 bg-warning/10 p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">Documentos obrigatórios pendentes</p>
            <p className="text-xs text-muted-foreground">{missingRequired.map(d => d.name).join(", ")}</p>
          </div>
        </div>
      )}

      {/* Top row: scores + info */}
      <div className="grid grid-cols-12 gap-4">
        {/* Score cards - compact row */}
        <div className="col-span-12 grid grid-cols-4 gap-3">
          <div className="glass-card rounded-xl p-4 text-center">
            <TrendingUp className={`w-5 h-5 mx-auto mb-1 ${rentColor}`} />
            <div className={`text-2xl font-bold tracking-tight ${rentColor}`}>+{state.rentabilityScore}%</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Rentabilidade</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${glossColor}`} />
            <div className={`text-2xl font-bold tracking-tight ${glossColor}`}>{state.glossRisk}%</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Risco de Glosa</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <BarChart3 className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-2xl font-bold tracking-tight text-primary">P{state.historicalPercentile || 72}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Percentil Histórico</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Shield className="w-5 h-5 mx-auto mb-1 text-info" />
            <div className="text-2xl font-bold tracking-tight text-info">92%</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Conformidade</div>
          </div>
        </div>

        {/* Left column: info + procedures */}
        <div className="col-span-5 space-y-3">
          {/* Info grid 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-xl p-4">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-2">
                <Stethoscope className="w-3 h-3" /> Médico
              </div>
              <div className="text-sm font-medium text-foreground">{state.doctor?.name || "—"}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{state.doctor?.specialty} · {state.doctor?.crm}</div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-2">
                <User className="w-3 h-3" /> Paciente
              </div>
              <div className="text-sm font-medium text-foreground">{state.patient?.name || "—"}</div>
              <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                <div>CPF: {state.patient?.cpf || "—"}</div>
                <div>Nascimento: {state.patient?.birthDate ? new Date(state.patient.birthDate + "T12:00:00").toLocaleDateString("pt-BR") : "—"}</div>
                <div>Tel: {state.patient?.phone || "—"}</div>
                <div>Mãe: {state.patient?.motherName || "—"}</div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-2">
                <Building className="w-3 h-3" /> Operadora
              </div>
              <div className="text-sm font-medium text-foreground">{state.operadora?.name || "—"}</div>
            </div>
            <div className="glass-card rounded-xl p-4 col-span-2">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-2">
                <FileText className="w-3 h-3" /> Procedimentos
              </div>
              <div className="text-sm font-medium text-foreground">{state.selectedProcedure?.name || "—"}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{state.selectedProcedure?.code} · Principal</div>
              {state.linkedProcedures.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                  {state.linkedProcedures.map((code) => {
                    const proc = mockLinkedProcedures.find((p) => p.code === code);
                    return proc ? (
                      <div key={code} className="flex items-center justify-between py-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-success" />
                          <span className="text-foreground">{proc.name}</span>
                          <span className="text-muted-foreground">· {proc.code}</span>
                        </div>
                        <span className={cn("font-semibold", proc.rentabilityDelta.startsWith("+") ? "text-success" : "text-destructive")}>{proc.rentabilityDelta}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="glass-card rounded-xl p-4">
            <div className="text-xs font-semibold text-foreground mb-2">Documentos ({attachedDocs.length} anexados)</div>
            {attachedDocs.length > 0 ? (
              <div className="space-y-1">
                {attachedDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 py-1 text-xs">
                    <CheckCircle2 className="w-3 h-3 text-success" />
                    <span className="text-foreground">{doc.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Nenhum documento anexado</p>
            )}
          </div>
        </div>

        {/* Right column: Items */}
        <div className="col-span-7">
          <div className="glass-card rounded-xl p-4 h-full">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Itens / OPMEs ({state.extractedItems.length})</span>
            </div>
            <div className="space-y-1 max-h-[450px] overflow-y-auto pr-1">
              {state.extractedItems.map((item) => {
                const verdict = getItemVerdict(item.name);
                const Icon = verdict?.icon;
                return (
                  <div key={item.id} className={cn("flex items-center justify-between py-2 px-3 rounded-lg text-xs", verdict?.bg || "bg-muted/50")}>
                    <div className="flex items-center gap-2 min-w-0">
                      {Icon && <Icon className={cn("w-3.5 h-3.5 shrink-0", verdict?.color)} />}
                      <span className="font-medium text-foreground truncate">{item.name}</span>
                      {item.supplier && <span className="text-muted-foreground shrink-0">· {item.supplier}</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {verdict && verdict.label !== "OK" && (
                        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border", 
                          verdict.label === "Melhor opção" && "badge-success",
                          verdict.label === "Ofensor" && "badge-danger",
                          verdict.label === "Prejuízo" && "badge-danger",
                          verdict.label === "Risco glosa" && "badge-warning",
                        )}>{verdict.label}</span>
                      )}
                      <span className="text-muted-foreground">Qtd: {item.quantity}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pending steps for surgery */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardCheck className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Pendências para Realização da Cirurgia</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {pendingSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={cn(
                  "glass-card rounded-xl p-4 flex items-start gap-3 transition-all",
                  step.status === "warning" && "border-destructive/30 bg-destructive/5",
                  step.status === "attention" && "border-warning/30 bg-warning/5",
                  step.status === "done" && "border-success/30 bg-success/5",
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  step.status === "done" && "bg-success/15 text-success",
                  step.status === "warning" && "bg-destructive/15 text-destructive",
                  step.status === "attention" && "bg-warning/15 text-warning",
                  step.status === "pending" && "bg-muted text-muted-foreground",
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground">{step.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepSummary;
