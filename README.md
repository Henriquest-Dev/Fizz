# FIZZ — Altamente Refrescante

Landing page responsiva da FIZZ Moçambique (Mopani Internacional). A estrutura e o movimento seguem o vídeo de referência (`Mockups.space.mp4`) e os guias em [`docs/`](docs/).

**Online:** https://henriquest-dev.github.io/Fizz/ (publicado automaticamente a cada push; ver `.github/workflows/pages.yml`).

## Ver localmente

É um site estático, sem build:

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Secções

| Âncora | Conteúdo |
| --- | --- |
| `#inicio` | Hero verde com Limão + Cola à frente de «REFRESCANTE»; «Ver produtos» e «Comprar por grosso» |
| `#sabores` | Título editorial, fotografia, e os oito sabores um a um ao longo do scroll (nome, cor e botão mudam com o sabor) |
| `#gama` | As oito garrafas abrem-se em arco sobre um palco |
| `#produtos` | Grelha dos oito produtos com filtros (Refrigerantes / Bebida energética) e detalhe em janela |
| `#contactos` | Separadores **Compra por grosso** (pedido de cotação), **Fornecedores** (proposta) e **Geral**, mais contactos directos e «Sobre» |
| `#newsletter` | Subscrição de novidades |

## Estrutura

```
index.html               marcação, texto e cartões de produto (HTML estático, bom para SEO)
assets/css/style.css     layout, tipografia, mobile/tablet, movimento reduzido
assets/js/data.js        catálogo e destinos dos formulários  ← configurar aqui
assets/js/main.js        canvas sticky e coreografia por scroll
assets/js/forms.js       menu, separadores, filtros, detalhe, validação e envio
assets/produtos/         oito recortes limpos (WebP grande + versão para cartões)
assets/img/              logótipo e fotografia editorial
docs/                    guias e catalogo.json do kit
```

## Animação

As garrafas são desenhadas num `<canvas>` sticky a partir dos recortes limpos, reproduzindo a coreografia dos frames do kit (medida frame a frame):

- **Hero:** Limão de −10° para −6° e Cola de 14° para 10°, a flutuar.
- **Sabores:** a garrafa principal (≈ 77 % da altura) desliza para a esquerda e desvanece; a seguinte entra pela direita (≈ 59 %, semitransparente) e ocupa o lugar. A ordem é Uva, Framboesa, Limão, Cola, Laranja, Ananás, Litchi e Energy Drink.
- **Gama:** as oito abrem em arco, com o centro atrás e as pontas à frente.

Usar os recortes em vez dos 52 PNG do kit dá movimento contínuo (interpolado, sem saltos de 4 imagens por transição) e nenhum halo. Também reduz o peso: cerca de 1 MB contra dezenas.

- Scroll suavizado com `requestAnimationFrame`; nunca é bloqueado (só `position: sticky`).
- `devicePixelRatio` limitado a 2. Limão e Cola carregam primeiro; os restantes vêm em sequência.
- Com `prefers-reduced-motion: reduce` ou sem JavaScript, o canvas desaparece e ficam composições estáticas.

## Limpeza dos recortes

Vários PNG do kit tinham o fundo xadrez "falso" embutido (quadrados cinza/branco opacos à volta da garrafa, sobretudo Litchi, Energy e Cola). Outros tinham o corpo com opacidade 250/255, ligeiramente transparente. Cada produto foi processado assim:

1. Opacidade total no corpo da garrafa (alpha ≥ 235 → 255).
2. Máscara de segmentação **BiRefNet** (`rembg`, modelo `birefnet-general-lite`), que separa a garrafa do xadrez mesmo na Litchi (garrafa branca sobre xadrez branco). Tampas e gargalos transparentes ficam intactos.
3. Remoção de ilhas soltas, anti-aliasing de 1 px e **descontaminação de cor nas bordas**, sem halo claro nem escuro em fundos verdes ou creme.
4. Corte justo à garrafa.

Casos especiais:

- **Cola:** não vem no kit v2; foi usada a do primeiro kit, limpa com o mesmo processo.
- **Ananás:** não existe como produto no kit. Foi extraída do frame `sabores_021`, endireitada (−12°), ampliada 2×, e as bordas foram limpas por cor (xadrez neutro contra corpo amarelo) e simetria da garrafa. A resolução é mais baixa que a dos outros; substituir por fotografia oficial quando existir.

## Formulários

Os formulários têm validação com mensagens em português, NUIT opcional com 9 dígitos, consentimento obrigatório com ligação à política de privacidade, campo *honeypot*, tempo mínimo de preenchimento e limite de um envio a cada 30 s.

**Por agora nada é enviado.** Em `assets/js/data.js`, `endpoints` está vazio, por isso o site valida e mostra a confirmação com a nota «Pré-visualização: o envio ainda não está ligado». Para activar, preencher cada endpoint com o URL de um serviço aprovado (Formspree, Getform, API própria…) que aceite `POST` com `FormData`:

```js
endpoints: {
  cotacao: 'https://formspree.io/f/XXXX',
  fornecedores: 'https://formspree.io/f/YYYY',
  geral: 'https://formspree.io/f/ZZZZ',
  newsletter: 'https://…',
},
```

## A confirmar antes da publicação comercial

- Contactos de vendas (sales@mopani.co.mz, +258 82 303 7714), tal como indicado no guia.
- Disponibilidade actual de cada sabor (sobretudo Uva), embalagens e volumes. O site mostra «A confirmar com a Mopani» e não mostra preços.
- O texto da política de privacidade é uma base a validar.
- Os recortes são reconstruções; usar ficheiros oficiais e um logótipo vectorial quando existirem.
- A fotografia editorial vem de uma publicação pública de @fizz_mopani.
