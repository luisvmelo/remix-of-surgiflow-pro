# Plano 4: Gestão + consultoria (Home, Comissão, Contratos, Consultoria e Configuração)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans.

**Goal:** Refazer a tela do hospital conforme a especificação, seções 5.1 a 5.5:
- **Home:** pendências, KPIs com antes e depois, recortes com comparação, BI de fornecedores fora do padrão, balanceamento, fontes de dados e ganho gerado.
- **Comissão:** catálogo, montagem por operadora, complemento configurável, sugestões de alteração e versões.
- **Contratos:** contratos dos médicos e das operadoras, mais a tabela de previsibilidade.
- **Consultoria:** por linha de cuidado, médicos como parceiros, tempo de cirurgia, e Insights e Resultados do OPME embutidos.
- **Configuração:** considerar a margem e os pesos, e as configurações de compras do OPME.

O modelo antigo (proporção, faixas e simulador) sai.

**Architecture:**
- **Análises puras e testadas** em `src/gestao/analise.ts`. Elas rodam o motor do Plano 2 sobre um **histórico de exemplo gerado de forma determinística** (`src/gestao/historico.ts`, abr–set/2026) mais os pedidos do store. Assim os números da gestão batem com os do médico e de Compras.
- **Configuração do hospital** (considerar margem e pesos) passa para o store do domínio.
- **Telas** em `src/components/gestao/`.
- **OPME embutido:** `src/opme/embutido.tsx` (escrito à mão) dá os providers e o tema sem a barra lateral; o script de port faz a `Sidebar` respeitar esse modo e tira dela o botão Configurações.
- **Remoções:** `lib/remuneracao.ts`, `lib/guias.ts`, `lib/consultoria.ts`, as telas antigas de `components/hospital/` e o `hospitalConfig` do `SurgicalContext`.

## Global Constraints
- Avisos jurídicos nas condições de margem e de fornecedor, sem bloqueio.
- Leque com menos de 3 marcas aceitas por operadora: aviso, não erro.
- Nada de listas operacionais (pedido a pedido, vencimentos) na gestão; isso é de Compras.
- Gráficos: um eixo, poucas cores, tooltip, rótulos em texto (diretrizes do dataviz).
- Textos em português.

## Review Focus
1. A comissão marca uma marca como preferencial sem ela estar aceita: a preferencial vira aceita automaticamente.
2. Um procedimento só com pré-modelo (versão 0) aprovado vira versão 1 "vigente", com histórico.
3. Na tabela de previsibilidade, um plano que não tem contrato para o procedimento mostra "sem contrato", sem quebrar.
4. Desligar "considerar margem" zera o peso da margem no "equilíbrio".
5. Os recortes com 1 item selecionado não mostram a comparação (precisa de 2 ou 3).

## Tasks
### Task 1: Histórico e análises
- [ ] **Testes (RED)** em `src/test/gestao-analise.test.ts`:
  - o histórico é determinístico (mesmo tamanho e mesmo primeiro pedido em duas chamadas) e todos os pedidos são "confirmado";
  - `indicadores()` devolve percentuais entre 0 e 100;
  - `recorte("operadora")` devolve uma linha por operadora presente;
  - `foraDoPadrao()` só lista marcas fora do leque ou não homologadas;
  - `previsibilidade()` devolve "sem contrato" quando falta contrato;
  - `equilibrio()` com margem desligada ignora a margem.
- [ ] **Implementar** `historico.ts` e `analise.ts`.
- [ ] **Rodar:** PASS.

### Task 2: Config no store e OPME embutido
- [ ] **Teste (RED):** `salvarConfig` atualiza `dominio.config` e persiste.
- [ ] **Implementar** a config no store; `src/opme/embutido.tsx`; o patch da `Sidebar` no script de port (respeitar o modo embutido e remover o botão Configurações).
- [ ] **Rodar:** PASS.

### Task 3: Telas da gestão
- [ ] **Testes (RED)** em `src/test/gestao-telas.test.tsx`:
  - (a) Comissão: abrir um pré-modelo, aprovar e ver "v1";
  - (b) Contratos: desligar "participa do complemento" de um médico reflete no store;
  - (c) Home: o seletor de recorte troca as linhas, e a comparação aparece com 2 selecionados.
- [ ] **Implementar** `components/gestao/*` e o novo `pages/hospital/HospitalHome.tsx`; remover as telas antigas e libs.
- [ ] **Rodar:** `npx vitest run && npx tsc --noEmit -p tsconfig.app.json && npx vite build`; conferir no navegador.
- [ ] **Commit.**
