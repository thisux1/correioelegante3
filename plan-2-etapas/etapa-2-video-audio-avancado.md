# Etapa 2 - Video/Audio Avancado

> Objetivo: elevar experiencia de midia com processamento e blocos dedicados.

## Escopo

- Novo `VideoBlock` com suporte a `assetId`, poster e controls.
- Evolucao do `MusicBlock` com waveform e UX de player melhorada.
- Workers para processamento:
  - transcode de video/audio
  - geracao de poster
  - geracao de waveform

## Processamento

- Video: normalizacao de codec + variante mobile.
- Audio: normalizacao de bitrate (ex: 128 kbps).
- Gatilhos de status para UI (polling ou websocket).

## Checklist

- [ ] VideoBlock funcional em edit/preview/publico
- [ ] MusicBlock com waveform e controles consistentes
- [ ] Pipeline de processamento confiavel
- [ ] Fallback para erros de process
