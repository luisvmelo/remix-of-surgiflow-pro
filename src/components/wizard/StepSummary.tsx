import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Save, TrendingUp, AlertTriangle, Shield, User, Stethoscope, Building, FileText, Package } from "lucide-react";
import { mockLinkedProcedures } from "@/lib/mockData";

const StepSummary = () => {
  const { state } = useSurgical();

  const rentColor = state.rentabilityScore > 15 ? "text-success" : state.rentabilityScore > 0 ? "text-warning" : "text-destructive";
  const glossColor = state.glossRisk < 15 ? "text-success" : state.glossRisk < 30 ? "text-warning" : "text-destructive";

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Resumo da Solicitação</h2>
        <p className="text-muted-foreground">Revise todos os dados antes de enviar</p>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 text-center">
          <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${rentColor}`} />
          <div className={`big-number ${rentColor}`}>+{state.rentabilityScore}%</div>
          <div className="text-sm text-muted-foreground mt-1">Rentabilidade Estimada</div>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <AlertTriangle className={`w-8 h-8 mx-auto mb-2 ${glossColor}`} />
          <div className={`big-number ${glossColor}`}>{state.glossRisk}%</div>
          <div className="text-sm text-muted-foreground mt-1">Risco de Glosa</div>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
          <div className="big-number text-primary">92%</div>
          <div className="text-sm text-muted-foreground mt-1">Conformidade</div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary" /> Médico
          </h3>
          <div className="text-sm text-foreground">{state.doctor?.name}</div>
          <div className="text-xs text-muted-foreground">{state.doctor?.specialty} · {state.doctor?.crm}</div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Paciente
          </h3>
          <div className="text-sm text-foreground">{state.patient?.name}</div>
          <div className="text-xs text-muted-foreground">{state.patient?.cpf} · {state.patient?.phone}</div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" /> Operadora
          </h3>
          <div className="text-sm text-foreground">{state.operadora?.name}</div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Procedimento Principal
          </h3>
          <div className="text-sm text-foreground">{state.selectedProcedure?.name || "—"}</div>
          <div className="text-xs text-muted-foreground">{state.selectedProcedure?.code}</div>
        </div>
      </div>

      {/* Linked procedures */}
      {state.linkedProcedures.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Procedimentos Atrelados ({state.linkedProcedures.length})</h3>
          <div className="space-y-2">
            {state.linkedProcedures.map((code) => {
              const proc = mockLinkedProcedures.find((p) => p.code === code);
              return proc ? (
                <div key={code} className="flex items-center justify-between p-3 rounded-md bg-muted/50 text-sm">
                  <span className="text-foreground">{proc.name}</span>
                  <span className="text-xs text-muted-foreground">{proc.code}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" /> Itens / OPMEs ({state.extractedItems.length})
        </h3>
        <div className="space-y-2">
          {state.extractedItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50 text-sm">
              <div>
                <span className="font-medium text-foreground">{item.name}</span>
                {item.supplier && <span className="text-muted-foreground"> · {item.supplier}</span>}
              </div>
              <span className="text-muted-foreground">Qtd: {item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-3">Documentos Anexados</h3>
        <div className="space-y-2">
          {state.documents.filter((d) => d.attached).map((doc, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-foreground">{doc.name}</span>
            </div>
          ))}
          {state.documents.filter((d) => d.attached).length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum documento anexado</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" className="h-11 px-6">
          <Download className="w-4 h-4 mr-2" /> Gerar Pacote
        </Button>
        <Button className="h-11 px-6">
          <Save className="w-4 h-4 mr-2" /> Salvar Solicitação
        </Button>
      </div>
    </div>
  );
};

export default StepSummary;
