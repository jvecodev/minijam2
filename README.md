# Saturn Rings Runner

Um jogo endless runner orbital desenvolvido com Next.js, React e P5.js.

## Descrição

Saturn Rings Runner é um jogo de corrida infinita onde o jogador corre pelos anéis de Saturno, evitando obstáculos e coletando power-ups. O jogo apresenta uma perspectiva lateral (side-view) com Saturno visível à esquerda e os anéis se estendendo horizontalmente.

## Funcionalidades

- Jogabilidade de corrida infinita com dificuldade progressiva
- Controles simples: pressione espaço para pular
- Obstáculos variados: meteoritos e fragmentos de gelo
- Power-ups: cristais (pontos), escudos (proteção) e impulsos de velocidade
- Sistema de pontuação e recordes
- Efeitos sonoros
- Animações fluidas
- Design responsivo

## Tecnologias Utilizadas

- Next.js 14 (App Router)
- React 18
- TypeScript
- P5.js para renderização do jogo
- Tailwind CSS para estilização
- Framer Motion para animações de interface

## Instalação

1. Clone o repositório:
\`\`\`bash
git clone https://github.com/seu-usuario/saturn-rings-runner.git
cd saturn-rings-runner
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Execute o servidor de desenvolvimento:
\`\`\`bash
npm run dev
\`\`\`

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o jogo.

## Estrutura do Projeto

- `/app`: Páginas da aplicação (Next.js App Router)
- `/components`: Componentes React e classes do jogo
- `/hooks`: Hooks personalizados (useSound)
- `/utils`: Funções utilitárias
- `/public`: Arquivos estáticos (sons, imagens)

## Como Jogar

- Pressione **Espaço** para pular sobre obstáculos
- Colete cristais para ganhar pontos
- Colete escudos para obter proteção temporária
- Colete impulsos para aumentar temporariamente sua velocidade
- Evite colidir com meteoritos e fragmentos de gelo
- Pressione **ESC** para pausar o jogo

## Deploy

O jogo pode ser facilmente implantado na Vercel:

1. Faça fork deste repositório
2. Importe o projeto na [Vercel](https://vercel.com)
3. A Vercel detectará automaticamente o projeto Next.js e configurará o build

## Licença

MIT

## Créditos

Desenvolvido como parte de um projeto para a Mini Jam com o tema "Órbita".
