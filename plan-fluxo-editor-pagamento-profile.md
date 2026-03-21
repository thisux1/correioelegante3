# Plano Completo - Fechar Fluxo Editor -> Pagamento -> Publicacao -> Perfil

> Objetivo: completar o fluxo de produto no frontend/backend para que o usuario consiga sair do editor, pagar (Pix ou cartao), publicar e visualizar no perfil/publico sem depender apenas do fluxo legado de mensagens.
> Ultima atualizacao: 2026-03-21

---

## 1. Contexto Atual

Fluxo observado hoje:

1. LP -> Criar
2. Login
3. Perfil (sem mensagens)
4. Criar mensagem
5. Escolher template
6. Salvar/editar no editor

Gap principal:

- A pagina de pagamento existe (`/payment/:messageId`) e integra Stripe/Mercado Pago.
- Porem, o editor modular (`Page`) nao tem ponte de UX para pagamento.
- A `Profile` ainda prioriza o dominio legado `Message` e nao organiza bem rascunhos/itens do editor.

Resultado:

- Usuario cria no editor, mas nao encontra caminho claro para pagar/publicar.

---

## 2. Objetivo de Produto (Fluxo Alvo)

Fluxo alvo completo:

1. Usuario abre `/create`.
2. Escolhe template ou branco e vai para `/editor`.
3. Salva rascunho (`Page` em `draft`).
4. Clica em "Pagar e publicar".
5. Vai para pagamento (Pix/cartao).
6. Webhook confirma pagamento.
7. Recurso fica `published`.
8. Usuario ve no perfil em secoes corretas e consegue abrir versao publica.

Compatibilidade obrigatoria:

- Fluxo legado de `Message` continua funcionando enquanto houver dados antigos.
- Novo fluxo de `Page` vira caminho principal.

---

## 3. Decisao de Arquitetura (Pragmatica)

Para implementar rapido e sem ruptura:

1. **Estender pagamento para dois tipos de recurso**:
   - `message` (legado)
   - `page` (novo editor)

2. **Manter endpoint de pagamento atual com backward compatibility**:
   - payload antigo (`messageId`) continua aceito.
   - payload novo usa `resourceType` + `resourceId`.

3. **Adicionar estado de pagamento em `Page`** (similar a `Message`):
   - `paymentStatus`
   - `paymentId`
   - `paymentProvider`
   - `paymentMethod`

4. **Separar visualizacao publica por rota**:
   - legado: `/card/:id` (message)
   - editor: `/card/page/:pageId` (page)

5. **Profile passa a ser "hub" com secoes por origem/status**.

---

## 4. Mudancas de Dados (Prisma + Dominio)

## 4.1 Model `Page` (backend/prisma/schema.prisma)

Adicionar campos:

- `paymentStatus String @default("pending")`
- `paymentId String?`
- `paymentProvider String?` // stripe | mercadopago
- `paymentMethod String?` // pix | credit_card

Indices recomendados:

- `@@index([userId, paymentStatus])`
- `@@index([paymentId])`

## 4.2 Regras de lifecycle

- Pagamento aprovado deve colocar `status='published'` e `publishedAt=now` (quando aplicavel).
- Sem pagamento aprovado, manter `draft`.

---

## 5. Backend - Plano Tecnico

## 5.1 Validacao de entrada

Arquivo: `backend/src/utils/validation.ts`

Atualizar `createPaymentSchema` para aceitar:

- Novo contrato:
  - `resourceType: 'message' | 'page'`
  - `resourceId: string`
  - `paymentMethod: 'pix' | 'credit_card'`
- Legacy suportado:
  - `messageId` (mapear internamente para `resourceType='message'`).

## 5.2 Controlador de pagamento

Arquivo: `backend/src/controllers/payment.controller.ts`

Atualizar `createPayment` para:

- Resolver alvo (`message` ou `page`).
- Chamar service Stripe/Mercado Pago com metadados do recurso.

Atualizar `getPaymentStatus`:

- Novo endpoint recomendado: `GET /api/payments/status/:resourceType/:resourceId`
- Manter endpoint antigo `status/:messageId` para compatibilidade.

## 5.3 Services Stripe/Mercado Pago

Arquivos:

- `backend/src/services/stripe.service.ts`
- `backend/src/services/mercadopago.service.ts`

Mudancas:

- `createCardPayment` e `createPixPayment` devem aceitar alvo generico:
  - `{ resourceType, resourceId, userId }`
- Salvar `paymentId/paymentProvider/paymentMethod` no recurso correto.
- Webhooks:
  - identificar se metadata e de `message` ou `page`.
  - atualizar `paymentStatus='paid'` no recurso certo.
  - para `page`, tambem publicar (`status='published'`, `publishedAt`).

## 5.4 Rotas

Arquivo: `backend/src/routes/payment.routes.ts`

- Manter:
  - `POST /api/payments/create`
  - `GET /api/payments/status/:messageId` (legacy)
- Adicionar:
  - `GET /api/payments/status/:resourceType/:resourceId`

## 5.5 Acesso publico de Page

Arquivo: `backend/src/controllers/page.controller.ts`

Revisar `getPage` para nao bloquear acesso publico publicado por flag de editor.

- Feature flag deve proteger CRUD/editor.
- Card publico de page publicada deve continuar acessivel.

---

## 6. Frontend - Plano Tecnico

## 6.1 Service de pagamento desacoplado

Criar arquivo:

- `frontend/src/services/paymentService.ts`

Contrato sugerido:

- `createPayment({ resourceType, resourceId, paymentMethod })`
- `getPaymentStatus(resourceType, resourceId)`
- adaptadores de compatibilidade para `messageId`.

