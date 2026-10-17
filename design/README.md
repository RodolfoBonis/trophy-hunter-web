# Trophy Hunter: direção visual (style tile v0.1)

Proposta para aprovar **antes** de construir as telas. Abra `style-tile.html` no navegador. A página é viva: tem hover com tilt, botões de replay e toggles de neon e de movimento reduzido.

| Arquivo | O que é |
|---|---|
| `style-tile.html` | Style tile autocontido (CSS/JS inline, Google Fonts). Usa `tokens.css` via `<link>` |
| `tokens.css` | Rascunho de tokens em CSS custom properties, com nomes nos namespaces do Tailwind v4 |
| `style-tile-desktop.png` | Página inteira com 1440px de largura |
| `style-tile-mobile.png` | Página inteira com 390px de largura |

## Conceito

Um **console dark com HUD**. A base é quase preta e azulada (`#07080D`), com painéis de cantos chanfrados, bordas finas em gradiente ciano→violeta, scanlines bem sutis (4–5%) e uma grade de fundo que some nas bordas. O neon serve de **sinal**: marca foco, progresso e ação, e nunca é usado como decoração de fundo. O vidro (glassmorphism) aparece só na barra fixa do topo e no toast.

**A platina é a única coisa iridescente da interface.** Bronze, prata e ouro são metálicos sóbrios. A raridade usa cores de loot. Assim, quando aparece o arco-íris, ele significa "platina".

## Paleta

- **Superfícies:** `bg-0 #07080D` · `bg-1 #0B0D15` · `surface-1 #10131E` · `surface-2 #161B2A` · `surface-3 #1F2539`.
- **Texto:** `text-1 #EEF2FA` · `text-2 #A9B3C7` · `text-3 #8590A6` (legendas). `disabled #4A5368` serve só para estado desabilitado.
- **Neon:** ciano `#3DF5FF` é o acento primário e a cor do foco. Violeta `#8B5CF6` aparece só em glow e preenchimento; como texto, usa-se a variante `#B39DFF`.
- **PSN e Steam com identidades distintas:**
  - **PSN** é *preenchimento* azul royal sólido (`#0070D1`) com texto branco.
  - **Steam** é *contorno*: slate escuro (`#1B2838`/`#2A475E`) com traço e texto azul-céu (`#66C0F4`).
  - A diferença está na forma (sólido × outline), não só no tom, então os badges se distinguem até em escala de cinza.
- **Troféus:** bronze `#CD7F32`, prata `#C4CCD8`, ouro `#F5C542`. A platina é um gradiente cônico `#E5F0FF → #B8A9FF → #7FE7FF → #FFD6F5` que gira, com uma faixa de brilho passando por cima.
- **Raridade (loot):**

  | Nível | Faixa | Cor | Forma |
  |---|---|---|---|
  | Comum | ≥50% | cinza `#9AA4B2` | círculo |
  | Incomum | 20–50% | verde `#4ADE80` | losango |
  | Raro | 5–20% | azul `#4C9BFF` | triângulo |
  | Épico | 1–5% | roxo `#B57BFF` | hexágono |
  | Lendário | <1% | laranja `#FF9F3D` | estrela |

## Tipografia

- **Display: Chakra Petch** (proposta). Tem cortes angulares que combinam com o HUD chanfrado, fica ótima em caixa-alta com tracking largo, tem acentuação PT-BR completa e é mais "tática" que sci-fi genérica. A página mostra, lado a lado, **Oxanium** (mais arredondada, peso 800 forte para capas) e **Tomorrow** (geométrica, mais perto do PS5, com menos personalidade).
- **Números: Rajdhani** com `tabular-nums`. É condensada, então cabe em anéis pequenos e nos cards de celular, e as colunas não "dançam" no count-up. **Orbitron** aparece como alternativa: é icônica, mas larga demais para tabelas, então fica restrita a números de hero.
- **Corpo: Inter** 16/1.55. Os guias de IA são texto longo, então nunca usamos display em parágrafos.
- **Rótulos HUD:** Chakra Petch 600, caixa-alta, tracking `0.14em`, 12px.

## Referências (só texto, nenhum asset copiado)

