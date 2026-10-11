# design-templates/

Cópia de trabalho de `design-previews/` — estes arquivos evoluem **iterativamente** até virarem os templates de produção do Correio Elegante (o que `PageSpec` compila e o editor renderiza).

- `design-previews/` = snapshot de exploração (congelado, referência)
- `design-templates/` = work in progress → produção

Cada subpasta mantém `PROMPT.md` (o brief que gerou o estilo), `lp.html`, `card.html` e `README.md` (paleta/fontes/tokens).

## Direção de evolução

1. Fundir o melhor de cada estilo no sistema "romantic OS" (decisão D3 do plano)
2. Quebrar `card.html` em blocos/componentes mapeáveis para o schema do editor
3. Parametrizar nomes/textos/cores como slots do `CreativeBrief`
4. Extrair tokens compartilhados (bevels, painéis, `steps()`, fontes) para o design system

Referência de produto a superar: meupresente.app (mundo semi-aberto tipo Pokémon + quest line).
