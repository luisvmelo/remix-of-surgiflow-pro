import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Save, TrendingUp, AlertTriangle, Shield, User, Stethoscope, Building, FileText, Package, Send, BarChart3 } from "lucide-react";
import { mockLinkedProcedures } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const StepSummary = () => {
  const { state } = useSurgical();

  const rentColor = state.rentabilityScore > 15 ? "text-success" : state.rentabilityScore > 0 ? "text-warning" : "text-destructive";
  const glossColor = state.glossRisk < 15 ? "text-success" : state.glossRisk < 30 ? "text-warning" : "text-destructive";
  const attachedDocs = state.documents.filter((d) => d.attached);
  const missingRequired = state.documents.filter((d) => d.required && !d.attached);

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Resumo da Solicitação</h2>
        <p className="text-muted-foreground">Revise todos os dados antes de enviar</p>
      </div>

      {/* Alerts */}
      {missingRequired.length > 0 && (
        <div className="rounded-xl border-2 border-warning/40 bg-warning/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground text-sm">Documentos obrigatórios pendentes</p>
            <p className="text-xs text-muted-foreground mt-1">{missingRequired.map(d => d.name).join(", ")}</p>
          </div>
        </div>
      )}

      {/* Score cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 text-center">
          <TrendingUp className={`w-7 h-7 mx-auto mb-2 ${rentColor}`} />
          <div className={`big-number ${rentColor}`}>+{state.rentabilityScore}%</div>
          <div className="text-xs text-muted-foreground mt-1">Rentabilidade</div>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <AlertTriangle className={`w-7 h-7 mx-auto mb-2 ${glossColor}`} />
          <div className={`big-number ${glossColor}`}>{state.glossRisk}%</div>
          <div className="text-xs text-muted-foreground mt-1">Risco de Glosa</div>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <BarChart3 className="w-7 h-7 mx-auto mb-2 text-primary" />
          <div className="big-number text-primary">P{state.historicalPercentile || 72}</div>
          <div className="text-xs text-muted-foreground mt-1">Percentil Histórico</div>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <Shield className="w-7 h-7 mx-auto mb-2 text-info" />
          <div className="big-number text-info">92%</div>
          <div className="text-xs text-muted-foreground mt-1">Conformidade</div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
            <Stethoscope className="w-4 h-4 text-primary" /> Médico
          </h3>
          <div className="text-foreground font-medium">{state.doctor?.name || "—"}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{state.doctor?.specialty} · {state.doctor?.crm}</div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-primary" /> Paciente
          </h3>
          <div className="text-foreground font-medium">{state.patient?.name || "—"}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{state.patient?.cpf} · {state.patient?.phone}</div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
            <Building className="w-4 h-4 text-primary" /> Operadora
          </h3>
          <div className="text-foreground font-medium">{state.operadora?.name || "—"}</div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-primary" /> Procedimento Principal
          </h3>
          <div className="text-foreground font-medium">{state.selectedProcedure?.name || "—"}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{state.selectedProcedure?.code}</div>
        </div>
      </div>

      {/* Linked procedures */}
      {state.linkedProcedures.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3 text-sm">Procedimentos Atrelados ({state.linkedProcedures.length})</h3>
          <div className="space-y-2">
            {state.linkedProcedures.map((code) => {
              const proc = mockLinkedProcedures.find((p) => p.code === code);
              return proc ? (
                <div key={code} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-foreground">{proc.name}</span>
                  </div>
                  <span className={cn("text-xs font-semibold", proc.rentabilityDelta.startsWith("+") ? "text-success" : "text-destructive")}>{proc.rentabilityDelta}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
          <Package className="w-4 h-4 text-primary" /> Itens / OPMEs ({state.extractedItems.length})
        </h3>
        <div className="space-y-1.5">
          {state.extractedItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
              <div>
                <span className="font-medium text-foreground">{item.name}</span>
                {item.supplier && <span className="text-muted-foreground text-xs ml-2">· {item.supplier}</span>}
              </div>
              <span className="text-muted-foreground text-xs">Qtd: {item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-3 text-sm">Documentos ({attachedDocs.length} anexados)</h3>
        {attachedDocs.length > 0 ? (
          <div className="space-y-1.5">
            {attachedDocs.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-foreground">{doc.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-3">Nenhum documento anexado</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" className="h-11 px-6">
          <Save className="w-4 h-4 mr-2" /> Salvar Rascunho
        </Button>
        <Button variant="outline" className="h-11 px-6">
          <Download className="w-4 h-4 mr-2" /> Gerar Pacote
        </Button>
        <Button className="h-11 px-6">
          <Send className="w-4 h-4 mr-2" /> Finalizar Solicitação
        </Button>
      </div>
    </div>
  );
};

export default StepSummary;
