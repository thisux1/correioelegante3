# Etapa 4 - Motion e Consistencia UI

> Objetivo: remover rigidez visual e padronizar experiencia em telas-chave.

## Escopo Motion

- Criar `motionTokens` centralizados (duracoes/eases/presets).
- Aplicar em:
  - Home
  - Create
  - Editor header/estados vazios
  - transicoes de rota
- Respeitar `prefers-reduced-motion`.

## Escopo Consistencia Visual

- Auditoria e refino de perfil/configuracoes.
- Padronizar componentes:
  - `SectionCard`
  - `SettingRow`
  - `EmptyState`
  - `InlineAlert`
  - `FormActions`
- Unificar spacing, tipografia, elevacao e estados de UI.

## Checklist

- [ ] Motion tokens em uso real
- [ ] Entradas/transicoes sem jank
- [ ] Perfil/configuracoes com linguagem unica
- [ ] Acessibilidade AA minima (contraste/foco/labels)
