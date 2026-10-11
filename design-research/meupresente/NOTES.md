# Pesquisa: meupresente.app

Data: 2025-10-11. Navegação headful via chrome-devtools MCP — LP completa, demo jogada até fase 2 (envelope + café + quiz + memory card), editor `/criar` inspecionado. Screenshots neste diretório (`mp-*.png`).

## O que é

Presente digital: um **mini-RPG pixel-art personalizado** do casal. Quem cria responde um wizard; quem recebe joga um mundo semi-aberto até encontrar o remetente no mirante com a carta final. Preço: R$49,90/ano ou R$89,90 vitalício — **criar e testar é grátis, paga só pra publicar** (mesmo modelo D14).

## Loop central do jogo

Andar (WASD/setas ou joystick virtual + botão de ação contextual em mobile) → chegar no lugar marcado por seta-guia → interagir → gate de pergunta "que só vocês sabem responder" → **memory card** (selo lugar+data + ilustração/foto + legenda manuscrita + narrativa) → mundo muda (luzinhas acendem, foto vai pra parede do café) → próxima fase. 4 regiões, 12 fases, ~20min, pausável e resumável.

## Ideias fortes pra copiar/adaptar

1. **Pergunta-gate de intimidade**: NPC faz pergunta que só o casal sabe ("o que tinha na xícara que você 'pegou emprestada'?"). Vira gate narrativo + prova de intimidade — e tem "Dica" + "Seguir sem acertar" pra ninguém travar. → equivalente direto ao nosso `quiz` block + hints do crush secreto.
2. **Memory card**: selo "Café Bem-Te-Vi, 12 de março de 2022" + ilustração + legenda manuscrita + texto longo. Unidade atômica de memória — pode virar um block nosso.
3. **Mundo reage ao progresso**: cada fase completa muda o cenário (bandeirinhas, foto na parede). Feedback visual de progresso sem HUD pesado.
4. **Placa com os nomes**: "Café Lia & Rafa" — o mundo nomeia os dois literalmente. Personalização espacial, não só textual.
5. **Sidebar "onde isso aparece"**: cada campo do form mostra exatamente onde cai no jogo ("na placa do café, fase 2"). Onboarding ensina o modelo mental — mataria o cold-start do nosso editor.
6. **"Se ficar em branco"**: painel mostra o texto neutro exato que substitui o campo vazio. Transparência total sobre fallback — direto pro nosso princípio "nada é inventado no seu lugar".
7. **Começar pelo exemplo**: wizard pode nascer preenchido com a história demo; usuário edita em vez de criar do zero. Resolve cold-start melhor que form vazio.
8. **Personagens customizáveis + pet**: cabelo/roupa/óculos/barba + cachorro/gato com porte e coleira. Os dois personagens aparecem dentro das cenas de memória, não só no overworld.
9. **Temas = mesmo mundo, climas diferentes**: Vila/Noite/Natal trocam cenário+luz+música+UI, caminhos iguais. Tema como skin global — casa com nosso "momento × mood" (o pixel é o OS, o momento é o wallpaper).
10. **Extras descobertos**: mensagens escondidas pelo mapa (6 slots), "o que você diria em cada lugar" pós-final, passeio livre a dois depois do encontro, álbum com as fotos coletadas.
11. **Wizard 8 etapas**: Pessoas → Aparência → Mundo → História (9 perguntas→12 fases) → Fotos/músicas → Mensagem final → **Testar** (playtest embutido!) → Publicar.
12. **Rascunho no navegador sem cadastro** + magic link cross-device + lista de rascunhos. Zero atrito até o paywall.
13. **Acessibilidade de verdade**: live regions narrando progresso ("Lembrança guardada — Café Bem-Te-Vi"), skip links, `prefers-reduced-motion`, controles duplos (teclado+touch).
14. **Detalhes de tom**: "leva uns vinte minutinhos, dá pra parar e continuar", "a casa é sua", "as xícaras são por conta da casa" — copy calorosa em todo microtexto.

## Onde somos diferentes / oportunidades

