# Etapa 1 - Fundacao de Midia

> Objetivo: criar base de upload nativo robusto para imagem/video/audio.

## Escopo

- Modelo `Asset` (metadados, ownership, status de processamento).
- Endpoints:
  - `POST /api/assets/upload-url`
  - `POST /api/assets/complete`
  - `GET /api/assets/:id`
  - `GET /api/assets?kind=`
  - `DELETE /api/assets/:id`
- Upload assinado para storage.
- Biblioteca de midia no frontend com estados de progresso.

## Regras tecnicas

- Validar mime e tamanho server-side.
- Ownership estrito por `userId`.
- Estados de processamento: `pending`, `processing`, `ready`, `failed`.

## Limites iniciais recomendados

- Image: ate 10 MB
- Audio: ate 25 MB
- Video: ate 120 MB
- Duracao maxima audio/video: 10 min

## Checklist

- [ ] Upload assinado funcional
- [ ] Registro de asset no backend
- [ ] Biblioteca de assets no editor
- [ ] Erros e retries com UX clara
