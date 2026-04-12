

## Plano: Evolução do Sistema ESPIER.TELECOM

### Contexto Importante
O projeto roda em **React + Vite + Lovable Cloud** (Supabase). Tecnologias como Next.js, NestJS, Prisma, AWS S3 e Docker **nao sao compativeis** com esta plataforma. O plano adapta toda a arquitetura solicitada para o stack atual, mantendo a mesma funcionalidade.

---

### Fase 1 -- Banco de Dados (Migracao)

Novas tabelas e alteracoes:

1. **Adicionar role `vendedor`** ao enum `app_role`
2. **Tabela `clientes`** -- id, name, email, phone, document, created_at
3. **Tabela `contratos`** -- id, client_id (FK clientes), vendedor_id, status (em_negociacao/fechado/cancelado), total_value, created_at
4. **Tabela `activity_logs`** -- id, user_id, action, entity_type, entity_id, details (jsonb), created_at -- centraliza todos os relatorios automaticos
5. **Adicionar `commission_value`** na tabela `orcamentos`
6. **Adicionar `contrato_id`** (FK) na tabela `orcamentos`
7. **RLS policies** para todas as novas tabelas seguindo RBAC
8. **Trigger automatico**: quando contrato muda para `fechado`, cria orcamento automaticamente
9. **Trigger automatico**: quando orcamento muda para `aprovado`, cria ordem de servico (ja existe no frontend, sera movido para DB trigger)
10. **Funcao `log_activity`** -- SECURITY DEFINER para registrar acoes automaticamente

---

### Fase 2 -- RBAC e Controle de Acesso

- **ADMIN**: Acesso total
- **GERENTE**: Avaliar servicos, aprovar/reprovar, relatorios
- **TECNICO**: Atualizar OS, relatorios tecnicos
- **VENDEDOR**: CRUD contratos proprios, solicitar orcamento, dashboard de vendas
- **FINANCEIRO**: Visualizar financeiro (ja existe)
- **CLIENTE**: Acesso via tracking_code apenas (ja existe em `/acompanhar`)

Regra adicional: OS com status `encerrada` bloqueia acesso do cliente no tracking.

---

### Fase 3 -- Frontend (Novas Paginas)

1. **`/admin/clientes`** -- CRUD de clientes (admin/gerente/vendedor)
2. **`/admin/contratos`** -- Gestao de contratos com fluxo de status
3. **`/admin/dashboard-vendedor`** -- Dashboard do vendedor: contratos, comissoes, valores a receber
4. **`/admin/logs`** -- Visualizacao de logs de atividade (admin/gerente)
5. **Atualizar `AdminSidebar`** com novos menus por role
6. **Atualizar `Dashboard.tsx`** com cards especificos por perfil (vendedor)
7. **Atualizar `AcompanharOS.tsx`** para bloquear acesso quando OS estiver encerrada

---

### Fase 4 -- Automacoes

Todas implementadas como **database triggers/functions**:
- Contrato fechado → cria orcamento vinculado
- Orcamento aprovado → cria OS com tracking_code
- Qualquer mudanca de status → registra em `activity_logs`
- OS encerrada → bloqueia tracking do cliente

---

### Fase 5 -- Menu Dinamico por Perfil

O sidebar mostrara itens diferentes por role:
- **Vendedor** ve: Dashboard Vendedor, Clientes, Contratos
- **Tecnico** ve: Dashboard, Ordens, Relatorios Diarios
- **Gerente/Admin** ve: tudo
- **Financeiro** ve: Dashboard, Financeiro, Estoque

---

### Detalhes Tecnicos

```text
Fluxo de Automacao:
VENDEDOR cria CONTRATO
        |
    status = FECHADO
        |
  [DB Trigger] → cria ORCAMENTO (pendente)
        |
  ADMIN aprova ORCAMENTO
        |
  [DB Trigger] → cria ORDEM DE SERVICO (aberta)
        |
  TECNICO executa → aguardando_supervisao
        |
  GERENTE supervisiona → concluida → valor_liberado
        |
  status = encerrada → bloqueia tracking
```

Arquivos novos:
- `src/pages/admin/Clientes.tsx`
- `src/pages/admin/Contratos.tsx`
- `src/pages/admin/DashboardVendedor.tsx`
- `src/pages/admin/Logs.tsx`
- 1 migration SQL (tabelas + triggers + functions + RLS)

Arquivos editados:
- `src/contexts/AuthContext.tsx` (adicionar vendedor ao tipo)
- `src/components/admin/AdminSidebar.tsx` (menu dinamico por role)
- `src/App.tsx` (novas rotas)
- `src/components/ProtectedRoute.tsx` (adicionar vendedor)
- `src/pages/admin/Orcamentos.tsx` (remover criacao manual de OS, link com contrato)
- `src/pages/AcompanharOS.tsx` (bloquear acesso quando encerrada)
- `src/pages/admin/Dashboard.tsx` (adicionar resumo vendedor)

