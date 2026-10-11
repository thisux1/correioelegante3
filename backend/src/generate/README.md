# `generate/` — Pipeline de geração

Subsistema do pipeline generativo (plano §4): `CreativeBrief` → engine →
`PageSpec` → `compilePageSpec` → `PersistedBlock[]`.

## Layout

```
backend/src/
├── contracts/generation.contract.ts   # CreativeBrief + PageSpec (Zod v3, canônico)
└── generate/
    ├── engine/        # L0 regras duras + L1 scoring (S3)
    ├── templates/     # registry de templateFamilies + copy banks (S3+)
    └── compile.ts     # PageSpec → PersistedBlock[] (S3)
```

## Checklist de registro de bloco

Todo novo bloco/módulo **precisa passar por todos os passos** — pular qualquer
um quebra silenciosamente (`page.migration.ts` rebaixa tipo desconhecido para
`text` sem erro):

1. **Contrato**: adicionar o tipo em `MODULE_TYPE_VALUES`
   (`contracts/generation.contract.ts`) e em `BLOCK_TYPE_VALUES`
   (`services/page.constants.ts`).
2. **Migração backend**: handler em `services/page.migration.ts` para
   normalizar/sanitizar props (defaults, limites, strip de campos).
3. **Sanitizer**: regras em `services/page.sanitizer.ts` (MAX_PAGE_BYTES,
   strip de HTML perigoso, etc.).
4. **Tipo frontend**: interface de props em `frontend/src/editor/types.ts` +
   discriminated union `Block`.
5. **Renderer**: componente em `frontend/src/editor/blocks/` registrado em
   `BlockRenderer.tsx` — renderiza em `edit` e `preview`.
6. **Toolbar/criação**: entrada em `EditorToolbar.tsx` quando o bloco for
   criável manualmente.
7. **Registry da engine**: entrada em `generate/templates/registry.ts`
   (quais momentos podem emiti-lo, props deriváveis do brief).
8. **Testes**: migração round-trip (serialize → parse → render) — obrigatório
   por bloco, ver `page.migration` downgrade silencioso.
9. **SPEC.md**: documentar props e payload quando virar contrato de API.
