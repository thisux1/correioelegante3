# Etapa 0 - Discovery e Guardrails

> Objetivo: fechar riscos estruturais antes de acelerar implementacao.

## Entregas

- Revisao juridica de importacao por link (incluindo possibilidade de YouTube -> MP3).
- Escolha de stack de storage/processamento (Cloudinary vs S3 + FFmpeg + queue).
- Definicao de limites de upload por tipo e politica de custo.
- Definicao de guardrails de seguranca/compliance/moderacao.

## Decisoes obrigatorias

1. Provedor de storage/transcode padrao.
2. Liberacao (ou nao) de conversao por link em cada contexto/pais.
3. Limites por plano (free/pago) para tamanho e duracao.
4. Estrategia de telemetria (Sentry/Datadog/PostHog).

## Checklist

- [ ] Parecer legal documentado
- [ ] Stack de infra aprovada
- [ ] Limites de custo validados
- [ ] Politicas de abuso/takedown definidas
