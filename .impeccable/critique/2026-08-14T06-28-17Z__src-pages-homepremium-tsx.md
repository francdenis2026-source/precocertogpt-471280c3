---
target: homepage
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-14T06-28-17Z
slug: src-pages-homepremium-tsx
---
## Design Health Score

| # | Heurística | Nota | Problema principal |
|---|---|---:|---|
| 1 | Visibilidade do estado do sistema | 3 | Atualização sem data e falha remota silenciosa. |
| 2 | Correspondência com o mundo real | 3 | Placeholders brutos reduzem a naturalidade. |
| 3 | Controle e liberdade | 3 | O modal fecha corretamente, mas uma oferta única é chamada de comparação. |
| 4 | Consistência e padrões | 3 | Links e botões de categoria parecem iguais, mas agem diferente. |
| 5 | Prevenção de erros | 2 | Dados ausentes, imagens inválidas e preços extremos não recebem contexto. |
| 6 | Reconhecimento em vez de memorização | 4 | Busca, sugestões, categorias e lojas tornam opções visíveis. |
| 7 | Flexibilidade e eficiência | 3 | Bons atalhos, porém exploração móvel exige rolagem excessiva. |
| 8 | Estética e design minimalista | 3 | Hero forte; seções inferiores repetem argumentos e ações. |
| 9 | Recuperação de erros | 2 | O vazio de busca ajuda, mas a falha do catálogo não é explicada. |
| 10 | Ajuda e documentação | 3 | O fluxo é ensinado, mas a origem e frequência dos preços não. |
| **Total** | | **29/40** | **Bom; a base é sólida, com falhas importantes de confiança e acabamento.** |

## Design Specificity Verdict

**Avaliação independente:** a homepage tem identidade própria. Azul-noturno, lima elétrica, tipografia editorial e a metáfora do radar são coerentes com comparação de preços e não parecem um template genérico. A especificidade visual está mais madura que a informacional: placeholders, imagens quebradas e o selo “Atualizado” sem horário contradizem a promessa de transparência.

**Varredura determinística:** o detector oficial executou sobre `site/src/pages/HomePremium.tsx` e retornou `[]`: zero achados, zero avisos e nenhum falso positivo avaliável. Isso confirma uma boa base estrutural, mas não invalida os defeitos vistos na renderização.

**Sobreposição visual:** não foi disponibilizada. A preflight de mutação falhou porque a superfície de avaliação do navegador é somente leitura, portanto nenhum script foi injetado e nenhum overlay foi alegado.

## Overall Impression

A primeira dobra é clara, profissional e memorável. A maior oportunidade é fazer a evidência operacional — data, origem, integridade e estados dos dados — alcançar o mesmo nível da aparência premium.

## What's Working

- O hero comunica ação e benefício em poucos segundos.
- A linguagem visual é distinta e adequada a inteligência de preços local.
- Há uma boa base de acessibilidade: skip link, foco visível, alvos de toque, busca por teclado, diálogo com foco e Escape, e redução de movimento.

## Priority Issues

1. **[P1] Dados incompletos aparecem como conteúdo quebrado.**
   - **Por que importa:** `- · -`, unidades vazias e imagens inválidas minam a confiança e ocupam espaço sem informar.
   - **Correção:** omitir campos ausentes, criar fallback visual intencional e explicar ausência somente quando útil.
   - **Comando sugerido:** `$impeccable harden`.

2. **[P1] A promessa de transparência não é verificável.**
   - **Por que importa:** “Atualizado” sem timestamp, origem ou contexto para outliers parece marketing, não evidência.
   - **Correção:** mostrar data/hora, origem e condição da oferta; contextualizar diferenças extremas.
   - **Comando sugerido:** `$impeccable clarify`.

3. **[P2] Tipografia funcional pequena demais.**
   - **Por que importa:** 29 elementos `<small>` ficaram abaixo de 12 px, incluindo detalhes decisivos como bairro e atualização.
   - **Correção:** adotar piso de 12–14 px e preferir 14 px no móvel.
   - **Comando sugerido:** `$impeccable typeset`.

4. **[P2] A homepage móvel é longa e repetitiva.**
   - **Por que importa:** cerca de 7.378 px no viewport observado, com prova e comparação repetidas antes do bloco comercial.
   - **Correção:** fundir ou condensar superfícies redundantes, limitar cartões no móvel e oferecer progressão clara.
   - **Comando sugerido:** `$impeccable distill`.

5. **[P2] O modal não representa honestamente todos os estados.**
   - **Por que importa:** uma oferta única é chamada de comparação e o fundo continua exposto à árvore assistiva.
   - **Correção:** alternar o título para “Detalhes do preço” e isolar semanticamente o conteúdo de fundo.
   - **Comando sugerido:** `$impeccable polish`.

## Persona Red Flags

- **Jordan, primeira visita:** o hero orienta bem, mas muitos CTAs equivalentes depois da dobra deixam incerto o próximo passo.
- **Riley, tecnologia assistiva:** textos de 9–11 px, dados ausentes sem rótulo e fundo acessível durante o diálogo prejudicam o fluxo.
- **Casey, celular e conexão limitada:** rolagem longa, mídia quebrada e evidência tardia custam tempo e dados móveis.
- **Morador de Feijó comparando antes de sair:** precisa ver preço, loja, bairro e data antes de elementos decorativos; divergências grandes sem contexto parecem erro de cadastro.

## Minor Observations

- O título móvel ocupa quatro linhas em telas estreitas.
- `—` durante carregamento evita salto, mas também mascara falha persistente.
- Loja em caixa alta compete com o nome do produto.
- O bloco para comerciantes muda de público abruptamente.
- Categorias com navegação e busca usam o mesmo tratamento visual para comportamentos diferentes.

## Questions to Consider

- Se transparência é o ativo central, por que data e origem têm menos destaque que “Economize”?
- Uma demonstração impecável substituiria radar, oportunidades e comparação repetidos?
- Quando existe uma única loja, o produto deveria chamar a tela de comparação?
- Qual é a menor experiência que ainda permite decidir com conexão limitada?

## Recommended Actions

1. **`$impeccable harden`**: tratar dados ausentes, falhas de imagem e estados remotos.
2. **`$impeccable clarify`**: explicitar atualização, origem, divergências e oferta única.
3. **`$impeccable typeset`**: elevar o piso tipográfico dos metadados essenciais.
4. **`$impeccable distill`**: reduzir repetição e extensão no celular.
5. **`$impeccable polish`**: harmonizar todos os ajustes e validar o fluxo completo.

Questions skipped: o usuário já autorizou explicitamente aplicar todos os achados, confirmou o público, o escopo funcional e a preservação dos fluxos existentes.

