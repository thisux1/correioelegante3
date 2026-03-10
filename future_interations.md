# Correio Elegante — Iterações Futuras

Plataforma modular de páginas emocionais. Começa como correio elegante digital, escala para plataforma completa de expressão emocional para casais e anônimos.

Dois públicos-alvo:
1. **Casais** — querem presentear quem amam com páginas personalizadas
2. **Solteiros / anônimos** — querem enviar cartas no estilo correio elegante clássico de escolas brasileiras, onde alunos tímidos pagam uma pequena quantia para entregar uma carta, doce ou serenata para quem amam em anonimato

Foco inicial: correio elegante. Arquitetura escalável para o resto.

---

## 📍 Estado Atual do Projeto

### Stack

| Camada   | Tecnologias                                                                    |
| -------- | ------------------------------------------------------------------------------ |
| Frontend | React 19, Vite, Tailwind CSS v4, Zustand, Framer Motion, GSAP, Lenis          |
| Backend  | Express 5, TypeScript, Prisma, MongoDB (Atlas)                                 |
| Infra    | Cloudinary (mídia), Stripe (cartão/boleto), Mercado Pago (PIX), JWT (auth)    |

### O que já existe

- **Auth completo** — registro, login, JWT access/refresh tokens, httpOnly cookies
- **CRUD de mensagens** — criação de cartas temáticas com texto, mídia e temas
- **Pagamento** — integração Stripe implementada (cartão, boleto, Apple/Google Pay); PIX via Stripe requer 60 dias de histórico de transações → estratégia híbrida planejada com Mercado Pago para PIX
- **Card públicos** — link compartilhável visível após pagamento
- **Upload de mídia** — Cloudinary para imagens/áudio
- **Design system** — glassmorphism, paleta rosa/dourado, animações (scroll reveal, parallax, 3D tilt, cursor custom, hero animation com frames WebP)
- **Validação** — Zod schemas no backend, middleware de validação
- **Rotas** — Home, criação, auth, perfil, pagamento, card público
- **Testes automatizados** — Vitest + Supertest configurados no backend com mocks de Prisma e Stripe. Cobertura de rotas de auth, messages e payments (100% passando).

### O que falta no core atual

- **Pagamento PIX funcional** — Stripe exige 60 dias de histórico; solução imediata: Stripe Checkout (cartão/boleto) + Mercado Pago (PIX) em paralelo
- Persistência de estado no frontend (Zustand in-memory only)
- CI/CD automatizado

---

## 🗺️ Iterações Futuras (Ordem Recomendada)

### Fase 1 — Solidificar o Core

#### 1.1 Editor Modular

O núcleo da plataforma. Editor visual estilo "home screen de Android" com widgets. O usuário abre um menu de edição e arrasta os elementos que quiser, reposiciona entre outros elementos, altera tamanho. Design modular.

- Drag and drop (dnd-kit), redimensionamento, reordenação, edição inline
- Blocos independentes renderizados dinamicamente
- Modo "edit" separado do modo "preview"
- Página = JSON, blocos = componentes React
- Persistir estrutura como JSON no backend
- Renderização otimizada com `React.memo`

Isso permite: escalabilidade, versionamento, exportação, templates, marketplace futuro.

**Limitações:** drag and drop em mobile é complexo; performance degrada com muitos blocos; sincronização em tempo real exige WebSockets.

**Sugestão técnica:** React + dnd-kit + Zustand para estado.

#### 1.2 Sistema de Temas

Temas próprios escolhíveis, cada um com animações, cores, fontes e estilos próprios.

- CSS Variables dinâmicas + sistema de tokens (`primary`, `accent`, `bg`)
- Preview instantâneo ao trocar tema
- Override limitado (consistência > liberdade total)
- Futuro: marketplace de temas pagos

**Limitações:** excesso de personalização pode quebrar consistência visual.

#### 1.3 Música (Upload Simples)

- Upload de arquivo MP3 ou qualquer formato de áudio
- Player customizado
- Integração com API de música para escolha simplificada de trilha sonora
- Possibilidade de tocar em background

**Limitações:** autoplay bloqueado por navegadores (exigir interação do usuário); upload gera custo de storage; licenciamento pode virar problema.

**Nunca tentar hackear streaming — mata o projeto juridicamente.**

#### 1.4 Galeria com Slideshow

- Upload múltiplo de fotos
- Transições animadas entre fotos
- Música sincronizada opcional
- Compressão automática, CDN, lazy loading
- Limite de uploads por plano

**Limitações:** compressão obrigatória; custo de storage.

#### 1.5 Timer de Relacionamento

- Contador em tempo real (calcular no client a partir de data base armazenada)
- Datas personalizadas (ex: "desde 14/02/2020")
- Lembrete automático para aniversários

**Limitações:** timezones; precisão em contagem longa; notificações exigem push service.

**Sugestão:** Firebase Cloud Messaging para notificações.

#### 1.6 QR Code Customizável

- Personalizar cor, formato, frame, logo e estilo visual
- Limitar customização dentro de parâmetros seguros (contraste mínimo obrigatório)
- Usar biblioteca sólida de geração

