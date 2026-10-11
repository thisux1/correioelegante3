/**
 * Banco de copy curado — momento `crush_secreto`.
 *
 * A engine emite props marcadas `copySlot:<chave>` (ou a prop literal
 * `copySlot` com a chave como valor); o resolvedor substitui cada marca por
 * uma variante deste banco antes de persistir. Guia de voz:
 * `backend/src/generate/copy/voice-guide.md`.
 *
 * ## Interpolação
 *
 * `{nome}` é substituído pelo nome do destinatário
 * (`brief.nomes.destinatario`) no texto final. Use só onde a fala se dirige
 * à pessoa — teaser, gate, carta. Limites são medidos sobre o texto já
 * interpolado, então deixe folga para nomes de ~12 caracteres.
 *
 * ## Limites
 *
 * `CRUSH_SECRETO_SLOT_LIMITS` é o teto de caracteres por slot (fonte única,
 * consumida pelo teste). Cada slot tem entre 4 e 6 variantes, com registro
 * variado: umas mais tímidas, outras mais diretas.
 */

/** Junta parágrafos de carta com linha em branco entre eles. */
function paras(...paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

export const CRUSH_SECRETO_COPY = {
  /** Snippet exibido na carta selada — instiga a abrir. Máx 60 chars. */
  'envelope.teaser': [
    '{nome}, abre. juro que não é cobrança.',
    'se fosse scrap, eu já tinha apagado de vergonha.',
    '{nome}, isso aqui ficou engavetado tempo demais.',
    'tem coisa que só se conta uma vez, {nome}.',
    'não mostra pra ninguém antes de ler, {nome}.',
    'pensei em apagar isso umas dez vezes, {nome}.',
  ],

  /** Texto sobre a superfície de raspar. Máx 50 chars. */
  'scratch.cover': [
    'raspa aqui. devagar, sem pressa.',
    'raspadinha da sorte: raspa e torce.',
    'embaixo disso tem um segredo. raspa.',
    'coça aqui que eu conto.',
    'raspou, leu, não des-raspa.',
    'por aqui mora a resposta. raspa.',
  ],

  /** Revelado quando o remetente está oculto (modo anônimo). Máx 80 chars. */
  'scratch.secret.anon': [
    'alguém que te vê todo dia e trava no "oi".',
    'uma pessoa da sua turma. chuta quem é.',
    'alguém que decorou seu pedido no lanche.',
    'a pessoa que ensaia essa coragem há meses.',
    'quem escreveu isso senta mais perto do que parece.',
    'alguém que te admira em segredo faz tempo.',
  ],

  /** Revelado quando não há remetente nem modo anônimo. Máx 80 chars. */
  'scratch.secret.fallback': [
    'alguém que gosta de você mais do que entrega.',
    'uma pessoa que pensa em você no ônibus.',
    'alguém perto. mais perto do que você imagina.',
    'um coração que você já fez bater mais forte.',
    'quem te mandou isso sabe seu nome de cor.',
  ],

  /** Introdução antes da lista de pistas (apelidos). Máx 80 chars. */
  'hints.intro': [
    'só quem te conhece de verdade chama você assim:',
    'se esses nomes dizem algo, a gente já se cruzou:',
    'três pistas. junta que o mistério desarma:',
    'provas de que eu reparo em você faz tempo:',
    'quem sabe desses apelidos, sabe de você:',
  ],

  /** Parágrafo narrativo de mistério — 2 a 3 frases. Máx 300 chars. */
  'misterio.narracao': [
    'Tem alguém que pensa em você mais vezes do que admite. Essa pessoa montou essa página do jeito que se deixa bilhete no caderno: com medo e com vontade. O resto você descobre descendo.',
    'Isso não veio parar na sua tela por acaso. Alguém juntou coragem, umas lembranças e uma dose de vergonha na cara. Vai rolando pra baixo que as peças se encaixam.',
    'Uma pessoa que você conhece passou tempo demais montando isso aqui. O nome ficou de fora de propósito — metade da coragem já foi gasta só pra mandar. O resto do mistério tá logo ali.',
    'Tem segredo que pesa na mochila igual apostila que a gente nunca abre. Esse aqui finalmente saiu das costas e veio parar nas suas mãos. Desce a página com calma.',
    'Se fosse 2009, isso seria um depoimento com o nome escondido. Como não é, virou uma página inteira. Tem alguém do outro lado torcendo pra você chegar até o fim.',
  ],

  /** Texto antes da pergunta de intimidade — "só você sabe essa". Máx 80 chars. */
  'intimacyGate.intro': [
    'só {nome} de verdade sabe essa. sem colar:',
    'checkpoint rápido: prova que é você mesmo:',
    'pergunta secreta nível senha de MSN:',
    'pra confirmar que caiu na mão certa:',
    'responde direitinho que o resto se abre:',
  ],

  /** Pergunta lúdica sim/não do quiz. Máx 80 chars. */
  'quiz.pergunta': [
    'toparia um sorvete com quem escreveu isso?',
    'você sorriu pelo menos uma vez até aqui?',
    'se fosse 2009, você me add no Orkut?',
    'rolaria um cineminha um dia desses?',
    'já desconfiou de quem tá por trás disso?',
  ],

  /** Mensagem exibida quando acerta/responde o quiz. Máx 80 chars. */
  'quiz.sucesso': [
    'anotado. você prometeu, hein.',
    'boa. essa resposta vale depoimento.',
    'sabia. guarda esse sim que ele ainda vale.',
    'ponto pra você — e um sim pra mim.',
    'acertou. o prêmio vem na próxima página.',
  ],

  /**
   * Corpo da carta — o slot mais importante do arco. 3 a 4 parágrafos:
   * abertura, detalhe concreto, vulnerabilidade, fechamento sem pressão.
   * Máx 1400 chars.
   */
  'carta.corpo': [
    paras(
      '{nome}, oi.',
      'Faz tempo que eu queria te dizer uma coisa e nunca achava o momento. Toda vez que eu abria a boca, saía qualquer outro assunto menos esse. Então fiz o que a gente fazia quando faltava coragem: escrevi.',
      'Não é nada de outro mundo. É que eu reparo em você. Reparo quando você chega no lugar, quando ri da piada que todo mundo ignorou, quando fala de uma coisa que gosta e os olhos acendem. Reparo tanto que às vezes acho que você já percebeu — e, se percebeu e continuou aqui, meu coração agradece.',
      'Não tô pedindo resposta agora, nem declaração, nem nada que assuste. Só queria que você soubesse que existe alguém que guarda seu nome com carinho. Se um dia quiser saber quem é, a gente conversa.',
      'Com vergonha e coragem ao mesmo tempo.',
    ),
    paras(
      '{nome},',
      'vou direto ao ponto, porque indireta eu já mandei umas trezentas e você não pegou nenhuma (ou pegou e fez cara de paisagem, o que também é informação).',
      'eu gosto de você. gosto do seu jeito de contar história, do riso que escapa antes da piada acabar, de como você trata o garçom e o cachorro da vizinha com a mesma importância. gosto tanto que virou peso — e peso a gente divide ou larga. resolvi dividir com você.',
      'não precisa gostar de volta na mesma moeda, nem na mesma hora. se gostar, a gente marca um sorvete. se não gostar, finge que foi spam e a vida segue bonita — prometo não transformar isso em indireta de MSN.',
      'só não dava mais pra ficar com isso só pra mim.',
    ),
    paras(
      'se isso fosse 2009, eu deixava um scrap no seu Orkut de madrugada e torcia pra você ler antes de todo mundo.',
      'como não é, vai assim mesmo: {nome}, existe uma pessoa que sabe de cor o seu pedido no lanche, que reconhece sua risada do outro lado do pátio, que salvou a sua música favorita só porque era a sua favorita. essa pessoa sou eu — e até agora esse "eu" foi a parte mais difícil de escrever.',
      'não sei o que você vai fazer com essa carta. sei que ela não cabia mais aqui dentro. agora é sua, pra guardar onde quiser.',
    ),
    paras(
      '{nome},',
      'tem gente que entra na vida dos outros fazendo barulho. você foi entrando devagarinho — pelo corredor, pelo lugar de sempre no intervalo — e quando eu vi, já tinha lugar reservado aqui dentro.',
      'reescrevi essa carta umas cinco vezes. numa versão eu tentava parecer poeta; noutra, fazia piada pra disfarçar. a verdade é mais simples que as duas: eu penso em você quando o dia acaba e quando ele começa, e isso faz tempo demais pra continuar sendo segredo.',
      'sem pressão, sem prazo, sem depoimento público. só a verdade finalmente fora do peito.',
      'quem escreveu isso mora mais perto do que parece.',
    ),
    paras(
      '{nome},',
      'oi, sou eu. você ainda não sabe quem "eu" é — mas agora sabe o que eu sinto, o que já é mais do que eu conseguia dizer olhando nos seus olhos.',
      'eu gosto de você do jeito que dá trabalho: conto os minutos até a próxima vez que a gente se cruza, ensaio conversa no chuveiro, decoro o que você fala sem perceber que tô decorando. é ridículo e é a coisa mais honesta que eu faço na semana.',
      'se um dia quiser descobrir quem tá por trás disso, eu prometo que a pessoa vale o mistério. e se não quiser, tudo bem também — a carta já cumpriu o papel dela: deixou de ser segredo.',
    ),
  ],

  /** Título do convite RSVP. Máx 60 chars. */
  'rsvp.titulo': [
    'bora marcar isso direito?',
    'reserva esse dia pra mim?',
    'data marcada. falta só o seu sim.',
    'confirma presença que o resto eu resolvo.',
    'convite oficial, carimbo e tudo:',
  ],

  /** Label da contagem regressiva. Máx 60 chars. */
  'timer.label': [
    'falta pouco pro nosso dia:',
    'contagem regressiva pro dia D:',
    'ansiedade medida em segundos:',
    'tempo até a gente se ver:',
    'já pode começar a contar:',
  ],
} satisfies Record<string, string[]>;

/** Chaves de slot conhecidas deste banco. */
export type CrushSecretoCopySlot = keyof typeof CRUSH_SECRETO_COPY;

/** Teto de caracteres por slot, medido sobre o texto final interpolado. */
export const CRUSH_SECRETO_SLOT_LIMITS: Record<CrushSecretoCopySlot, number> = {
  'envelope.teaser': 60,
  'scratch.cover': 50,
  'scratch.secret.anon': 80,
  'scratch.secret.fallback': 80,
  'hints.intro': 80,
  'misterio.narracao': 300,
  'intimacyGate.intro': 80,
  'quiz.pergunta': 80,
  'quiz.sucesso': 80,
  'carta.corpo': 1400,
  'rsvp.titulo': 60,
  'timer.label': 60,
};
