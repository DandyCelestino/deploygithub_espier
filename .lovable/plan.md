

## Plano: Tema Claro para a Área Restrita

### Problema
Atualmente, a área restrita usa cards com fundo escuro (preto) e fontes brancas/cinzas. O usuário deseja que:
1. **Botões do menu lateral (sidebar)**: fundo branco com letras pretas
2. **Cards e formulários**: fundo branco com fontes pretas

### Causa Raiz
O CSS define `--card: 0 0% 5%` (preto) e `--background: 0 0% 100%` (branco). Todas as páginas admin usam `bg-card` (preto) para cards e `bg-background` (branco) para inputs, mas com `text-white` forçado — resultando em texto invisível em campos brancos.

### Solução
Inverter o tema da área administrativa para fundo claro, aplicando as mudanças em todos os arquivos de uma vez.

### Arquivos a Alterar

**1. `src/components/admin/AdminSidebar.tsx`**
- Sidebar: `bg-card` → `bg-white`
- Texto dos itens de menu: remover cores escuras, usar `text-gray-800`
- Logo e footer: fontes escuras sobre fundo branco
- Botão "Sair": texto escuro

**2. `src/components/admin/AdminLayout.tsx`**
- Header: `bg-card` → `bg-white`
- Background principal: manter `bg-gray-100` ou similar para contraste
- Textos do header: cores escuras

**3. Todas as páginas admin (6 arquivos)**
`Dashboard.tsx`, `OrdensServico.tsx`, `Orcamentos.tsx`, `Estoque.tsx`, `Financeiro.tsx`, `Administracao.tsx`, `Configuracoes.tsx`

Para cada arquivo:
- Cards: `bg-card border-border` → `bg-white border-gray-200`
- Títulos: `text-white` → `text-gray-900`
- Subtítulos/labels: `text-gray-400` / `text-gray-300` → `text-gray-600` / `text-gray-500`
- Inputs: `bg-background border-border text-white` → `bg-white border-gray-300 text-gray-900`
- Tabelas: headers `text-gray-300` → `text-gray-600`, cells `text-white` → `text-gray-900`, cells secundários `text-gray-300` → `text-gray-600`
- Dialogs: `bg-card border-border` → `bg-white border-gray-200`
- Tabs: adaptar para tema claro

**4. `src/pages/Login.tsx`**
- Card de login: fundo branco, textos escuros
- Inputs: fundo branco com borda cinza e texto preto

### Detalhes Técnicos
- Nenhuma alteração de banco de dados necessária
- Nenhuma alteração de lógica/funcionalidade
- Apenas substituição de classes Tailwind CSS de tema escuro para tema claro em ~9 arquivos
- As variáveis CSS globais em `index.css` não serão alteradas para não afetar o site público

