# 05 - QA e Hardening

## Objetivo

Fechar o pacote com validacao robusta de persistencia, upload e playback antes de considerar concluido.

## Escopo

- Testes unitarios:
  - migracoes de bloco com novos campos de midia
  - utilitarios de normalizacao/preview
- Testes de integracao backend:
  - save/load com campos novos
  - ownership e validacao
- E2E/smoke do fluxo critico:
  1. upload audio + capa
  2. upload galeria
  3. salvar
  4. recarregar `/editor/:id`
  5. abrir preview/publico

## Checklist manual obrigatorio

- [ ] Audio toca sem mutar inesperadamente
- [ ] Visualizer responde em tempo real ou fallback coerente
- [ ] Capa de album salva e recarrega
- [ ] Itens da galeria com upload salvam e recarregam
- [ ] Estados de processamento/erro aparecem corretamente

## Critérios de aceite

- Frontend lint/test/build verdes.
- Backend build/test verdes (se houver alteracoes).
- Fluxo de ponta a ponta validado sem perda de dados.