- Eles têm **um** formato (mundo RPG de casal); nós temos **momentos** (crush, anônimo, RSVP, pedido) — mais amplitude.
- Nosso RSVP/reply real não existe lá (o "quase" deles: perguntas-gate não escrevem de volta pro remetente).
- Nosso editor de grid/PageSpec permite composições que o template fixo deles não permite.
- Risco: eles já validaram "pixel game = presente". Nosso pixel-RPG card precisa ter uma mecânica própria (YES/YES, heart-HP) em vez de mini-mundo — custo de produção de um mundo semi-aberto é alto demais pro SLC inicial.
- A demo deles não pede cadastro e abre direto no jogo — padrão a seguir pro nosso `/demo` público (S16).

## Implicação pro pixel-rpg template

O card deles é um *mundo*, o nosso preview pixel-rpg é uma *cena quest* — escopo muito menor e ainda assim entrega o payoff. Manter: quest linear com personagens + dialog typewriter + escolha final. Adicionar deles: quiz-gate de intimidade antes do pedido, memory-card como reveal de fotos, mundo que reage (banner/confete após resposta).

---

## O fluxo de criação (`/criar`, etapa por etapa)

Wizard de 8 etapas com nav lateral marcando `concluída / etapa atual / a fazer`. Rascunho persiste em localStorage ("Salvo neste navegador"), magic link por e-mail sincroniza cross-device, lista "Meus rascunhos".

### Etapa 1 — Pessoas
Dois cards: quem recebe ("Quem joga", controla o personagem) × quem presenteia ("Espera no mirante"). Nome + apelido ("como você chama no dia a dia"), título do presente opcional com default inteligente ("A história de Lia & Rafa"). **Sidebar "onde esses nomes aparecem"**: cada campo mostra exemplos concretos in-game — "Na placa do café, na fase 2: Café Lia & Rafa", "No bilhete que abre a aventura: Um bilhete para você, Li", "Na faixa florida do jardim, fase 6".

### Etapa 2 — Aparência
Customizador completo de sprites: radio pra alternar quem edita (recebedor/remetente/bichinho), tabs Pele/Cabelo/Rosto/Parte de cima/Parte de baixo/Calçado/Acessórios. 8 tons de pele com nomes BR (Porcelana→Ébano). Preview com poses (Frente/Costas/Lados × Parado/Andando), botões "Aleatorizar", **"Testar caminhada"**, "Restaurar aparência inicial". "Ponto de partida" Mulher/Homem é preset inicial, não restrição ("todas as opções continuam valendo para os dois") — inclusividade elegante. Pet com porte/coleira, entra nas cenas.

### Etapa 3 — Mundo
3 temas (Vila acolhedora / Natal encantado / Noite estrelada). **Cada card de tema quebra explicitamente em 5 atributos**: Cenário, Luz, Enfeites, Interface, Música — + "Ouvir a trilha deste tema" (preview de áudio). Frase-chave: "O mapa, os caminhos e as doze fases são os mesmos nos três temas. Dá para trocar quando quiser: nada do que você escreveu muda." → tema = skin de apresentação, nunca conteúdo. Exatamente nosso `theme` no PageSpec.

### Etapa 4 — História
9 grupos de perguntas → 12 fases. Cada pergunta declara "Aparece em: Fase X — Nome do lugar". Campos com char counter, "Pré-visualizar esta fase" por parte, e painel **"Se ficar em branco"** mostrando o texto neutro exato do fallback. Estrutura:

| Pergunta | Fase |
|---|---|
| Como a aventura começa? (bilhete) | 1 |
| Onde tudo começou? | 2 |
| Momentos marcantes (3) | 3 |
| Perguntas que só vocês sabem (3) | 2, 8, 11 — gates |
| Por que você ama? (6 motivos) | 6 |
| Frase só de vocês | 5 |
| Lembrança de viagem | 9 |
| Sonhos pro futuro (3) | 10, 11 |
| Mensagens escondidas (6 slots) | mapa todo |
| Extra: o que diria em cada lugar (12) | pós-final, passeio livre a dois |

+ 2 datas opcionais: quando se conheceram (álbum), início do namoro (contador "tempo juntos" na ponte e no mirante — calcula "4 anos, 3 meses e 29 dias" ao vivo).

### Etapa 5 — Fotos e músicas
**Fotos**: até 24, legenda por foto, select "Onde aparece" por fase **com vagas por lugar** ("Fase 12 — Mirante (4 vagas restantes)" vs "sem vagas"), "Só no álbum final" como destino não-alocado, "Distribuir automaticamente", reordenação drag **e por teclado** (espaço pega, setas movem, Esc cancela), filtro Todas/Por fase. Fases que hospedam foto: 2, 3, 4, 8, 9, 11, 12.

