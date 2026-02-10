import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Download, Save, TrendingUp, AlertTriangle, Shield,
  User, Stethoscope, Building, FileText, Package, Send, BarChart3,
  ShieldCheck, ShieldAlert, CircleDot, ClipboardList, FileWarning,
  Lightbulb, ArrowRight, XCircle
} from "lucide-react";
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
  const missingOptional = state.documents.filter((d) => !d.required && !d.attached);
  const conformidade = missingRequired.length === 0 ? 100 : Math.round(((state.documents.filter(d => d.required).length - missingRequired.length) / state.documents.filter(d => d.required).length) * 100);

  const linkedProcs = state.linkedProcedures.map(code => mockLinkedProcedures.find(p => p.code === code)).filter(Boolean);

  // Build improvement suggestions
  const suggestions = useMemo(() => {
    const tips: { text: string; impact: string; type: "rent" | "glosa" | "docs" }[] = [];

    // Check for offender items that could be swapped
    const offenders = state.extractedItems.filter(item => {
      const v = getItemVerdict(item.name);
      return v && (v.label === "Ofensor" || v.label === "Prejuízo");
    });
    if (offenders.length > 0) {
      tips.push({ text: `Substitua ${offenders.length} item(ns) ofensor(es) por equivalentes técnicos`, impact: "+R$ 400~800", type: "rent" });
    }

    const glossItems = state.extractedItems.filter(item => {
      const v = getItemVerdict(item.name);
      return v && v.label === "Risco glosa";
    });
    if (glossItems.length > 0) {
      tips.push({ text: `${glossItems.length} item(ns) com risco de glosa — considere alternativas`, impact: "-5% glosa", type: "glosa" });
    }

    if (missingRequired.length > 0) {
      tips.push({ text: `Anexe ${missingRequired.length} documento(s) obrigatório(s) para aumentar conformidade`, impact: "+conformidade", type: "docs" });
    }

    // Check if there are high-rent procedures not added
    const unusedHighRent = mockLinkedProcedures.filter(p => p.improvesRent && !p.isOfensor && !state.linkedProcedures.includes(p.code));
    if (unusedHighRent.length > 0) {
      const totalPossible = unusedHighRent.reduce((a, p) => a + (parseInt(p.rentabilityDelta.replace(/[^\d-]/g, "")) || 0), 0);
      if (totalPossible > 0) {
        tips.push({ text: `Adicione ${unusedHighRent.length} procedimento(s) secundário(s) disponíveis`, impact: `+R$ ${totalPossible}`, type: "rent" });
      }
    }

    return tips;
  }, [state]);

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8 space-y-5 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Guia de Solicitação Cirúrgica</h2>
            <p className="text-muted-foreground text-xs">Revisão final — {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { saveRequest("draft"); navigate("/home"); }}>
            <Save className="w-4 h-4 mr-1" /> Rascunho
          </Button>
          <Button size="sm" onClick={() => { saveRequest("awaiting-auth"); resetWizard(); navigate("/home"); }}>
            <Send className="w-4 h-4 mr-1" /> Finalizar e Enviar
          </Button>
        </div>
      </div>

      {/* Big numbers */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-4 text-center">
          <TrendingUp className={`w-5 h-5 mx-auto mb-1 ${rentColor}`} />
          <div className={`text-3xl font-extrabold tracking-tight ${rentColor}`}>+{state.rentabilityScore}%</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Rentabilidade Estimada</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${glossColor}`} />
          <div className={`text-3xl font-extrabold tracking-tight ${glossColor}`}>{state.glossRisk}%</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Risco de Glosa</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Shield className={`w-5 h-5 mx-auto mb-1 ${conformidade === 100 ? "text-success" : "text-warning"}`} />
          <div className={`text-3xl font-extrabold tracking-tight ${conformidade === 100 ? "text-success" : "text-warning"}`}>{conformidade}%</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Conformidade</div>
        </div>
      </div>

      {/* Guide content */}
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Patient / Doctor / Operadora header */}
        <div className="bg-muted/30 border-b px-5 py-3">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
                <User className="w-3 h-3" /> Paciente
              </div>
              <div className="font-semibold text-foreground">{state.patient?.name || "—"}</div>
              <div className="text-muted-foreground mt-0.5">CPF: {state.patient?.cpf || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
                <Stethoscope className="w-3 h-3" /> Médico
              </div>
              <div className="font-semibold text-foreground">{state.doctor?.name || "—"}</div>
              <div className="text-muted-foreground mt-0.5">{state.doctor?.specialty} · {state.doctor?.crm}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
                <Building className="w-3 h-3" /> Operadora
              </div>
              <div className="font-semibold text-foreground">{state.operadora?.name || "—"}</div>
            </div>
          </div>
        </div>

        {/* Procedures */}
        <div className="px-5 py-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Procedimentos ({1 + linkedProcs.length})
            </span>
          </div>
          {/* Principal */}
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-primary/5 border border-primary/20 mb-1.5">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="font-semibold text-foreground">{state.selectedProcedure?.name || "—"}</span>
              <span className="text-muted-foreground font-mono">{state.selectedProcedure?.code}</span>
            </div>
            <span className="text-[10px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10">Principal</span>
          </div>
          {/* Secondary */}
          {linkedProcs.map((proc) => proc && (
            <div key={proc.code} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 mb-1 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                <span className="text-foreground">{proc.name}</span>
                <span className="text-muted-foreground font-mono">{proc.code}</span>
              </div>
              <span className={cn("font-bold tabular-nums", proc.rentabilityDelta.startsWith("+") ? "text-success" : "text-destructive")}>
                {proc.rentabilityDelta}
              </span>
            </div>
          ))}
        </div>

        {/* Items OPME */}
        <div className="px-5 py-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Itens OPME ({state.extractedItems.length})
            </span>
          </div>
          <div className="space-y-1">
            {state.extractedItems.map((item) => {
              const verdict = getItemVerdict(item.name);
              const Icon = verdict?.icon;
              return (
                <div key={item.id} className={cn("flex items-center justify-between py-2 px-3 rounded-lg text-xs", verdict?.bg || "bg-muted/30")}>
                  <div className="flex items-center gap-2 min-w-0">
                    {Icon && <Icon className={cn("w-3.5 h-3.5 shrink-0", verdict?.color)} />}
                    <span className="font-medium text-foreground truncate">{item.name}</span>
                    {item.supplier && <span className="text-muted-foreground shrink-0">· {item.supplier}</span>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    {verdict && verdict.label !== "OK" && (
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
                        verdict.label === "Melhor opção" && "badge-success",
                        (verdict.label === "Ofensor" || verdict.label === "Prejuízo") && "badge-danger",
                        verdict.label === "Risco glosa" && "badge-warning",
                      )}>{verdict.label}</span>
                    )}
                    <span className="text-muted-foreground tabular-nums">×{item.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Documents */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Documentos
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {attachedDocs.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-success/5 text-xs">
                <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                <span className="text-foreground">{doc.name}</span>
              </div>
            ))}
            {missingRequired.map((doc, idx) => (
              <div key={`mr-${idx}`} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-destructive/5 text-xs">
                <XCircle className="w-3 h-3 text-destructive shrink-0" />
                <span className="text-foreground">{doc.name}</span>
                <span className="text-[9px] text-destructive font-semibold ml-auto">Obrigatório</span>
              </div>
            ))}
            {missingOptional.map((doc, idx) => (
              <div key={`mo-${idx}`} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-muted/30 text-xs">
                <FileWarning className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{doc.name}</span>
                <span className="text-[9px] text-muted-foreground ml-auto">Opcional</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Improvement suggestions */}
      {suggestions.length > 0 && (
        <div className="glass-card rounded-xl p-4 border-accent/20">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Sugestões de Melhoria</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((tip, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/30 text-xs">
                <ArrowRight className={cn("w-3.5 h-3.5 shrink-0",
                  tip.type === "rent" ? "text-success" : tip.type === "glosa" ? "text-warning" : "text-primary"
                )} />
                <span className="text-foreground flex-1">{tip.text}</span>
                <span className={cn("font-bold tabular-nums shrink-0",
                  tip.type === "rent" ? "text-success" : tip.type === "glosa" ? "text-warning" : "text-primary"
                )}>{tip.impact}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StepSummary;
