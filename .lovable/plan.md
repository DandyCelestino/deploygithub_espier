## Escopo Geral

Esta fase amplia o ERP com fluxo financeiro automático para vendedores, expansão do cadastro de estoque e integração do formulário público de orçamento com a área restrita.

---

## 1. Estoque — Cadastro Profissional

Ampliar `estoque_itens` e a tela `Estoque.tsx`:

**Novos campos:**
- `valor_compra` (numeric) — custo do produto
- `valor_venda` (numeric) — preço de venda
- `descricao_produto` (text) — descrição detalhada
- `usabilidade` (text) — para que serve / aplicação
- `produtos_associados` (uuid[]) — referências a outros itens do estoque
- `categoria_uso` (text: "instalacao" | "orcamento" | "ambos") — botão para designar onde o item entra

**UI:** formulário expandido com abas (Dados / Descrição / Associados), tabela mostra qtd em estoque + valores (visíveis para admin/gerente/financeiro; técnico vê apenas qtd e descrição).

---

## 2. Orçamentos — Cliente do Cadastro

No diálogo "Novo orçamento" em `Orcamentos.tsx`:
- Adicionar `Select` carregando `clientes` cadastrados
- Ao selecionar, preencher automaticamente nome, e-mail, telefone, endereço, cidade, estado
- Manter opção de digitar manualmente (cliente novo)

---

## 3. Módulo Vendedor — Painel & Comissões

**Tabelas novas:**
- `vendedor_comissoes`: `vendedor_id`, `orcamento_id`, `ordem_servico_id`, `tipo` (avulsa/recorrente), `valor`, `status` (em_execucao / a_receber / pago), `parcela_num`, `parcela_total`, `data_prevista`
- Nas `visitas`, exibir histórico vinculado ao vendedor logado

**Triggers automáticos:**
- Quando `ordens_servico.status = 'aberta'` (gerente aprovou OS): criar registro `em_execucao` na comissão do vendedor
- Quando `supervisao_aprovada = true` (OS finalizada e vistoriada): mover comissão para `a_receber`
- Se serviço **avulso**: 1 parcela = 10% do `valor_instalacao`
- Se serviço **com mensalidade** (novo flag `tipo_servico` em orçamento + `valor_mensal`): 
  - gerar 3 parcelas mensais (10% do valor mensal) em `vendedor_comissoes`
  - gerar contas recorrentes em `financeiro_contas` (receita do cliente, mês a mês, marcadas com `referencia_tipo='mensalidade'`)

**Dashboard do Vendedor (`Dashboard.tsx`):** 
- Card "Em execução" (aprovadas, ainda não instaladas)
- Card "A receber" (instaladas, aguardando pagamento)
- Card "Recebidas" 
- Tabela com cada etapa: visita → orçamento → OS → técnico executor → status atual

**Página Visitas:** mostrar baixa de estoque vinculada (via OS) e técnico executor.

---

## 4. Site Público → Orçamento Imediato

`src/components/Contact.tsx` (formulário público):
- Ao enviar, criar registro em `orcamentos` com `status='pendente'`, `criado_por=NULL` (origem pública), campo novo `origem='site'`, `setor_responsavel=NULL`
- Política RLS: permitir INSERT anônimo apenas com `origem='site'` e `status='pendente'`

**Tela Orçamentos (admin):**
- Filtro novo "Origem" (site / interno)
- Campo "Setor responsável" (Select: comercial/tecnico/financeiro/gerencia) — apenas admin pode designar
- Badge visual quando origem=site e ainda sem setor designado

---

## 5. Migração SQL (resumo)

```sql
ALTER TABLE estoque_itens 
  ADD COLUMN valor_compra numeric DEFAULT 0,
  ADD COLUMN valor_venda numeric DEFAULT 0,
  ADD COLUMN descricao_produto text,
  ADD COLUMN usabilidade text,
  ADD COLUMN produtos_associados uuid[] DEFAULT '{}',
  ADD COLUMN categoria_uso text DEFAULT 'ambos';

ALTER TABLE orcamentos
  ADD COLUMN cliente_id uuid,
  ADD COLUMN tipo_servico text DEFAULT 'avulso',  -- avulso | mensalidade
  ADD COLUMN valor_mensal numeric DEFAULT 0,
  ADD COLUMN origem text DEFAULT 'interno',       -- interno | site
  ADD COLUMN setor_responsavel text,
  ADD COLUMN vendedor_id uuid;

CREATE TABLE vendedor_comissoes (...);

-- Triggers: 
-- on_os_aprovada_para_execucao  → cria comissao em_execucao
-- on_os_finalizada_para_receber → move para a_receber + cria recorrência se mensalidade

-- Política RLS para INSERT público em orçamentos (origem=site)
```

---

## 6. Arquivos Afetados

**Migrations:** 1 nova migration consolidada.

**Editar:**
- `src/pages/admin/Estoque.tsx` (form expandido + colunas)
- `src/pages/admin/Orcamentos.tsx` (select de cliente + tipo_servico + setor)
- `src/pages/admin/Visitas.tsx` (histórico + técnico vinculado)
- `src/pages/admin/Dashboard.tsx` (cards do vendedor)
- `src/components/Contact.tsx` (envio público → orçamento)

**Criar:**
- `src/pages/admin/Comissoes.tsx` + rota `/admin/comissoes` (admin/gerente/vendedor)
- `src/components/admin/AdminLayout.tsx` (item de menu)

---

## Confirmações antes de implementar

1. **Comissão recorrente:** "3 meses de 10% do serviço" — entendo como 10% do **valor mensal** por 3 meses consecutivos. Confirma?
2. **Cobrança recorrente do cliente:** gerar quantas parcelas? (12? indefinido até cancelar contrato? sugiro 12 meses inicialmente)
3. **Setor responsável (orçamentos do site):** apenas Admin pode designar, ou Gerente também?
