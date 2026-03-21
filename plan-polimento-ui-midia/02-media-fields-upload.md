# 02 - Upload Direto em Campos de Midia

## Objetivo

Adicionar upload direto consistente em campos de midia relevantes (ex.: capa do album, itens de carrossel), mantendo fallback por URL.

## Escopo

- Criar componente reutilizavel `MediaField` com:
  - upload arquivo
  - URL manual
  - estados `sending|processing|ready|failed`
  - acoes de remover/reprocessar
- Integrar `MediaField` em:
  - `MusicBlock` (capa opcional)
  - `GalleryBlock` (cada item da galeria)
  - `ImageBlock` (manter padrao)
- Permitir escolha de asset da biblioteca quando aplicavel.

## Regras tecnicas

- Evitar duplicacao de logica de upload entre blocos.
- Padronizar mensagens de erro/sucesso.
- Ownership e validacoes continuam no backend.

## Critérios de aceite

- Upload direto funcional em capa de musica e galeria.
- URL manual continua funcional.
- Estados de processamento visiveis e coerentes.
- Lint/test/build frontend verdes.
