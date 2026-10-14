# Plano 5: Compras (fila de revisão) e perfil Consultor

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans.

**Goal:** Fechar a plataforma com:
- **Compras (OPME.AI operacional):** uma fila de revisão dos pedidos que vêm do wizard, com as 7 novidades da especificação (seção 6).
- **Consultor:** um perfil novo com três níveis: carteira, benchmark e comercial.

**Architecture:**
- **Telas de Compras** em `src/compras/` (escritas à mão, fora do port). Ficam montadas dentro do `OpmeShell` nas rotas `/revisao` e `/revisao/:id`, com a barra lateral do OPME. O item "Revisão de pedidos" entra no módulo Operacional da Sidebar pelo script de port.
- **Aba "Médico" do OPME:** o script de port faz ela aparecer sempre (com as preferências do médico). As estatísticas e o ranking punitivos ficam desligados por padrão.
- **Consultor** em `src/consultor/` e na rota `/consultor`:
  - `carteira.ts` traz os dados dos 3 hospitais. O RHP usa as análises reais do domínio; a Santa Casa e o Santa Joana usam um retrato fixo de exemplo.
  - O benchmark envia uma sugestão de alteração para a comissão do RHP, pelo store.

**Spec:** `docs/superpowers/specs/2026-10-14-plataforma-unificada-design.md`

## Global Constraints
- Compras vê a margem; médico e secretária nunca veem.
- Nada é bloqueado para o médico. Em Compras, confirmar um pedido fora do padrão exige antes "Aceitar fora do padrão" com motivo.
- As trocas em Compras ficam restritas ao leque (marcas aceitas e homologadas na operadora).
- Cotação, autorização e faturamento ficam fora (território do OPMEnexo).
- Nunca dar push.

## Review Focus
1. Pedido com item fora do protocolo: a troca não oferece marcas (não há leque); só "Aceitar fora do padrão" resolve.
2. "Pedir ajuste" sem motivo não envia.
3. Um pedido confirmado sai da fila.
4. O benchmark enviado duas vezes para o mesmo item não duplica a sugestão.
5. Operadora em conta aberta não mostra o teto do pacote; mostra a margem.

## Tasks
### Task 1: Fila de revisão de Compras
- [ ] **Testes (RED)** em `src/test/compras-revisao.test.tsx`:
  - a fila lista só os pedidos "esperando confirmação";
  - a troca só oferece marcas do leque;
  - "Pedir ajuste" com item e motivo vai para o store;
  - confirmar fica bloqueado enquanto há algo fora do padrão sem aceite;
  - aceitar fora do padrão cria uma sugestão na comissão e libera a confirmação.
- [ ] **Implementar** `src/compras/{FilaRevisao,RevisaoPedido}.tsx`, as rotas em `src/opme/rotas.tsx` e o patch da Sidebar e da aba Médico no port.
- [ ] **Rodar:** PASS.

### Task 2: Perfil Consultor
- [ ] **Testes (RED)** em `src/test/consultor.test.tsx` e `perfis.test.ts`:
  - o perfil consultor existe, com a rota `/consultor`;
  - a carteira mostra os 3 hospitais com a fase;
  - o benchmark envia uma sugestão para a comissão do RHP, sem duplicar;
  - o comercial mostra o taxímetro.
- [ ] **Implementar** `src/consultor/*`, a rota e o perfil.
- [ ] **Rodar:** `npx vitest run && npx tsc --noEmit -p tsconfig.app.json && npx vite build`; conferir no navegador; commit.