**Limitações:** alterações extremas podem quebrar leitura do QR.

#### 1.7 Autenticação Reforçada e Segurança

- **Requisitos de Senha Fortes:** Transição para um modelo mais seguro exigindo caracteres especiais, números, maiúsculas/minúsculas e checagem contra vazamentos (ex: zxcvbn).
- **Ações Críticas:** Implementar verificação por e-mail antes de executar ações críticas (ex: Alterar Senha, Excluir Conta).
- **OTP/Magic Link:** Envio de código de confirmação numérico (OTP) ou link mágico para o e-mail cadastrado.
- Aumenta a segurança impedindo que invasores com acesso ao dispositivo logado consigam roubar ou apagar a conta.

**Limitações:** custo recorrente com serviço de e-mail (Resend, SendGrid); adiciona atrito na experiência do usuário para ações que normalmente devem ser rápidas.

---

### Fase 2 — Engajamento Social

#### 2.1 Contas de Casal

- Vincular dois perfis
- Compartilhar cartas, galeria e timers

#### 2.2 Cards das "Primeiras Vezes"

Espaço para registrar marcos do relacionamento, com contagem de tempo desde cada evento e reminder automático para o aniversário.

**Exemplos de eventos:**
- Dia do primeiro beijo
- Aniversário de namoro
- Dia que se conheceram
- Dia que se viram pela primeira vez
- Primeiro encontro
- Primeiro "eu te amo"
- Primeira viagem juntos
- Dia do pedido de namoro
- Primeira foto juntos

**Estrutura de cada card:**
- Data do evento
- Título personalizado
- Mensagem/descrição opcional
- Foto opcional
- Contador de tempo desde o evento (complementa o timer principal)
- Opção de ativar reminder para o aniversário do evento (notificação push quando a data se aproximar)

**Limitações:** notificações dependem de push e o usuário pode não permitir.

#### 2.3 Quiz Personalizado

- Criar perguntas com alternativas e resultado final
- Quiz privado (só quem recebe o link responde)
- Modelo JSON: perguntas, respostas, pontuação opcional
- Potencial viral alto

**Limitações:** armazenamento de respostas; segurança se anônimo; spam.

#### 2.4 Mural Assíncrono

- Mural de cartas/mensagens entre usuários
- Sem necessidade de WebSocket nesta fase

---

### Fase 3 — Conteúdo Avançado

#### 3.1 Player Musical Personalizado

Interface inspirada em players de música (estilo Spotify), mas personalizada:

- No lugar da foto de álbum → **fotos personalizadas do casal**
- No lugar do nome do artista/álbum/música → **nomes das pessoas** (campo de texto personalizável — quem envia e quem recebe)
- No campo de letras → **declaração amorosa, cantada, mensagem personalizada**
- Simulação de track com player funcional

**Começar visual (mock) + player simples. Não replicar layout exato do Spotify (risco legal). Inspirar-se, não copiar.**

**Limitação:** se for player real sincronizado, exige lógica robusta.

#### 3.2 Integração Spotify

- Possibilidade de criar playlists de verdade ou importar do Spotify para ouvir no site (inclusive em segundo plano)
- Fase A: Embed Spotify
- Fase B: OAuth + integração oficial

**Limitação:** Spotify não permite streaming direto sem SDK.

#### 3.3 Journaling (Livro Digital)

Não é um campo de texto simples — é um editor customizado, com vibe, quase como criar um livro digital.

- Capa personalizada
- Capítulos separados
- Animação de virar página na visualização
- Tipografia personalizada
- Pode ser usado para: escrever sobre eventos em casal, eternizar histórias, registrar lembranças

**Sugestão técnica:** editor baseado em JSON (TipTap), capítulos salvos separados, renderizar como livro só na visualização.

**Limitações:** editor rich text é complexo; exportar como PDF é difícil; performance se ficar pesado.

#### 3.4 Lembretes Automáticos

- Push notifications para datas especiais (aniversários, primeiras vezes, eventos customizados)
- Firebase Cloud Messaging
- Fallback para email se usuário não permitir push

---

### Fase 4 — IA como Camada Inteligente

IA deve ser stateless, opcional e escalável. Se a IA cair, o site continua funcionando. Arquitetura em três camadas: Renderização visual → Engine modular → IA como serviço. Nunca misturar IA com lógica de layout.

#### 4.1 Assistente Criativo de Texto

- Sugerir/reescrever mensagens em diferentes tons (romântico, poético, divertido, minimalista)
- Converter texto simples em versão elaborada
- Criar carta anônima estilo correio elegante clássico
- Avaliar coerência estética (cores, fontes, contraste) baseado em descrição textual
- Ajudar a estruturar declarações
- Input: tema selecionado, paleta de cores, tipografia, estrutura dos blocos, texto atual
- Output: avaliação, sugestão de melhoria, versão alternativa

Reduz bloqueio criativo e aumenta retenção.

**Posicionamento:** "Assistente criativo emocional" — não vender como "IA designer".

