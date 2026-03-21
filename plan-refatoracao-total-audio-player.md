# Plano de Refatoracao Total - Audio Player (MusicBlock)

> Objetivo: refatorar completamente o player de musica do editor usando `musicplayerexample/` como inspiracao de UX (playlist + visualizer), adaptando para a identidade visual atual do projeto e mantendo compatibilidade de dados.
> Ultima atualizacao: 2026-03-21

---

## 1) Requisitos fechados desta refatoracao

1. Inspiracao no player de `musicplayerexample/`, sem copiar literal.
2. Adaptar visual para o design do site (glass, tokens e tipografia do projeto).
3. Nao incluir botao/config de autoplay.
4. Manter botao de abrir lista de faixas, mas **condicional**:
   - se houver mais de 1 faixa, mostrar toggle de lista.
   - se houver 1 faixa, modo minimalista sem toggle de lista e sem shuffle.
5. Usuario pode adicionar varias musicas (faixas), mas o bloco deve exibir **um unico player** com alternancia de faixas.
6. Lista deve indexar todas as faixas adicionadas no bloco.
7. Cobrir persistencia completa (save/load/migracao/sanitizacao).

---

## 2) Diagnostico tecnico (baseado nos arquivos lidos)

## 2.1 Frontend

- `frontend/src/editor/blocks/MusicBlock.tsx`
  - Arquivo muito grande (monolitico), mistura:
    - upload/asset
    - edicao de campos
    - playback
    - visualizer
    - playlist
  - Alto risco de regressao em manutencao.

- `frontend/src/editor/types.ts`
  - `MusicBlockProps` ja suporta `tracks`, `coverSrc`, `coverAssetId`.
  - Bom ponto para evoluir sem quebrar schema global.

- `frontend/src/editor/migration.ts`
  - Ja migra `tracks`, capa e campos legados.
  - Permite evolucao com backward compatibility.

- `frontend/src/editor/utils/blockFactory.ts`
  - Ja cria defaults para `music` com `tracks: []` e `coverSrc`.

- `frontend/src/editor/components/MediaField.tsx`
  - Ja abstrai upload + URL + status por campo.
  - Pode ser reutilizado para cada faixa/capa.

- `frontend/src/editor/utils/previewFilter.ts`
  - Regra atual de `music` considera apenas `src`/`assetId`.
  - Precisa incluir `tracks` para nao ocultar blocos validos com playlist.

## 2.2 Backend

- `backend/src/services/page.migration.ts`
  - Ja preserva `tracks`, `coverSrc`, `coverAssetId`.

- `backend/src/services/page.sanitizer.ts`
  - Ja sanitiza campos de musica, incluindo lista de tracks.
  - Falta reforcar normalizacao para formato canonico de playlist (dedupe/ordem/limites claros).

- `backend/src/__tests__/pages.test.ts`
  - Ja possui cobertura parcial de campos novos.
  - Precisa ampliar para cenarios de playlist multi-faixa e preservacao de ordem.

## 2.3 Inspiracao (musicplayerexample)

- Padrões aproveitaveis:
  - lista lateral de faixas
  - visualizer em barras
  - controles de faixa anterior/proxima
- Padrões a nao portar:
  - toggle/autoplay
  - visual escuro fora da identidade do produto
  - acoplamento pesado em JS sem componentes

---

## 3) Arquitetura alvo do MusicBlock

Refatorar `MusicBlock` para composicao em subcomponentes/hooks.

Estrutura sugerida:

```txt
frontend/src/editor/blocks/music/
  MusicBlock.tsx                 # orquestrador (edit/preview)
  MusicEditor.tsx                # formulario de faixas/capa/metadados
  MusicPlayerShell.tsx           # container visual (glass, layout, estados)
  MusicPlaybackControls.tsx      # play/pause, prev/next, progresso, volume
  MusicTrackList.tsx             # lista condicional de faixas
  MusicVisualizer.tsx            # visualizer (analyser + fallback)
  useMusicPlayback.ts            # logica de audio element e estado
  useMusicVisualizer.ts          # logica de analyser/raf/fallback
```

Observacao: se nao quiser criar pasta nova agora, manter em um arquivo com secoes internas e extrair hooks locais. Mas o objetivo e reduzir monolito.

---

## 4) Contrato de dados (canonico + compativel)

## 4.1 Modelo canonico no bloco

Manter `tracks[]` como fonte principal de playlist:

```ts
tracks?: Array<{
  assetId?: string
  src: string
  title?: string
  artist?: string
  coverSrc?: string
  coverAssetId?: string
}>
```

## 4.2 Compatibilidade com campos legados

Campos legados (`src`, `assetId`, `title`, `artist`, `coverSrc`, `coverAssetId`) continuam aceitos, mas devem ser normalizados para playlist em runtime/migracao:

- se `tracks` vazio e `src` existir -> criar faixa 0 a partir de campos legados.
- em save/update, espelhar faixa ativa/primeira faixa nos campos legados para manter compatibilidade com fluxos antigos.

## 4.3 Regras de normalizacao

1. remover tracks sem `src` valido.
2. dedupe por `(assetId || src)` mantendo ordem de insercao.
3. limite inicial de tracks por bloco: 30.
4. preservar ordem de tracks definida pelo usuario.

---

## 5) UX alvo (editor e preview)

## 5.1 Edit mode

