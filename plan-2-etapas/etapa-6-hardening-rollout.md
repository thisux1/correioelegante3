# Etapa 6 - Hardening e Rollout

> Objetivo: fechar qualidade, observabilidade e operacao segura para liberar em fases.

## Escopo

- Testes E2E finais do fluxo critico:
  1. `/create` -> template
  2. `/editor` -> upload de midia
  3. salvar
  4. reabrir `/editor/:id`
  5. abrir card publico
- Hardening de performance e erros operacionais.
- Runbook de rollout/rollback atualizado.
- Rollout progressivo por feature flag.

## Rollout sugerido

1. Internal only
2. 5%
3. 20%
4. 50%
5. 100%

## KPIs de gate

- Taxa de erro upload/processamento
- Tempo medio de processamento
- Conversao create -> publish
- Erros frontend/backend por release

## Checklist

- [ ] E2E principal verde
- [ ] CI quality gate completo
- [ ] Observabilidade ativa
- [ ] Runbook validado
- [ ] Rollout em fases concluido
