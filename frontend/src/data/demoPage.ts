import type { Block, PageSection } from '@/editor/types'

// Snapshot de output real do POST /api/generate (crush_secreto, brief rico).
// Mesmo shape que o destinatário recebe — demo pública indexável (S16).
export const DEMO_PAGE_BLOCKS: Block[] = [
  {
    "id": "5201c476b0d3e5fcf76bf602",
    "type": "envelope",
    "version": 1,
    "props": {
      "recipientName": "Marina",
      "sealInitial": "M",
      "messageSnippet": "tem coisa que só se conta uma vez, Marina.",
      "isOpen": false
    },
    "sectionId": "abertura",
    "meta": {
      "createdAt": 1791706406630,
      "updatedAt": 1791706406630
    }
  },
  {
    "id": "00fe575ad0e667535538d5a0",
    "type": "scratch",
    "version": 1,
    "props": {
      "coverText": "raspa aqui. devagar, sem pressa.",
      "secretType": "text",
      "secretText": "uma pessoa da sua turma. chuta quem é."
    },
    "sectionId": "misterio",
    "meta": {
      "createdAt": 1791706406630,
      "updatedAt": 1791706406630
    }
  },
  {
    "id": "fa53e8615bd622c570768b71",
    "type": "hints",
    "version": 1,
    "props": {
      "title": "quem sabe desses apelidos, sabe de você:",
      "hints": [
        {
          "id": "hint-0",
          "text": "Mari"
        },
        {
          "id": "hint-1",
          "text": "a do café com paçoca"
        }
      ]
    },
    "sectionId": "misterio",
    "meta": {
      "createdAt": 1791706406630,
      "updatedAt": 1791706406630
    }
  },
  {
    "id": "c0609be5d46e8a4a39180579",
    "type": "intimacyGate",
    "version": 1,
    "props": {
      "question": "O que eu sempre peço no café da esquina?",
      "answers": [
        "cappuccino"
      ],
      "title": "pergunta secreta nível senha de MSN:",
      "hint": "tem chantilly"
    },
    "sectionId": "intimidade",
    "meta": {
      "createdAt": 1791706406630,
      "updatedAt": 1791706406630
    }
  },
  {
    "id": "4524c84b9907a6b7bc473df3",
    "type": "text",
    "version": 1,
    "props": {
      "text": "Marina,\n\ntem gente que entra na vida dos outros fazendo barulho. você foi entrando devagarinho — pelo corredor, pelo lugar de sempre no intervalo — e quando eu vi, já tinha lugar reservado aqui dentro.\n\nreescrevi essa carta umas cinco vezes. numa versão eu tentava parecer poeta; noutra, fazia piada pra disfarçar. a verdade é mais simples que as duas: eu penso em você quando o dia acaba e quando ele começa, e isso faz tempo demais pra continuar sendo segredo.\n\nsem pressão, sem prazo, sem depoimento público. só a verdade finalmente fora do peito.\n\nquem escreveu isso mora mais perto do que parece.",
      "category": "body",
      "align": "left"
    },
    "sectionId": "carta",
    "meta": {
      "createdAt": 1791706406630,
      "updatedAt": 1791706406630
    }
  }
]

export const DEMO_PAGE_SECTIONS: PageSection[] = [
  {
    "id": "abertura",
    "layout": "stack"
  },
  {
    "id": "misterio",
    "layout": "stack"
  },
  {
    "id": "intimidade",
    "layout": "stack"
  },
  {
    "id": "carta",
    "layout": "stack"
  }
]

export const DEMO_PAGE_THEME = "romantic-sunset"