**Limitações:** IA não enxerga layout real, só descrição textual; pode sugerir coisas inviáveis; custo por requisição (tokens).

#### 4.2 Geração de Música por IA (Tier Premium)

- Integração com Suno, Gemini Lyra ou APIs similares
- Usuário descreve contexto (ex: "Uma música indie romântica sobre nosso primeiro encontro no metrô") → IA gera música exclusiva
- Recurso baseado em créditos (custo alto por geração)

**Limitações:** custo, latência, dependência de API externa, direitos autorais e termos de uso da API.

---

### Fase 5 — Monetização e Gamificação

#### 5.1 Sistema de Créditos

Nome simbólico alinhado ao tema: Corações, Selos, Cartas, Gemas ou Gold.

| Ganhar créditos             | Gastar créditos              |
| --------------------------- | ---------------------------- |
| Indicar amigos              | Música IA                    |
| Criar cartas públicas       | Templates premium            |
| Engajamento                 | Temas exclusivos             |
| Assistir anúncios           | QR Code avançado             |
| Comprar pacotes             | Efeitos especiais            |
|                             | Geração ilimitada de texto IA |

**Riscos:** sistema de recompensa pode ser explorado; ads podem quebrar experiência emocional; economia mal balanceada gera frustração; precisa de antifraude básico.

#### 5.2 Planos de Monetização

| Free                  | Plus               | Premium                  |
| --------------------- | ------------------ | ------------------------ |
| Editor básico         | Temas extras       | Música IA                |
| 1 tema                | Sem marca d'água   | IA criativa ilimitada    |
| Upload limitado       | Mais uploads       | Playlist Spotify         |
| 1 música              | QR custom          | Journaling avançado      |
| Marca d'água leve     |                    | Pet virtual              |
|                       |                    | Sem anúncios             |

---

### Fase 6 — Funcionalidades Experimentais

Só implementar quando o core estiver consolidado.

#### 6.1 Pet Virtual Compartilhado

Pet criado em conjunto pelo casal:

- Escolher pet entre várias opções de animais
- Acessórios: alimentos, roupas, decorações para a casa do pet
- Chores: dar banho, levar ao banheiro, botar pra dormir, alimentar
- Evolução do pet ao longo do tempo

**Limitações:** complexidade alta (estado compartilhado em tempo real); quase um produto separado (Tamagotchi multiplayer).

#### 6.2 Chat em Tempo Real

- WebSocket, moderação, segurança
- Começar só depois do mural assíncrono (Fase 2.4) estar validado

**Limitações:** custo de servidor; moderação.

#### 6.3 Minigames

- Apenas jogos simples: quiz, jogo da memória com fotos do casal
- Escopo explode fácil — manter no mínimo

---

## 🚨 Riscos Principais

| Risco                          | Mitigação                                        |
| ------------------------------ | ------------------------------------------------ |
| Escopo infinito                | Fases bem definidas, disciplina de priorização   |
| Performance ruim no editor     | `React.memo`, virtualização, limitar blocos      |
| Custo de storage               | Compressão, CDN, limites por plano               |
| Complexidade de realtime       | Adiar WebSocket, começar assíncrono              |
| Problemas legais com música    | Nunca hackear streaming, respeitar licenças      |
| IA aumenta custo/complexidade  | Telemetria, métricas, cache, limites de uso      |

---

## 💡 Sugestões Úteis

### Arquitetura

- **Duas camadas:** Engine de Páginas (core) + Recursos emocionais plugáveis (cada feature vira plugin).
- **Três camadas com IA:** Renderização visual → Engine modular → IA como serviço.
- **Tudo é bloco JSON.** Página = JSON. Blocos = componentes. Se o editor modular for bem feito, cada feature nova é só mais um tipo de bloco.

### Produto

- O diferencial real é a **sensação de criação personalizada guiada**, não a IA. IA é amplificador.
- Foque em recursos de **alto impacto emocional e baixa complexidade técnica** primeiro (timer, cards de primeiras vezes, QR code).
- Quiz e mural têm potencial viral alto — priorizar quando buscar crescimento orgânico.

### Técnico

- `PrismaClient` já centralizado em singleton (`utils/prisma.ts`) ✅
- Service layer já implementado no backend (`auth.service.ts`, `payment.service.ts`, `message.service.ts`, `upload.service.ts`) ✅
- Infraestrutura de testes implementada com Vitest + Supertest e isolamento de módulos (poolOptions/forks) ✅
- Persistência de estado no frontend (Zustand persist middleware) melhora UX significativamente.
- **Estratégia de pagamento híbrida:** usar **Stripe Checkout** para cartão/boleto/Apple Pay/Google Pay imediatamente; adicionar **Mercado Pago** para PIX instantâneo. Após 60 dias de transações Stripe, avaliar migração de PIX para o Stripe também.

### Monetização

- Não colocar anúncios agressivos — a experiência emocional é o produto.
- Créditos funcionam melhor que assinatura para features pontuais (música IA, efeitos).
- Marca d'água leve no plano free é estratégia de growth eficiente.
