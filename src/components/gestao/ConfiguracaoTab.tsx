import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useDominio } from "@/dominio/store";
import type { ConfigHospital } from "@/dominio/tipos";
import OpmeEmbutido from "@opme/embutido";
import Configuracoes from "@opme/pages/Configuracoes";

const PESOS: { id: keyof ConfigHospital["pesos"]; label: string; ajuda: string }[] = [
  { id: "liberacao", label: "Liberação rápida", ajuda: "Marcas que a operadora libera em menos dias." },
  { id: "glosa", label: "Menos glosa", ajuda: "Marcas com menor histórico de glosa." },
  { id: "margem", label: "Margem do hospital", ajuda: "Diferença entre o que a operadora paga e o custo." },
];

const ConfiguracaoTab = () => {
  const { dominio, salvarConfig, resetar } = useDominio();
  const config = dominio.config;
  const pesoMargem = config.considerarMargem ? config.pesos.margem : 0;
  const total = config.pesos.liberacao + config.pesos.glosa + pesoMargem || 1;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Como a plataforma equilibra o padrão</CardTitle>
          <CardDescription>Vale para o atalho "Equilíbrio" da Comissão e para as recomendações do consultor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-start justify-between gap-4 rounded-md border p-4">
            <div>
              <Label htmlFor="considerar-margem" className="text-sm font-medium">Considerar a margem do hospital</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Desligado, a plataforma escolhe só por liberação e glosa, e a margem some dos atalhos. O médico e a secretária nunca veem a margem.
              </p>
            </div>
            <Switch id="considerar-margem" checked={config.considerarMargem}
              onCheckedChange={(v) => salvarConfig({ ...config, considerarMargem: v })} />
          </div>

          <div className="space-y-4">
            {PESOS.map((p) => {
              const desligado = p.id === "margem" && !config.considerarMargem;
              const valor = desligado ? 0 : config.pesos[p.id];
              return (
                <div key={p.id} className={desligado ? "opacity-50" : ""}>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{p.label}</Label>
                    <span className="text-sm tabular-nums font-medium">{Math.round((valor / total) * 100)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{p.ajuda}</p>
                  <Slider
                    aria-label={`Peso: ${p.label}`}
                    min={0} max={100} step={5}
                    value={[config.pesos[p.id]]}
                    disabled={desligado}
                    onValueChange={([v]) => salvarConfig({ ...config, pesos: { ...config.pesos, [p.id]: v } })}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <section aria-label="Configurações de compras">
        <h2 className="text-base font-semibold mb-1">Configurações de compras (OPME.AI)</h2>
        <p className="text-sm text-muted-foreground mb-3">Equivalência técnica e convênios fora da otimização, usados pela equipe de Compras.</p>
        <OpmeEmbutido><Configuracoes /></OpmeEmbutido>
      </section>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={resetar}>
          <RotateCcw className="w-4 h-4 mr-1" aria-hidden /> Restaurar dados de exemplo
        </Button>
      </div>
    </div>
  );
};

export default ConfiguracaoTab;
