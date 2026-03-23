# Editor modular contracts

## Regra de precedencia de dados (rascunho local vs backend)

Fonte: Etapa 0 do plano oficial.

- Ao abrir `/editor/:pageId`:
  1. Buscar pagina no backend.
  2. Se existir rascunho local para o mesmo `pageId`, comparar `updatedAt`.
  3. Se o local for mais novo, pedir decisao do usuario:
     - continuar rascunho local
     - usar versao salva
- Ao abrir `/editor` sem `pageId`:
  - usar rascunho local se existir
  - senao iniciar em branco

Implementacao base em `frontend/src/editor/draftPrecedence.ts`:

- `resolveDraftPrecedence(...)` retorna decisao deterministica (`use-local`, `use-backend`, `ask-user`, `use-empty`).
- `LOCAL_DRAFT_PREFERENCE_PROMPT` define texto padrao para o modal de escolha.
