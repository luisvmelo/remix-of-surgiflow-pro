# Plano 2: Domínio comum (dados, regras e store de pedidos)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Criar a base de dados de exemplo e as regras que todas as telas novas usam:
- procedimentos com padrão versionado (leque por operadora, protocolo, codificação, regra de complemento);
- contratos de médico e de operadora;
- o motor que avalia um pedido (conformidade, honorário, complemento, teto ou margem, liberação, glosa, previsão de recebimento);
- um **store de pedidos compartilhado** entre todos os perfis.

**Architecture:**
- Pasta nova `src/dominio/`. Os tipos e dados são puros, o motor é composto de funções puras com testes, e o store é um Context React com reducer, salvo no `localStorage` (com try/catch).
- O código antigo (`lib/remuneracao.ts`, `lib/guias.ts`, `lib/consultoria.ts`) continua até os Planos 3 e 4 trocarem as telas. Aqui nada é removido.
- Os dados de exemplo do OPME.AI (Lista de compras e Acompanhamento, com a rede "Aurora") continuam separados. A fila de revisão nova (Plano 5) usa este domínio.

**Spec:** [../specs/2026-10-14-plataforma-unificada-design.md](../specs/2026-10-14-plataforma-unificada-design.md), seções 2, 4, 5.2, 5.5, 6, 9 e 11.

## Global Constraints
- Só commits locais e só com autorização (já dada pelo Luís para esta execução); nunca push.
- Textos em português; valores em R$ arredondados.
- O médico e a secretária nunca recebem a margem do hospital: o motor devolve a margem num campo separado (`hospital`), que as telas deles não leem.
- Nada é bloqueado: o motor só **sinaliza** (fora do protocolo, fora do padrão, não homologado).
- Leque com mínimo de 3 marcas é **aviso**, não erro.
- Complemento: fixo; "pré-definido" (valor único se cumprir tudo) ou "por condições" (soma das cumpridas). As condições de margem e de fornecedor carregam `avisoJuridico: true`.

## Review Focus
1. Um pedido sem itens ou sem procedimento não pode quebrar o motor (devolve "incompleto").
2. Uma marca não homologada na operadora do pedido conta como "não homologado", mesmo estando no leque base.
3. Médico sem contrato ou com `participaComplemento: false` tem complemento 0, com o motivo.
4. Pacote: o consumo do teto inclui o custo hospitalar estimado, a OPME e o complemento. Conta aberta: a margem é a soma de (tabela − custo) × quantidade, menos o complemento.
5. O `localStorage` indisponível ou corrompido não pode quebrar o app: volta aos dados semente.

## Mapa de arquivos
| Arquivo | Responsabilidade |
|---|---|
| `src/dominio/tipos.ts` | Todos os tipos do domínio. |
| `src/dominio/dados.ts` | Dados semente: hospitais, linhas, procedimentos, itens, marcas, operadoras, contratos, médicos, padrões e pedidos. |
| `src/dominio/motor.ts` | `leque()`, `avaliarPedido()`, `pedidoSugerido()`, `compraRapida()`, `previsaoMedico()`. |
| `src/dominio/store.tsx` | `DominioProvider`, `useDominio()` e as ações. |
| `src/test/dominio-motor.test.ts`, `src/test/dominio-store.test.tsx` | Testes. |
| `src/App.tsx` | Envolve o app com `DominioProvider`. |

