# 03 - Persistencia e Contrato Unificado

## Objetivo

Garantir que todos os campos de midia sejam persistidos corretamente (frontend + backend), inclusive novos campos como capa e refs de assets em galeria.

## Escopo

- Alinhar tipos de bloco no frontend (`types.ts`).
- Atualizar defaults e migracoes no frontend (`blockFactory`, `migration`).
- Atualizar migracao/sanitizacao no backend para preservar novos campos:
  - `coverSrc`, `coverAssetId`
  - refs de itens de galeria (assetId/src)
- Atualizar validacoes para evitar descarte silencioso de props validas.

## Regras tecnicas

- Compatibilidade retroativa obrigatoria para paginas antigas.
- Nenhum campo novo pode depender apenas de estado local.
- Save/load deve reconstruir estado editavel completo.

## Critérios de aceite

- Save + reload em `/editor/:pageId` preserva todos os campos de midia.
- Preview e publico refletem os mesmos dados.
- Build/test backend e frontend verdes.
