# 04 - Consistencia Visual e UX

## Objetivo

Elevar qualidade visual e consistencia de UX no editor e nas telas de conta (perfil/configuracoes), reduzindo sensacao de interface "pobre".

## Escopo

- Definir mini guia de estilo para blocos de midia:
  - spacing
  - radius
  - bordas
  - estados
  - tipografia
- Uniformizar componentes de feedback:
  - mensagens de erro/sucesso
  - skeleton/loading
  - empty states
- Refino de perfil/configuracoes com componentes padrao:
  - `SectionCard`
  - `SettingRow`
  - `InlineAlert`
- Ajustar microinteracoes e transicoes leves nas aberturas estaticas.

## Regras tecnicas

- Respeitar design system existente (tokens/CSS vars).
- Evitar animacoes excessivas; foco em fluidez e clareza.

## Critérios de aceite

- Coerencia visual perceptivel entre editor e area de conta.
- Menos variacao arbitraria de estilos para controles semelhantes.
- Lint/build frontend verdes.
