
## Plano: Fluxo Completo do Técnico

### 1. Alterações no Banco de Dados

**Tabela `ordens_servico` - novos campos:**
- `prazo_termino` (date) - prazo para conclusão
- `valor_instalacao` (numeric, default 0) - valor que o técnico recebe pela instalação
- `status` - adicionar novos estados: `aguardando_supervisao`, `supervisionada`
- `checklist_materiais` (boolean, default false)
- `checklist_instalacao` (boolean, default false)  
- `checklist_teste` (boolean, default false)
- `checklist_limpeza` (boolean, default false)
- `checklist_fotos` (boolean, default false)
- `checklist_assinatura_cliente` (boolean, default false)
- `supervisao_aprovada` (boolean, default false)
- `supervisao_por` (uuid, nullable) - gerente que supervisionou
- `supervisao_data` (timestamptz, nullable)
- `valor_liberado` (boolean, default false)

**Tabela `orcamentos` - novo campo:**
- `valor_instalacao` (numeric, default 0) - valor da instalação definido pelo admin após aprovar

### 2. Fluxo de Trabalho

1. Admin cria orçamento → aprova → define valor de instalação → gera OS com prazo e valor
2. Técnico visualiza detalhes da OS (modal) antes de aceitar
3. Técnico aceita OS (apenas 1 por vez)
4. Durante execução, técnico preenche checklist (6 itens)
5. Checklist 100% → botão "Finalizar e Solicitar Supervisão" aparece
6. Status muda para `aguardando_supervisao`
7. Gerente supervisiona e aprova
8. Status muda para `supervisionada` → `valor_liberado = true`
9. Dashboard do técnico mostra: OS ativa, contadores, valor liberado

### 3. Alterações de Interface

**OrdensServico.tsx:**
- Modal de visualização detalhada antes de aceitar
- Cards com data de criação e prazo
- Checklist interativo para técnico na OS em andamento
- Botão "Finalizar e Solicitar Supervisão" (só aparece com checklist completo)

**Dashboard.tsx (visão técnico):**
- Card: OS ativa atual com detalhes e checklist
- Card: Ordens concluídas (contador)
- Card: Ordens em andamento (contador)
- Card: Valores a receber (soma dos valores liberados)
- Card: Valores liberados para recebimento

**Orcamentos.tsx:**
- Campo de valor de instalação ao aprovar orçamento

### 4. Arquivos a Alterar
- Migração SQL (novos campos)
- `src/pages/admin/OrdensServico.tsx`
- `src/pages/admin/Dashboard.tsx`
- `src/pages/admin/Orcamentos.tsx`