**Músicas** (3 jeitos, combináveis):
1. Trilha da aventura: tema original do mundo | arquivo próprio (MP3/M4A/OGG/WAV ≤20MB) | silêncio — com player de preview + volume local.
2. YouTube (até 3): link → player oficial ao lado do jogo + título + dedicatória. Copy legal explícita: "O MeuPresente não busca nada no YouTube: só guarda o link" e "a trilha da aventura espera enquanto isso".
3. Spotify (até 3): cartão com título+dedicatória, abre externo. "Nada é buscado no Spotify: o cartão mostra só o que você escrever."
+ dedicatória da Praça da música (fase 7). Cada item tem preview "no jogo, aparece assim" com o cartão real.

### Etapa 6 — Mensagem final
Carta em **parágrafos estruturados** (até 12, mover/remover/adicionar por botão), título opcional (default "Para {nome}"), assinatura opcional (default nome do remetente), toggle "Escrever / Ver no papel" (preview na carta física). Fotos alocadas ao Mirante ficam "presas no pé da carta". A copy da demo referencia fases anteriores ("obrigado por ter tirado a mochila daquela cadeira") — callbacks narrativos entre fases.

### Etapa 7 — Testar
Dashboard de QA completo:
- **"Jogar a prévia completa"** — joga como o recebedor vai jogar; progresso da prévia é namespaced ("o de quem recebe fica intacto").
- **Matriz de completude**: 12 fases com status completa/em parte/em branco; cada card diz o que o recebedor faz ali, lista os campos que alimentam a fase ("Momentos importantes: 3 de 3"), **"Pré-visualizar esta fase"** (jump direto) e **"Editar em História/Fotos"** (deep-link de volta).
- "Abrir como quem vai receber" — entrada do presente em outra aba com progresso separado.
- Warning explícito: salvo só neste navegador.

### Etapa 8 — Publicar
Funil explícito em 4 passos:
1. Montar (localStorage)
2. Guardar na conta — **e-mail + código, sem senha** (passwordless OTP), grátis, sobe fotos+trilha pro servidor
3. Escolher plano e pagar — Anual R$49,90 / Vitalício R$89,90, Pix ou cartão
4. Receber o link — só gerado após pagamento; abre em qualquer device sem cadastro

## Diferença crítica de paywall vs. nosso D14

**"É o pagamento que libera as três últimas fases do jogo (com o encontro e a carta) e o link."** — a prévia gratuita deles é deliberadamente truncada: fases 1–9 jogáveis, 10–12 (o payoff emocional inteiro) travadas até pagar. O remetente testa 75% e *não vê o final de graça*. Nosso D14 diz "tudo incluído, paga só pra publicar" — modelo mais generoso: o criador vê a carta final completa antes de pagar. Trade-off a considerar: o truncamento deles cria urgência monetária forte ("preciso ver/publicar o final"), o nosso cria confiança/transparência. Vale testar as duas variantes no copy do paywall.

## Mecânicas de fase descobertas (para repertório de blocos)

- F1: achar objeto no cenário (envelope no banco)
- F2: entrar em interior + conversar com NPC + **quiz de intimidade** + memory card
- F3: **ordenar momentos** (sequência cronológica) — ponte acende lanterna a lanterna
- F4: **procurar cavaletes cobertos** nas clareiras — reveal por proximidade
- F5: **recolher pedaços de papel e montar a frase** — puzzle de montagem
- F6: **uma flor floresce por motivo** — jardim ganha cor progressivamente
- F7: jukebox com dedicatória + links
- F8: **jogo da memória com as fotos do casal** + pergunta
- F9: **atravessar lago pelas pedras certas** — path puzzle
- F10: **ligar estrelas no telescópio** — cada trecho revela um sonho
- F11: **posicionar objetos na casa** + senha carinhosa (pergunta) na porta
- F12: encontro no mirante + carta + passeio livre pós-final

Todas são mini-mecânicas de reveal — candidatas a blocos nossos (`sequence-order`, `scattered-pieces`, `bloom-garden`, `memory-match`, `stepping-stones`, `constellation`, `room-place`).