- Secao "Playlist" com:
  - botao "Adicionar faixa"
  - item de faixa com:
    - campo de audio (upload + URL) via `MediaField` adaptado para audio
    - titulo (opcional)
    - artista (opcional)
    - capa (upload + URL) opcional
    - acoes: mover cima/baixo, remover
- Exibir contagem de faixas e status resumido.

## 5.2 Preview mode

- Um unico player por bloco.
- Componente adaptado ao design do projeto:
  - glassmorphism (`.glass`, `rounded-2xl/3xl`, `var(--color-*)`)
  - `font-display` para titulo da faixa
  - `font-sans` para controles/metadados

Controles:

- Sempre: play/pause, progresso, tempo, volume.
- Somente se playlist > 1:
  - prev/next
  - botao abrir/fechar lista
- Nunca exibir:
  - autoplay toggle
  - shuffle

Lista:

- Quando `tracks.length > 1`, abrir painel/lista com:
  - faixa ativa destacada
  - click para trocar faixa
  - duracao (quando disponivel)

Modo minimalista (1 faixa):

- esconder toggle de lista
- esconder controles nao necessarios de navegacao entre faixas

---

## 6) Visualizer (funcional + robusto)

## 6.1 Comportamento esperado

- Usar `AnalyserNode` quando permitido.
- Atualizar barras com `requestAnimationFrame` apenas durante reproducao.
- Em falha de analyser/cross-origin:
  - cair para fallback visual leve (tempo/progresso/waveform precomputada)
  - sem impactar playback.

## 6.2 Regras tecnicas

1. visualizer nunca interfere no audio output.
2. cleanup completo de `AudioContext`, sources e RAF.
3. reduzir carga em mobile:
   - menos barras
   - animacao simplificada
4. respeitar `prefers-reduced-motion`.

---

## 7) Arquivos a alterar e instrucoes especificas

## 7.1 Frontend principal

1. `frontend/src/editor/blocks/MusicBlock.tsx`
   - quebrar em componentes/hooks.
   - implementar playlist condicional e modo minimalista.
   - remover qualquer comportamento ligado a autoplay/shuffle.

2. `frontend/src/editor/components/MediaField.tsx`
   - permitir uso padrao em tracks de audio e capa por faixa.
   - opcional: aceitar props para variacao de label/estado por item de playlist.

3. `frontend/src/editor/types.ts`
   - manter `tracks` como contrato principal.
   - validar tipagem coerente de faixa/capa.

4. `frontend/src/editor/migration.ts`
   - garantir normalizacao legacy -> playlist.
   - manter espelho de campos legados quando necessario.

5. `frontend/src/editor/utils/blockFactory.ts`
   - defaults de `music` orientados a playlist.

6. `frontend/src/editor/utils/previewFilter.ts`
   - considerar bloco de musica valido quando `tracks` tiver faixa valida, mesmo sem `src` raiz.

## 7.2 Backend (compat e seguranca de persistencia)

7. `backend/src/services/page.migration.ts`
   - reforcar normalizacao de tracks (dedupe/ordem/limite).

8. `backend/src/services/page.sanitizer.ts`
   - reforcar sanitizacao de tracks/capas por faixa.
   - manter bloqueio de protocolos inseguros.

## 7.3 Testes

9. `frontend/src/editor/migration.test.ts`
   - casos de legacy + playlist multi-faixa + preservacao de ordem.

10. `frontend/src/editor/utils/blockFactory.test.ts`
    - defaults de music orientados ao novo comportamento.

11. `frontend/src/editor/utils/previewFilter.test.ts`
    - musica com tracks valida deve aparecer no preview.

12. `backend/src/__tests__/pages.test.ts`
    - garantir persistencia e retorno corretos de playlist/capa.

---

## 8) Checklist de aceite

- [ ] Player de musica refatorado e modularizado.
- [ ] Playlist funcional com troca de faixa.
- [ ] Se houver 1 faixa: UI minimalista (sem lista/shuffle/autoplay).
- [ ] Se houver >1 faixa: botao de lista habilitado e lista funcional.
- [ ] Visualizer funcional com fallback seguro.
- [ ] Save/load preserva tracks e capas de forma consistente.
- [ ] Preview/render publico continuam estaveis.
- [ ] Frontend `npm run lint`, `npm run test`, `npm run build` verdes.
- [ ] Backend `npm run build`, `npm test` verdes (se alterado).

---

## 9) Ordem de implementacao recomendada

1. Contrato e migracao (types + migrations + sanitizer).
2. Extracao da logica de playback/visualizer para hooks.
3. Refatoracao UI do player (minimal + playlist condicional).
4. Refatoracao do editor de faixas (multiplos campos de musica).
5. Ajustes de preview filter.
6. Testes e hardening.

---

## 10) Riscos e mitigacoes

1. Regressao de audio mudo por visualizer
   - Mitigacao: isolamento de visualizer + fallback sem bloqueio.

2. Perda de dados em blocos antigos
   - Mitigacao: migracao backward-compatible + testes de legacy.

3. UI pesada em mobile
   - Mitigacao: simplificar barras/animacao e manter layout condicional.

4. Inconsistencia visual com o projeto
   - Mitigacao: aplicar tokens de `frontend/IDENTIDADE_VISUAL.md` e classes canonicas (`glass`, tipografia, radius).

---

> Resultado esperado: um audio player premium, consistente com o site, robusto tecnicamente e com playlist real baseada nas musicas adicionadas pelo usuario, sem autoplay e com UX condicional inteligente.
