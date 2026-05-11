
# Fase 4 — Refinamento de papéis, fluxos e permissões

## 1. Usuários (apenas admin master)
- Em `src/pages/admin/Usuarios.tsx`:
  - Botões **Novo usuário**, **Editar**, **Resetar senha**, **Excluir** visíveis somente para `admin`.
  - Diálogos: criar (nome, e-mail, role, senha temporária), editar (nome/matrícula/role), trocar senha, confirmar exclusão.
- Edge function nova **`admin-manage-user`** (service-role) com ações: `create`, `update_profile`, `set_password`, `delete`. Valida que o solicitante tem role `admin`.
- Mantém aprovação por candidatura, mas adiciona criação direta.

## 2. "Esqueci minha senha"
- Em `src/pages/admin/AdminAuth.tsx`: link **Esqueci minha senha** → modal pede e-mail → `supabase.auth.resetPasswordForEmail(email, { redirectTo: <site>/admin/auth?recover=1 })`.
- Trata `recover=1` mostrando formulário para definir nova senha (`supabase.auth.updateUser({ password })`).

## 3. Técnico — esconder Orçamentos e restringir OS
- `src/components/admin/AdminLayout.tsx`: ocultar item **Orçamentos** quando o usuário tem somente `tecnico`.
- `src/App.tsx`: rota `/admin/orcamentos` exige roles `admin|gerente|vendedor|financeiro` (não técnico).
- `src/pages/admin/OrdensServico.tsx`: no card/diálogo da OS para técnico que **ainda não assumiu**:
  - Exibir só: nome do cliente, serviço, **cidade** (sem endereço/telefone/e-mail), lista de materiais previstos.
  - Aviso: *"Dados completos só após assumir a OS."*
  - Após assumir (`tecnico_id = auth.uid()`), libera visualização total.

## 4. Vendedor — solicitar orçamento + acompanhar evolução
- Em `src/pages/admin/Orcamentos.tsx`:
  - Vendedor passa a poder **inserir solicitação** (`status='solicitado'`, `vendedor_id=auth.uid()`, `origem='vendedor'`).
  - Listagem do vendedor mostra abas/cards: **Solicitados**, **Aprovados (em execução)**, **Realizados (finalizados)**, **Comissões 10%**.
- RLS: adicionar policies para `vendedor` inserir orçamento próprio e visualizar onde `vendedor_id = auth.uid()`.

## 5. Gerente — fluxo completo
- Em `src/pages/admin/Dashboard.tsx` (visão gerente): cards **Solicitações de orçamento**, **Orçamentos realizados**, **OS criadas**, **OS aguardando vistoria**, **OS finalizadas**.
- Gerente edita orçamento `solicitado` → completa valores → marca `aprovado` (trigger existente já cria OS).
- Vistoria/aprovação libera pagamento técnico (trigger `on_supervisao_aprovada` já existe).

## 6. Técnico — dashboard de pagamentos
- Em `Dashboard.tsx` (visão técnico): cards de **A receber** / **Liberados** / **Pagos** lendo de `financeiro_contas` (`categoria='comissao_tecnico'` + `referencia_tipo='ordens_servico'` cujas OS sejam do técnico).

## 7. Trabalhe Conosco
- Em `src/components/TrabalheConosco.tsx`:
  - `cargo_desejado` vira `Select`: Técnico, Gerente, Vendedor, Call Center.
  - Substituir `disponibilidade` por **Modalidade** (`Select`): Freelance, Home Office, CLT, Colaborador, Parceiro, Fornecedor.
- Coluna `candidaturas.disponibilidade` continua armazenando o valor (sem migração nova).

## 8. Permissões granulares operantes
- Criar `src/hooks/usePermissions.ts`: carrega `user_permissions` do usuário + roles, expõe `can(module, action)`.
  - Regra: se houver linha em `user_permissions` para `(user_id, module)`, ela **sobrescreve** o default por role; senão usa o default por role.
- Aplicar nas páginas (`Usuarios`, `Clientes`, `Orcamentos`, `OrdensServico`, `Estoque`, `Financeiro`, `Visitas`, `Agenda`, `Configuracoes`):
  - Esconder botões Novo/Editar/Excluir quando `can(...)` é falso.
  - Em `AdminLayout` ocultar itens de menu quando `can(module,'view')` é falso.

## SQL (migration)
- Policies extra em `orcamentos`: vendedor pode `INSERT` com `vendedor_id=auth.uid()` e status `solicitado`; vendedor `UPDATE` próprio enquanto `status='solicitado'`.
- Permitir status `solicitado` (texto livre, já aceito).
- Nenhuma alteração de schema necessária.

## Arquivos a criar/editar
- **Criar**: `supabase/functions/admin-manage-user/index.ts`, `src/hooks/usePermissions.ts`, migration de policies.
- **Editar**: `Usuarios.tsx`, `AdminAuth.tsx`, `AdminLayout.tsx`, `App.tsx`, `OrdensServico.tsx`, `Orcamentos.tsx`, `Dashboard.tsx`, `TrabalheConosco.tsx`.

Confirma para eu prosseguir com a implementação completa?