## 6.2 Editor com CTA de pagamento

Arquivos:

- `frontend/src/pages/Editor.tsx`
- `frontend/src/editor/components/EditorToolbar.tsx`

Mudancas:

- Exibir acao "Pagar e publicar" quando:
  - pagina salva (`pageId` existe)
  - status ainda nao publicado
- Navegar para rota de pagamento de page:
  - `/payment/page/:pageId`

UX:

- Se pagina ainda nao foi salva, mostrar feedback: "Salve antes de pagar".

## 6.3 Payment e Success com resourceType

Arquivos:

- `frontend/src/pages/Payment.tsx`
- `frontend/src/pages/PaymentSuccess.tsx`
- `frontend/src/app/router.tsx`

Rotas recomendadas:

- Legacy:
  - `/payment/:messageId`
  - `/payment/:messageId/success`
- Novo:
  - `/payment/page/:pageId`
  - `/payment/page/:pageId/success`

Comportamento:

- Payment detecta tipo do recurso e usa service novo.
- Success redireciona para:
  - message: `/card/:id`
  - page: `/card/page/:pageId`

## 6.4 Card publico para page

Criar arquivo:

- `frontend/src/pages/PageCard.tsx`

Uso:

- Carregar `pageService.loadPage(pageId)`
- Renderizar com `PageRenderer` + tema.

Router:

- `GET /card/page/:pageId` -> `PageCard`

## 6.5 Profile como hub de conteudo

Arquivo: `frontend/src/pages/Profile.tsx`

Objetivo:

- Exibir em abas/secoes:
  1. **Rascunhos do editor** (`Page` draft)
  2. **Pagos/publicados do editor** (`Page` paid/published)
  3. **Mensagens legadas pagas** (`Message` paid)
  4. (opcional) **Mensagens pendentes** (`Message` pending)

Acoes:

- Draft page: `Continuar edicao` -> `/editor/:id`
- Page nao paga: `Pagar agora` -> `/payment/page/:id`
- Page publicada: `Abrir card` -> `/card/page/:id`
- Legacy paid: `Abrir card` -> `/card/:id`
- Legacy pending: `Pagar` -> `/payment/:id`

---

## 7. Compatibilidade e Migracao

## 7.1 Backward compatibility obrigatoria

- APIs de `Message` continuam funcionando.
- Rota `/card/:id` legado permanece.
- Rota `/payment/:messageId` legado permanece.

## 7.2 Pages existentes

- Pages antigas sem campos de pagamento devem assumir:
  - `paymentStatus='pending'`

---

## 8. Testes Necessarios

## 8.1 Backend

- `payment.test.ts`:
  - create payment para message e page
  - webhook atualiza recurso correto
  - status endpoint novo
- `pages.test.ts`:
  - page publicada por pagamento fica acessivel publicamente

## 8.2 Frontend

- `Payment`:
  - fluxo para message e page
- `Profile`:
  - render de secoes com dados mistos
  - CTAs corretos por status/tipo
- smoke manual:
  - `/create -> /editor -> salvar -> pagar -> success -> card/page`

---

## 9. Ordem de Implementacao (sugerida)

1. **Backend contrato pagamento generico** (resourceType/resourceId).
2. **Persistencia de payment em Page + webhook page**.
3. **Rotas frontend de payment page + success page**.
4. **Editor CTA "Pagar e publicar"**.
5. **PageCard publico**.
6. **Profile hub com rascunhos + pagos (page/message)**.
7. **Testes + hardening**.

---

## 10. Checklist de Pronto

- [ ] Usuario consegue ir do editor para pagamento de page.
- [ ] Pix e cartao funcionam para page.
- [ ] Webhook publica page apos pagamento aprovado.
- [ ] `PaymentSuccess` redireciona para card correto (message/page).
- [ ] Profile mostra rascunhos do editor.
- [ ] Profile mostra pagos/publicados de forma clara.
- [ ] Fluxo legado continua funcional.
- [ ] Frontend lint/build verdes.
- [ ] Backend build/test verdes.

---

## 11. Riscos e Mitigacoes

1. **Confusao entre IDs de message e page**
   - Mitigacao: rota tipada para page (`/payment/page/:id`, `/card/page/:id`).

2. **Webhook atualizando recurso errado**
   - Mitigacao: metadata obrigatoria com `resourceType` + `resourceId` + validacao.

3. **Flag de editor bloquear card publico de page**
   - Mitigacao: separar claramente gate de editor x acesso publico.

4. **Profile ficar pesada com muitos itens**
   - Mitigacao: secoes colapsaveis e paginação futura (se necessario).

---

## 12. Arquivos Provaveis de Alteracao

Backend:

- `backend/prisma/schema.prisma`
- `backend/src/utils/validation.ts`
- `backend/src/routes/payment.routes.ts`
- `backend/src/controllers/payment.controller.ts`
- `backend/src/services/stripe.service.ts`
- `backend/src/services/mercadopago.service.ts`
- `backend/src/controllers/page.controller.ts`
- `backend/src/__tests__/payment.test.ts`
- `backend/src/__tests__/pages.test.ts`

Frontend:

- `frontend/src/services/paymentService.ts` (novo)
- `frontend/src/pages/Payment.tsx`
- `frontend/src/pages/PaymentSuccess.tsx`
- `frontend/src/pages/Editor.tsx`
- `frontend/src/editor/components/EditorToolbar.tsx`
- `frontend/src/pages/Profile.tsx`
- `frontend/src/pages/PageCard.tsx` (novo)
- `frontend/src/app/router.tsx`

---

> Resultado esperado: fluxo fechado de produto para editor modular, com pagamento acessivel, publicacao confiavel e visibilidade correta no perfil.