1. **Home do PS5.** Pegamos a arte do jogo em foco ocupando o fundo, a fileira de tiles e o toast discreto no canto superior direito.
2. **Steam Big Picture / Deck.** Pegamos a navegação por foco (D-pad/gamepad), as dicas de botão na tela e o modo TV como cidadão de primeira classe.
3. **Menus HUD de Destiny 2 / Halo Infinite.** Pegamos os cantos chanfrados, os rótulos técnicos com tracking largo, as scanlines sutis e a raridade de loot (cinza→laranja).

## Acessibilidade

- **Contraste:** é calculado em JS a partir dos próprios tokens e aparece numa tabela dentro da página. Pares principais:

  | Par | Razão | |
  |---|---|---|
  | text-1 / bg-0 | 17.8:1 | AAA |
  | text-2 / surface-2 | 8.1:1 | AAA |
  | text-3 / surface-2 | 5.3:1 | AA |
  | text-3 / surface-3 | 4.7:1 | AA |
  | neon-cyan / bg-0 | 15.0:1 | |
  | texto escuro / botão ciano | 14.2:1 | |
  | branco / PSN `#0070D1` | 4.95:1 | AA |
  | `#5AA9FF` (azul PSN como texto) / surface-2 | 7.0:1 | |
  | Steam `#66C0F4` / `#1B2838` | 7.4:1 | |
  | cores de raridade / surface-2 | 5.9–8.4:1 | |

  Todo texto de corpo fica ≥4.5:1. Três cores ficam fora de qualquer texto: violeta puro (4.7:1) e azul PSN puro (4.0:1), usados só como preenchimento ou glow, e `disabled` (2.2:1), só para estado desabilitado. Por isso a tabela as marca como "decorativo".
- **Sinais que não dependem de cor:**
  - Cada tipo de troféu tem um glifo SVG próprio: cálice liso, cálice com faixas, cálice com estrela, cálice com diamante e louros, e moldura hexagonal para a conquista Steam. O nome do tipo também aparece escrito.
  - Raridade sempre tem cor, forma, rótulo e %.
  - Troféu bloqueado tem cadeado e a palavra "Bloqueado". A confiança da IA mostra barras e o texto "3/4".
- **Foco:** anel ciano de 2px com offset de 3px (4px no modo TV). Alvos de toque têm pelo menos 44px (64px na TV).
- **Movimento reduzido:** `prefers-reduced-motion` e o atributo `data-motion="reduce"` (o toggle no topo da página simula isso) zeram os tokens de duração. Com isso:
  - tilt, partículas e loops (brilho da platina, shimmer) param;
  - o conteúdo final é idêntico;
  - só são animados `transform` e `opacity`. A única exceção é `stroke-dashoffset` nos anéis SVG.
- **Spoilers:** o troféu oculto fica borrado até um clique explícito em "Clique para revelar". Esse é um botão de verdade, acessível pelo teclado.

## Tokens → Tailwind v4

`tokens.css` usa os namespaces `--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--ease-*` e `--breakpoint-*`. Para usar no Tailwind, basta mover o bloco `:root` para dentro de um `@theme {}`. Os tokens sem namespace no Tailwind continuam como variáveis comuns e viram utilities próprias quando precisar: `--chamfer-*`, `--dur-*`, `--z-*`, `--tv-*` e `--glow-mix`. O chanfro é um `clip-path` com `--c`, e vale extrair um utility `chamfer-{sm,md,lg}`.

## Decisões em aberto (para você escolher)

1. **Fonte display:** Chakra Petch (proposta, mais tática), Oxanium (mais sci-fi/console, peso 800) ou Tomorrow (mais limpa, estilo PS5).
2. **Intensidade do neon:** baixo, médio ou alto (toggle no topo; muda o glow e as scanlines). A proposta é **médio**. Se o app for usado muito à noite no celular, o baixo cansa menos.
3. **Scanlines e grade de fundo:** manter em todas as telas, ou só no hero e na cerimônia de platina? A proposta é manter globalmente em 4–5%, porque é quase imperceptível em telas pequenas.

Detalhes menores que também podem mudar:
- Rajdhani × Orbitron para os números;
- toast no canto superior direito (PS5) × inferior;
- conquista Steam com moldura hexagonal ou quadrada.
