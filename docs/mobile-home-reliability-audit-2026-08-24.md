# Auditoria mobile da home — 24/08/2026

## Escopo e método

Rotas verificadas em produção: `/`, `/buscar`, `/mercados` e `/lojista`. A investigação combinou HTML sem JavaScript (`curl`), navegação com JavaScript em navegador Chromium, inspeção do bootstrap, catálogo, prerender e artefatos PWA. Não houve acesso a um aparelho físico ou a uma rede celular real; a validação em dispositivo físico continua recomendada após o deploy.

## P0 — carregamento e estado offline

### Encontrado

- O HTML puro não era somente um shell offline: já continha `h1` e descrição específicos por rota dentro de `#seo-prerender`.
- O conteúdo estático era, porém, mínimo e visualmente oculto. Uma imagem offline grande, embutida no HTML e com texto alternativo “PreçoCerto indisponível por falta de conexão”, contaminava a extração feita por crawlers.
- Não existia `sw.js`, `service-worker.js` ou Workbox em produção. Portanto, a hipótese de um service worker existente servir o fallback indevidamente não se confirmou.
- A causa real estava em `src/main.tsx`: quando `navigator.onLine` iniciava como `false`, o React não era montado. Isso impedia também o uso do catálogo local e deixava a tela offline genérica permanente.
- O catálogo remoto não tinha timeout nem nova tentativa explícita.

### Mudado

- O React agora sempre monta. Oscilação de rede não bloqueia mais a aplicação.
- A tela offline embutida foi removida; o boot ficou reduzido a uma inicialização neutra e curta.
- As consultas do catálogo têm timeout de 5 s, uma nova tentativa e fallback para a base local com mensagem específica.
- Foi criado um service worker pequeno e explícito: navegações usam network-first; assets locais usam stale-while-revalidate; requisições externas/Supabase não são interceptadas. Erros de API não viram “sem conexão”.
- O prerender das rotas principais agora inclui cinco destinos principais, categorias, preços e estabelecimentos disponíveis no momento do build. Se a API estiver indisponível no build, a estrutura semântica continua sendo gerada.

### Como testar

1. Abrir a home com cache limpo e simular Offline ou Slow 3G.
2. Confirmar que a interface React abre e que o catálogo local/skeleton aparece, sem tela genérica permanente.
3. Executar `curl -s https://precocerto.live/` e repetir para `/buscar` e `/mercados`.
4. Confirmar `h1`, descrição, navegação, categorias e seções de conteúdo; a frase antiga de indisponibilidade não deve existir.
5. Em DevTools > Application, confirmar `/sw.js` registrado e verificar que chamadas Supabase não aparecem como respostas do service worker.

## P1 — navegação mobile

### Encontrado

- A home já possuía um dock fixo com cinco itens, safe-area e alvos maiores que 44 px, mas os destinos eram Início, Buscar, Cesta, Locais e Favoritos.
- As categorias específicas continuavam expostas em navegações estáticas sem hierarquia clara.
- A tela Explorar não exibia o mesmo dock compartilhado.

### Mudado

- O dock principal agora é: Início, Buscar, Explorar, Perto e Conta.
- Farmácias, Padarias, Livros, Serviços e Mercados permanecem como cards da tela Explorar.
- A tela Explorar passou a usar o dock compartilhado e destacar o item atual.
- O HTML prerenderizado também foi reduzido aos mesmos cinco destinos.

### Como testar

Em viewport de 375–414 px, navegar entre os cinco itens, confirmar o estado ativo, o dock sem scroll horizontal e o espaçamento acima da safe-area do iPhone.

## P2 — localização

### Encontrado

A interface e os metadados assumiam Feijó sem ação clara de troca. Não existia fluxo de geolocalização nem fallback manual.

### Mudado

- A hero recebeu um chip de localização visível.
- A geolocalização só é solicitada após ação do usuário.
- Em caso de recusa, indisponibilidade ou cidade não reconhecida, há entrada manual.
- Como a base de preços ainda cobre Feijó, a interface informa de forma explícita quando a cidade do visitante é outra; ela não atribui preços de Feijó à cidade detectada.

### Como testar

Testar três cenários: permissão aceita perto de Feijó, permissão negada e cidade manual diferente. Recarregar a página e confirmar persistência da preferência e a mensagem de cobertura correta.

## P3 — polish e qualidade

### Encontrado

- A home já tinha skeletons de produtos e busca acima da dobra.
- O preço nos cards compactos tinha apenas 15–17 px e perdia hierarquia para outros elementos.
- Safe-area e alvos de toque do dock já estavam implementados corretamente.

### Mudado

- O preço mobile passou para 18–20 px, com linha mais compacta e maior contraste hierárquico.
- O seletor de localização usa alvos mínimos de 44 px, foco visível, painel adaptado ao dock e respeito a `prefers-reduced-motion`.
- A análise Impeccable dos componentes alterados não encontrou novo problema estrutural; os dois avisos restantes são sobre a família Inter já adotada globalmente pelo produto.

### Lighthouse

Não há números confiáveis de antes/depois neste ambiente. O pacote Lighthouse/Chromium não está instalado no workspace e a API pública PageSpeed Insights respondeu HTTP 429 por limite de quota. Nenhuma pontuação foi estimada ou inventada. Após o deploy, executar Lighthouse mobile em janela anônima, três vezes por versão, e registrar a mediana de Performance, Accessibility, Best Practices e SEO. A auditoria PWA atual do Lighthouse não fornece mais uma categoria numérica estável em todas as versões; registrar as verificações individuais do manifesto e service worker.

## Verificações automatizadas realizadas

- `git diff --check`
- `node --check scripts/prerender-seo.mjs`
- `node --check public/sw.js`
- execução isolada do prerender com validação de `/`, `/buscar` e `/mercados`: nenhuma frase offline; `h1` específico; cinco links principais; três ou quatro seções semânticas por rota
- `impeccable detect` nos componentes e estilos alterados

O build local completo não foi possível porque as dependências do projeto não estavam instaladas e o ambiente bloqueou a restauração pela rede. O build da CI da `main` é, portanto, etapa obrigatória antes de considerar o deploy validado.
