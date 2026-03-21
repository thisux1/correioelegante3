# Etapa 3 - Importacao por Link (condicional)

> Objetivo: reduzir friccao para adicionar audio/video por URL, com compliance.

## Escopo

- Campo de "colar link" com parser de provider.
- Fluxo seguro por padrao:
  - embed quando permitido
  - fallback para upload manual
- Conversao automatica (ex: YouTube -> MP3) **somente se aprovado juridicamente**.

## Guardrails

- Rate limit forte por usuario/IP.
- Timeout e limite de duracao.
- Bloqueio de dominios nao confiaveis.
- Log de origem para auditoria.

## UX

1. Colar link
2. Validar suporte
3. Processar/importar
4. Confirmar asset pronto

## Checklist

- [ ] Parser de links suportados
- [ ] Fluxo de fallback claro
- [ ] Gate legal ativo para conversao
- [ ] Politica de abuso/takedown aplicada
