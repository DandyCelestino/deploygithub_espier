
# Workflow Comercial — Plano de Implementação

Avaliando o que **já existe** vs **falta**, descartando duplicidades para não retrabalhar.

## Status atual (já implementado)

| Item do pedido | Status | Onde |
|---|---|---|
| Cadastro de Lead (nome, telefone, endereço, serviço, origem, obs) | ✅ | `Vendedores.tsx` + tabela `leads` |
| Kanban comercial (15 etapas) | ✅ | `Vendedores.tsx` |
| Cadastro de Visita pelo vendedor | ✅ | `Visitas.tsx` + tabela `visitas` |
| Visita autoriza orçamento (trigger) | ✅ | `on_visita_autoriza_orcamento` |
| Orçamento → cria OS ao aprovar | ✅ | `on_orcamento_aprovado` |
| Comissão vendedor 10% | ✅ | `on_os_create_commission` |
| OS — checklist, vistoria, comissão técnico | ✅ | triggers existentes |
| Contas a receber recorrentes (mensalidade) | ✅ | `on_os_finalizada_comissao` |
| Permissões granulares por módulo | ✅ | `usePermissions` + `user_permissions` |
| Histórico/Logs (`activity_logs`) | ✅ | `log_activity()` |
| Rastreio público + feedback do cliente | ✅ | `Rastreio.tsx` |

## O que **falta** e será implementado

### 1. Botões de ação no card do Lead (Kanban)
- `Vendedores.tsx`: adicionar no card → **Agendar visita**, **Descartar**, **Reagendar**.
- "Agendar visita" abre dialog que cria registro em `visitas` **+** evento em `agenda_eventos` direcionado a gerentes (`target_roles: ['gerente']`), e move o lead para `visita_agendada`.

### 2. Gerente "Assume Agenda" (gate p/ orçamento)
- Nova coluna `visitas.assumida_por uuid` e `visitas.assumida_em timestamptz`.
- Em `Agenda.tsx` / nova seção em `Visitas.tsx`: botão **Assumir agenda** (somente gerente).
- Após assumir: visita some da fila dos demais gerentes (RLS / filtro), libera botão **Gerar orçamento** no card; bloqueado antes disso.

### 3. Gerar Orçamento a partir da visita (one-click)
- Botão **Gerar Orçamento** (só visível para o gerente que assumiu) → cria `orcamentos` puxando dados do lead/visita, abre tela de edição, e ao salvar move lead para `proposta_andamento`.

### 4. Encaminhar Orçamento ao Financeiro
- Em `Orcamentos.tsx`: botão **Encaminhar para Financeiro** (vendedor) → seta `status='solicitado'` + `setor_responsavel='financeiro'` + log.
- Move lead para `pedido_orcamento`.

### 5. Financeiro "Assumir Orçamento" + Negociação
- Nova coluna `orcamentos.assumido_por uuid` e `assumido_em timestamptz`.
- Em `Orcamentos.tsx` (perfil financeiro): aba **Pendentes** com botão **Assumir** → status `negociacao`; libera campos: forma de pagamento, parcelas, entrada, desconto.
- Botões: **Aprovar**, **Reprovar**, **Solicitar ajuste**, **Enviar contrato**.

### 6. Enviar contrato → Fechamento → Venda concluída
- Botão **Enviar contrato** marca `orcamentos.contrato_enviado_em` + cria `contratos` (status `aguardando_assinatura`) e move lead para `fechamento`.
- Marcação manual **Contrato assinado** (assinatura digital fica para fase futura — Zapsign/Clicksign exigem chaves) → status `fechado` → trigger `on_contrato_fechado` (já existe) cria orçamento/OS; move lead para `venda_concluida`.

### 7. Sincronização Lead ↔ Orçamento ↔ OS
- Triggers que atualizam `leads.etapa` automaticamente conforme:
  - visita criada → `visita_agendada`
  - visita assumida → `visita_assumida`
  - orçamento criado → `proposta_andamento`
  - orçamento `solicitado` → `pedido_orcamento`
  - orçamento assumido financeiro → `negociacao`
  - contrato enviado → `fechamento`
  - contrato fechado → `venda_concluida`
  - orçamento reprovado → `perdido`

### 8. Notificações no painel
- Já existe `agenda_eventos` com `target_roles`/`target_user_ids`. Usar para:
  - Vendedor recebe evento "Orçamento disponível" quando gerente salva.
  - Financeiro recebe "Novo orçamento para assumir".
  - Vendedor recebe "Contrato enviado".
- Card no Dashboard: "Notificações pendentes" (lista eventos do tipo `notificacao` direcionados ao usuário, marca como lida).

## Fora de escopo nesta fase (precisa decisão/credenciais)
- ❌ **Assinatura digital integrada** (Zapsign/Clicksign/DocuSign) — exige API key de cada provedor; deixo o status manual + upload de PDF agora.
- ❌ **WhatsApp automático** (envio de confirmação/cobrança) — exige Evolution/Z-API/Meta Business; mantenho **link wa.me** já existente.
- ❌ **Boletos/PIX/Carnê automáticos** — exige integração bancária (Asaas, Iugu, Mercado Pago…). Mantenho registro manual em `financeiro_contas`.
- ❌ **n8n / Socket.io / Flutter / Next.js** — fora da stack atual (memória do projeto: React+Vite+Supabase).

## Arquivos / migrations

**Migration (1)**
- `visitas`: add `assumida_por uuid`, `assumida_em timestamptz`.
- `orcamentos`: add `assumido_por uuid`, `assumido_em timestamptz`, `forma_pagamento text`, `parcelas int`, `entrada numeric`, `desconto numeric`, `contrato_enviado_em timestamptz`.
- `contratos`: add `status` valor `aguardando_assinatura` (texto livre, ok).
- Funções/triggers de sincronização de `leads.etapa`.
- RLS: gerente só vê visitas não assumidas OU assumidas por ele; financeiro só vê orçamentos `solicitado`/`negociacao`/assumidos por ele.

**Edits**
- `src/pages/admin/Vendedores.tsx` — botões no card (Agendar/Descartar/Reagendar), modal "Agendar visita".
- `src/pages/admin/Visitas.tsx` — botão "Assumir agenda" + "Gerar orçamento".
- `src/pages/admin/Orcamentos.tsx` — fluxo Encaminhar/Assumir/Negociação/Enviar contrato + campos comerciais.
- `src/pages/admin/Dashboard.tsx` — card "Notificações" por usuário.

## Confirmação
Confirma para eu prosseguir com **(1) migration + (2) UI dos 4 arquivos acima**, mantendo assinatura digital, WhatsApp API e cobrança bancária para uma fase separada com credenciais?
