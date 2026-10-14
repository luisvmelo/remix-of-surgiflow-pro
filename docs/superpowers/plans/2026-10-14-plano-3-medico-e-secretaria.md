# Plano 3: Médico e secretária (wizard novo, home do médico, colunas da secretária)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans.

**Goal:** Trocar o fluxo antigo (faixas A/B/C, complemento percentual, "Pacote Sugerido") pelo fluxo da especificação, seções 6, 7 e 8, sobre o domínio do Plano 2.

**Architecture:**
- Wizard novo em `src/components/pedido/`, responsivo (desktop para a secretária, celular para o médico), com rascunho local e gravação no store `useDominio()`.
- Páginas novas: `pages/secretaria/SecretariaHome.tsx`, `pages/medico/MedicoHome.tsx`, `pages/medico/MedicoPedido.tsx` e `pages/PedidoPage.tsx` (wizard).
- As telas, componentes e libs antigos do wizard e do médico são **removidos**.

**Spec:** seções 2, 4, 6, 7 e 8.

## Global Constraints
- O médico e a secretária nunca leem `avaliacao.hospital`.
- Nada vem pré-preenchido. "Usar pedido sugerido" e "Sugestão de compra rápida" só aplicam a escolha quando a pessoa clica.
- Fora do protocolo ou do padrão é permitido: aparece a tag; clicar na tag "Fora do protocolo" abre o modal do protocolo; a justificativa é pedida no resumo.
- Condições de complemento por margem aparecem para médico e secretária como "Condição do hospital", sem números.
- Status: Rascunho → Aguardando o médico → Esperando confirmação (com tag de ajuste) → Confirmado. Quando o médico devolve, o pedido volta para Rascunho com o motivo.
- O envio automático (opção do médico) manda direto para "Esperando confirmação" quando o pedido estiver 100% conforme.

## Review Focus
1. Trocar de operadora no passo 1 depois de escolher itens: as marcas não homologadas na nova operadora passam a aparecer como não homologadas, sem quebrar a tela.
2. Pedir **menos** itens que o padrão continua conforme (o padrão não obriga quantidade mínima).
3. Pedido "Esperando confirmação" com ajuste pendente: o médico corrige pelo wizard e, ao salvar, o ajuste fica resolvido.
4. Médico sem contrato para o procedimento: o procedimento não aparece na lista do médico; a secretária só vê os procedimentos credenciados daquele médico.
5. No celular (375px), o wizard e as telas do médico ficam sem rolagem horizontal.

## Tasks
### Task 1: Wizard novo
- [ ] **Testes (RED)** em `src/test/pedido-wizard.test.tsx`:
  - (a) "Usar pedido sugerido" preenche os itens e o resumo mostra "Honorário garantido" e o complemento;
  - (b) adicionar um item fora do protocolo mostra a tag "Fora do protocolo" e "complemento perdido";
  - (c) a secretária finaliza e o pedido vai para "aguardando_medico" no store.
- [ ] **Implementar** `src/components/pedido/*` e `pages/PedidoPage.tsx` (rotas `/pedido/novo` e `/pedido/:id`).
- [ ] **Rodar:** PASS.

### Task 2: Médico
- [ ] **Testes (RED)** em `src/test/medico.test.tsx`:
  - (a) a home mostra a previsão e as abas com contagens do store;
  - (b) "Devolver" com motivo volta o pedido para "rascunho" com `devolvido`;
  - (c) "Aprovar" leva o pedido para "esperando_confirmacao".
- [ ] **Implementar** `pages/medico/MedicoHome.tsx` e `MedicoPedido.tsx` (rotas `/medico`, `/medico/pedido/:id`) e a configuração de envio automático.
- [ ] **Rodar:** PASS.

### Task 3: Secretária e limpeza
- [ ] **Teste (RED):** `src/test/secretaria.test.tsx`: as colunas Rascunho, Aguardando o médico, Esperando confirmação e Confirmado mostram os pedidos do store, com a tag de ajuste.
- [ ] **Implementar** `pages/secretaria/SecretariaHome.tsx` (rota `/home`); trocar `SelectDoctor` para usar os médicos do domínio e ir para `/pedido/novo?medico=<id>`.
- [ ] **Remover** o wizard antigo (`components/wizard/**`, `pages/Wizard.tsx`, `pages/Homepage.tsx`, `pages/Analises.tsx`, `pages/doctor/**`, `hooks/useRemuneracao.ts`) e as rotas antigas.
- [ ] **Rodar:** `npx vitest run && npx tsc --noEmit -p tsconfig.app.json && npx vite build`; conferir no navegador.
- [ ] **Commit.**
