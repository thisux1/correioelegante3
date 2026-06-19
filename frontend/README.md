<!-- BANNER ANIMADO -->
<p align="center">
  <img src="../docs/banner.svg" alt="Correio Elegante Banner" width="100%" style="border-radius: 8px; border: 1px solid rgba(225, 29, 72, 0.15);" />
</p>

# Correio Elegante - Frontend Web Application

Este diretório abriga a Single Page Application (SPA) responsiva do **Correio Elegante**, fornecendo a interface interativa onde os usuários criam, personalizam e visualizam os cartões digitais. O design do sistema é focado em alta fidelidade estética e usabilidade premium para dispositivos móveis e desktops.

---

## Stack Tecnológica & Diferenciais

A arquitetura do frontend foi projetada para manter a performance estável sob taxas de atualização de 60 FPS, utilizando as ferramentas mais modernas do ecossistema JavaScript:

* **React 19 & TypeScript**: Programação declarativa e tipagem estrita para segurança de código.
* **Vite**: Ferramenta de build de alta velocidade com Hot Module Replacement (HMR) instantâneo.
* **Tailwind CSS v4**: Motor CSS utilitário otimizado para o design system da plataforma.
* **Zustand**: Controle de estado global simplificado e modular, reduzindo renderizações desnecessárias.
* **Framer Motion & GSAP**: Motores de animação para física de amortecimento suave e transições de página dinâmicas.
* **Lenis**: Biblioteca de Scroll Suave (Smooth Scrolling) integrada para otimização da experiência tátil e de leitura.
* **Axios & React Router DOM v7**: Camada de serviço de APIs com renovação automática de tokens HTTP e roteamento dinâmico.

---

## Estrutura Interna de Código

O código está estruturado para facilitar a manutenção e reutilização de componentes:

```path
src/
├── app/               # Inicialização de rotas, providers e regras de contexto globais
├── assets/            # Arquivos de imagem estáticos, fontes e trilhas sonoras
├── components/        # Componentes reutilizáveis comuns de UI (botões, modais, cabeçalhos)
├── config/            # Variáveis de ambiente locais e constantes de configuração
├── editor/            # Componentes e submódulos do painel interativo de criação de cartas
├── hooks/             # Custom React Hooks para abstrair lógica de componentes
├── services/          # Camada de comunicação HTTP e conexões com APIs do backend
├── store/             # Zustand Stores organizadas por domínio (Editor, Auth, Messages)
├── test/              # Configurações globais e mocks do ambiente Vitest
├── main.tsx           # Ponto de entrada da aplicação
└── index.css          # Design tokens e variáveis globais do Tailwind CSS
```

---

## Comandos Úteis

No diretório `frontend/`, você tem acesso aos seguintes comandos de desenvolvimento e qualidade de código:

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento local |
| `npm run build` | Compila o projeto em código de produção otimizado em `dist/` |
| `npm run lint` | Executa a verificação estática do código para erros comuns de sintaxe e estilo |
| `npm run test` | Executa a suíte de testes unitários e de componentes com Vitest |
| `npm run e2e:smoke` | Roda testes rápidos de ponta a ponta (Smoke tests) |

### Execução de Testes Específicos

Para otimizar o fluxo de trabalho de testes, você pode filtrar a execução:
* **Por arquivo:** `npm run test -- src/editor/components/MediaField.test.ts`
* **Por nome da suíte/teste:** `npm run test -- -t "status feedback"`

---

## Padrões e Diretrizes de Desenvolvimento

Ao modificar esta aplicação, certifique-se de seguir os padrões vigentes do projeto:
1. **Alias de Importação**: Use sempre `@/` para referenciar o diretório `src/` (ex: `import Button from '@/components/ui/Button'`).
2. **Acessibilidade (a11y)**: Adicione propriedades `aria-label` apropriadas para ícones sem texto e preserve o foco de teclado em elementos interativos.
3. **Internacionalização**: Mensagens destinadas ao usuário devem ser preferencialmente em Português do Brasil (PT-BR).

---

## Setup Completo do Projeto

Para obter as instruções de variáveis de ambiente, inicialização do banco de dados e execução em conjunto com o backend da API, consulte o [README principal na raiz do repositório](../README.md).