## Interfaces (produzidas aqui, consumidas pelos Planos 3–5)
```ts
// tipos.ts (resumo; a fonte é o arquivo)
type LinhaCuidado = "cardio" | "trauma" | "ortopedia" | "neuro" | "hemodinamica" | "obstetricia";
type StatusPedido = "rascunho" | "aguardando_medico" | "esperando_confirmacao" | "confirmado";
type CondicaoTipo = "homologados" | "dentro_padrao" | "codigo_recomendado" | "documentos" | "prazo_liberacao" | "margem_minima" | "fornecedor_preferencial";
interface Avaliacao {
  completo: boolean;
  checklist: { id: string; label: string; ok: boolean; detalhe?: string }[];
  foraProtocolo: string[]; foraPadrao: string[]; naoHomologados: string[];
  honorario: { valor: number; garantido: boolean };
  complemento: { total: number; garantido: number; perdido: number; motivo?: string;
                 condicoes: { tipo: CondicaoTipo; label: string; valor: number; cumprida: boolean; avisoJuridico: boolean }[] };
  recebimento: { valor: number; dias: number; data: string };
  liberacaoDias: number; riscoGlosa: number;
  hospital: { custoOpme: number; margem: number; tipo: "pacote" | "aberta"; teto?: number; consumoTeto?: number };
}
// motor.ts
leque(padrao, operadoraId, dominio): { itemId; aceitas: Marca[]; preferenciais: Marca[]; naoHomologadas: Marca[]; avisoMinimo: boolean }[]
avaliarPedido(pedido, dominio): Avaliacao
pedidoSugerido(procedimentoId, operadoraId, dominio): { codigos: string[]; itens: ItemPedido[] }
compraRapida(procedimentoId, operadoraId, dominio): ItemPedido[]
previsaoMedico(medicoId, pedidos, dominio, hoje): { d30: number; d60: number; d90: number; ano: number }
// store.tsx
useDominio(): { dominio; pedidos; criarPedido(p): string; atualizarPedido(id, parcial); mudarStatus(id, status);
                pedirAjuste(id, motivo, itemId?); resolverAjustes(id); aceitarForaPadrao(id, motivo);
                salvarPadrao(padrao); aceitarSugestao(procId, sugestaoId); recusarSugestao(procId, sugestaoId);
                salvarContratoMedico(c); salvarContratoOperadora(c); resetar() }
```

### Task 1: Tipos, dados semente e `leque()`
- [ ] **Teste (RED):** em `src/test/dominio-motor.test.ts`, `leque()` da artrodese lombar na Hapvida deixa fora a marca não homologada nela e avisa quando há menos de 3 aceitas; na SulAmérica há 3 ou mais aceitas e nenhum aviso.
- [ ] **Rodar:** `npx vitest run src/test/dominio-motor.test.ts`. Esperado: FAIL (módulo inexistente).
- [ ] **Implementar:** `tipos.ts`, `dados.ts` e `leque()` em `motor.ts`.
  - **Dados:**
    - 12 procedimentos em 6 linhas de cuidado; 3 com detalhe completo (artroscopia de joelho, artrodese lombar e angioplastia com 1 stent).
    - Operadoras: Unimed, Bradesco, Amil, SulAmérica, Porto e Hapvida, com pacote e conta aberta.
    - O médico Dr. Ricardo (id "1") com contrato.
    - 8 pedidos semente distribuídos nos 4 status.
- [ ] **Rodar:** PASS.

### Task 2: `avaliarPedido()`
- [ ] **Testes (RED):**
  - **Pedido sugerido completo:** checklist todo ok, honorário garantido e complemento total garantido.
  - **Marca não homologada:** sinaliza o item, o honorário deixa de estar garantido e o complemento perde as condições ligadas.
  - **Item fora do protocolo:** aparece em `foraProtocolo`.
  - **Pacote:** `consumoTeto = custoHospitalar + OPME + complemento`.
  - **Conta aberta:** `margem = Σ(tabela − custo)·qtd − complemento`.
  - **Médico sem participação:** complemento 0, com o motivo.
  - **Pedido sem procedimento:** `completo: false`, sem exceção.
  - **Recebimento:** dias = repasse do contrato (60 para eletiva).
- [ ] **Implementar.**
- [ ] **Rodar:** PASS.

### Task 3: `pedidoSugerido()`, `compraRapida()` e `previsaoMedico()`
- [ ] **Testes (RED):**
  - O sugerido usa as preferenciais homologadas e os códigos recomendados.
  - A compra rápida escolhe, por item, a marca aceita de menor liberação.
  - A previsão soma honorário + complemento garantido nas janelas de 30/60/90 dias e no ano, só para pedidos confirmados ou esperando confirmação.
- [ ] **Implementar.**
- [ ] **Rodar:** PASS.

### Task 4: Store compartilhado
- [ ] **Testes (RED)** em `src/test/dominio-store.test.tsx`:
  - `criarPedido` + `mudarStatus` + `pedirAjuste` refletem no estado;
  - `aceitarSugestao` cria uma nova versão do padrão e remove a sugestão;
  - `localStorage` com JSON inválido não quebra (volta à semente).
- [ ] **Implementar** `store.tsx` e envolver o `App` com `DominioProvider`.
- [ ] **Rodar:** `npx vitest run && npx tsc --noEmit -p tsconfig.app.json`. Esperado: tudo verde.
- [ ] **Commit.**
