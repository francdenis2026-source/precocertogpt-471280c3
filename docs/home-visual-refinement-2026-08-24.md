# Refinamento visual da homepage — 24/08/2026

## Escopo

Homepage desktop e mobile, chrome compartilhado visível nessa rota, temas claro/escuro e metadados PWA. A logo não foi alterada; o escudo permanece como decisão de marca pendente de validação humana.

## Inventário antes da mudança

O levantamento nos estilos da home, player, banner, conta e camada dark encontrou mais de 100 valores hexadecimais distintos. Parte deles eram variações neutras legítimas, mas havia matizes visíveis sem papel comum:

- CTA terracota;
- player azul;
- avatar bege/dourado;
- seis cores diferentes nas categorias;
- verde de preço com variações independentes;
- bordas douradas no dark e cinzas no light;
- superfícies locais `--nx-*` e `--mh-*` competindo com `--pc-*`.

Medição da produção antes da mudança:

| Elemento | Antes |
| --- | --- |
| CTA Entrar | `rgb(194, 83, 44)` |
| Controle do player | `rgb(49, 95, 193)` |
| Ícone de Açougues | `rgb(217, 79, 69)` |
| Nome do produto | 14 px / peso 760 |
| Preço | 19 px / peso 850 |

## P0 — paleta consolidada

O sistema passou a trabalhar com quatro papéis cromáticos:

| Token | Light | Dark | Uso |
| --- | --- | --- | --- |
| `--pc-primary` | `#17633f` | `#96ceb0` | ação, foco, navegação e verificação |
| `--pc-accent` | `#b77918` | `#edc778` | detalhe de marca e assinatura |
| `--pc-price` | `#17633f` | `#adddc2` | preço em destaque |
| `--pc-alert` | `#a63f2b` | `#f0a08a` | erro e alerta somente |

Player, avatar, CTAs, categorias e dock agora consomem esses papéis. As categorias não mantiveram cores próprias: na home elas são navegação do mesmo nível, portanto a codificação multicolorida criava competição sem comunicar estado ou dado.

## P1 — tokens light/dark

Foram adicionados os tokens semânticos `--pc-border-interactive`, `--pc-image-well`, `--pc-on-primary` e `--pc-brand-line`. Variáveis históricas da home agora são pontes para `--pc-*`; o tema altera luminância e contraste, não o significado cromático.

## P2 — hierarquia tipográfica

- Títulos de seção: peso 780 e linha de assinatura.
- Nome do produto: peso 620, menor que o título da seção.
- Preço: peso 850, numerais tabulares e 19–21 px conforme viewport.
- Legendas continuam usando o muted semântico.

## P3 — profundidade, identidade e PWA

- Cards interativos recebem somente sombra sutil; a borda deixou de competir com a elevação.
- O poço de imagem usa `--pc-image-well`; fundo, borda e sombra próprios da imagem foram removidos para evitar “card dentro de card”.
- A linha verde→ouro virou assinatura recorrente nos títulos de seção da home.
- A copy mobile passou de “Economize nas compras” para “Em Feijó, comparar faz seu dinheiro render”, reforçando o caráter hiperlocal.
- O manifest já existia, com `display: standalone`, ícones 192/512 e service worker. Não havia ausência de PWA; o Safari nos screenshots apenas indica que o app não foi adicionado à Tela de Início naquele aparelho. As cores do manifest e do browser chrome foram alinhadas aos tokens da marca.

## Contraste WCAG

| Combinação | Razão |
| --- | ---: |
| Texto / canvas claro | 14,67:1 |
| Muted / canvas claro | 5,78:1 |
| Primary / branco | 7,26:1 |
| Alert / branco | 6,24:1 |
| Texto / canvas escuro | 14,51:1 |
| Muted / canvas escuro | 9,54:1 |
| Primary / surface escuro | 7,67:1 |
| Alert / surface escuro | 6,59:1 |

Todas as combinações novas de texto atendem WCAG AA para texto normal.

## Exceções documentadas

- `manifest.json` e as tags `theme-color` precisam de valores literais porque JSON/HTML não resolvem CSS custom properties. Esses valores espelham exatamente `--pc-primary` e `--pc-canvas`.
- Branco literal permanece em assets, overlays fotográficos e superfícies que precisam de alfa; não representa uma nova cor de marca.
- A logo não foi modificada. Sua leitura mais corporativa/fintech deve ser decidida em uma revisão de marca separada.
