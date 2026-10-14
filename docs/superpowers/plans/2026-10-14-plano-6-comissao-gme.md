# Plano 6: Comissão no fluxo do GME (protocolo, sugestão por cirurgia e revisão)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans.

**Goal:** fechar os 6 pontos que faltavam na Comissão, em relação à reunião de 14/10 e à especificação (5.2):
1. o protocolo pode ser editado (critérios, documentos, fonte, revisão). Os pré-modelos partem dos protocolos institucionais que o sistema lê;
2. no catálogo, o selo "Nova sugestão de alteração" e o ganho possível; no procedimento, as sugestões aparecem no topo com o antes e depois;
3. a IA explica cada marca: liberação, glosa e quanto os médicos do hospital já usam;
4. a montagem segue os passos do GME: abrir o leque → direcionar (até 3) → protocolo e códigos → complemento → revisar e aprovar;
5. prévia do complemento ("seguindo o pedido sugerido, o médico recebe R$ Y") e o teto no melhor e no pior caso do leque;
6. status de revisão: vencendo (até 90 dias) ou vencida.

**Architecture:**
- Funções puras em `src/gestao/comissao.ts`.
- `aplicarSugestao` sai do reducer e vai para `src/dominio/motor.ts`, para a prévia e o store usarem a mesma regra.
- Protocolos institucionais em `src/dominio/dados.ts`.
- A tela fica em `src/components/gestao/MontagemPadrao.tsx`, dividida em passos.

**Spec:** `docs/superpowers/specs/2026-10-14-plataforma-unificada-design.md` (5.2)

## Review Focus
1. Uma data de revisão vazia não quebra o status nem a ordenação.
2. Um protocolo com a lista de critérios vazia continua salvável, e o médico vê a lista vazia sem erro.
3. Uma operadora sem marca homologada num item: o melhor e o pior caso ignoram o item sem dar NaN.
4. O efeito de uma sugestão "incluir item" que já está no padrão não duplica o item.
5. Ao trocar de passo, as edições não salvas continuam no rascunho.

## Tasks
### Task 1: Funções da comissão
- [ ] **RED** em `src/test/comissao-gme.test.tsx`: `ganhoPossivel`, `explicacaoIA`, `faixaPadrao`, `previaComplemento`, `statusRevisao`, `efeitoSugestao` e `aplicarSugestao`.
- [ ] **Implementar** e rodar até PASS.

### Task 2: Tela
- [ ] **RED**:
  - o catálogo mostra o selo, o ganho possível e "Revisão vencendo";
  - a montagem tem os 5 passos;
  - o protocolo editado vai para o store;
  - o aviso de sugestões aparece no topo com o efeito;
  - o complemento mostra a prévia.
- [ ] **Implementar**; rodar a suite, o tsc e o build; conferir no navegador; commit; publicar.
