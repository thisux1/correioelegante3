# Prompt - Finalizacao Geral do Pacote de Polimento

Use este prompt para implementar o pacote completo de uma vez.

```txt
Implemente o pacote completo de polimento de UI + midia em uma unica entrega, cobrindo:

1) Player de musica premium + visualizer funcional (com fallback robusto)
2) Upload direto em campos de midia (capa de album, carrossel, etc.)
3) Persistencia completa dos novos campos (frontend + backend)
4) Consistencia visual e refinos de UX (incluindo perfil/configuracoes)
5) QA/hardening final com validacao de fluxo de ponta a ponta

MODO ECONOMIA DE TOKENS (obrigatorio):
- Nao fazer grep/glob amplo.
- Ler apenas os arquivos necessarios + os planos em `plan-polimento-ui-midia/`.
- Se faltar contexto, pedir no maximo 1 arquivo por vez.

Fontes de verdade:
- `plan-polimento-ui-midia/01-player-visualizer.md`
- `plan-polimento-ui-midia/02-media-fields-upload.md`
- `plan-polimento-ui-midia/03-persistencia-contrato.md`
- `plan-polimento-ui-midia/04-consistencia-ui.md`
- `plan-polimento-ui-midia/05-qa-hardening.md`

Contexto atual:
- O bug de audio mudo principal ja foi mitigado, mas ainda ha baixa qualidade visual/consistencia.
- Persistencia de capa ainda apresenta comportamento inconsistente em alguns fluxos.
- Falta upload direto em campos como capa e galeria/carrossel.
- Existe impacto backend para manutencao de estados de processamento.

Objetivo final:
- Tudo que for midia relevante deve ser editavel e salvavel de ponta a ponta (save/reload/preview/publico), com UX consistente e visual premium.

Escopo obrigatorio:

A. Music player + visualizer
- Refatorar `MusicBlock` separando responsabilidades (core playback, visualizer, shell UI).
- Estilo glassmorphism minimalista.
- Visualizer com Web Audio API quando possivel + fallback que nao quebra audio.
- Incluir/garantir campo de capa opcional funcional e persistente.

B. Upload direto em campos de midia
- Criar/usar componente reutilizavel de campo de midia (`MediaField`) para upload + URL + estados.
- Integrar em:
  - capa do MusicBlock
  - GalleryBlock (itens)
  - manter ImageBlock no mesmo padrao

C. Persistencia e contrato
- Alinhar tipos frontend, defaults, migracoes frontend e backend.
- Garantir backend sanitizer/migration preservando campos novos (sem descarte silencioso).
- Garantir compatibilidade com conteudo legado.

D. Consistencia visual
- Padronizar estados, mensagens, spacing e feedbacks em blocos de midia.
- Refinar consistencia visual em perfil/configuracoes com componentes reutilizaveis, sem redesign disruptivo.

E. QA/Hardening
- Adicionar/ajustar testes unitarios e de integracao para novos campos e fluxos.
- Validar save + reload em `/editor/:pageId` sem perda de dados de midia.

Fora de escopo:
- Novas features de importacao por link/YouTube
- Mudancas amplas de arquitetura nao necessarias para o pacote

Critérios de aceite:
- Audio toca com confiabilidade e visualizer funciona (ou fallback coerente).
- Capa da musica salva e recarrega.
- Upload direto em galeria e capa funcional.
- Save/reload preserva refs de midia e estados relevantes.
- Frontend: `npm run lint`, `npm run test`, `npm run build` verdes.
- Backend (se alterado): `npm run build`, `npm test` verdes.

Formato da resposta final:
1) Plano curto (5 passos)
2) Arquivos alterados/criados
3) Decisoes tecnicas importantes
4) Resultado de lint/test/build
5) Pendencias e riscos
```
