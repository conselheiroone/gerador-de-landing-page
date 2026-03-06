// ─── Extracao: Playwright DOM walk → BoxNode tree ────────────

import { chromium, type Browser } from 'playwright'
import type { BoxNode } from '../types/box-node.js'

let browserInstance: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({
      headless: true,
      args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
    })
  }
  return browserInstance
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance?.isConnected()) {
    await browserInstance.close()
    browserInstance = null
  }
}

/** Propriedades CSS coletadas via getComputedStyle */
const COMPUTED_PROPS = [
  'display', 'position', 'flex-direction', 'flex-wrap',
  'justify-content', 'align-items', 'gap',
  'grid-template-columns', 'grid-template-rows',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'width', 'height', 'min-height', 'max-width',
  'background-color', 'background-image', 'background',
  'color', 'font-size', 'font-weight', 'font-family', 'line-height',
  'text-align', 'letter-spacing', 'text-decoration', 'text-transform',
  'border-radius', 'border', 'border-color', 'border-width',
  'box-shadow', 'opacity', 'overflow', 'object-fit',
]

const SKIP_TAGS = [
  'script', 'style', 'noscript', 'link', 'meta', 'head', 'br', 'hr',
]

export interface ExtractOptions {
  viewportWidth?: number
  viewportHeight?: number
  timeout?: number
}

// ─── Scripts para page.evaluate() ────────────────────────────
// IMPORTANTE: Estes scripts rodam NO BROWSER via Playwright.
// Devem ser STRINGS puras para evitar que tsx/esbuild injete
// __name ou outros helpers que nao existem no contexto do browser.

const FREEZE_ANIMATIONS_SCRIPT = `
  (() => {
    const style = document.createElement('style');
    style.textContent = '*, *::before, *::after { animation-play-state: paused !important; animation-delay: -1ms !important; animation-duration: 0s !important; transition-duration: 0s !important; transition-delay: 0s !important; }';
    document.head.appendChild(style);
    document.querySelectorAll('video').forEach(v => v.pause());
    document.querySelectorAll('img[loading="lazy"]').forEach(img => img.removeAttribute('loading'));
  })()
`

const SCROLL_PAGE_SCRIPT = `
  (async () => {
    const totalHeight = document.body.scrollHeight;
    const step = window.innerHeight;
    for (let y = 0; y < totalHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  })()
`

/**
 * Gera o script de extracao do DOM como string pura.
 * Recebe os parametros serializados para injetar no script.
 */
function buildExtractionScript(
  computedProps: string[],
  skipTags: string[],
  maxDepth: number,
  maxChildren: number,
  minSize: number,
): string {
  return `
    (() => {
      var COMPUTED_PROPS = ${JSON.stringify(computedProps)};
      var SKIP_TAGS = ${JSON.stringify(skipTags)};
      var MAX_DEPTH = ${maxDepth};
      var MAX_CHILDREN = ${maxChildren};
      var MIN_SIZE = ${minSize};
      var uidCounter = 0;

      var walkNode = function(el, depth) {
        if (depth > MAX_DEPTH) return null;

        var tag = el.tagName.toLowerCase();
        if (SKIP_TAGS.indexOf(tag) >= 0) return null;

        var rect = el.getBoundingClientRect();
        if (rect.width < MIN_SIZE && rect.height < MIN_SIZE) return null;
        if (rect.bottom < -100 || rect.top > document.documentElement.scrollHeight + 200) return null;

        var cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return null;
        if (cs.opacity === '0' && tag !== 'body') return null;

        var computed = {};
        for (var i = 0; i < COMPUTED_PROPS.length; i++) {
          var prop = COMPUTED_PROPS[i];
          var val = cs.getPropertyValue(prop);
          if (val && val !== 'none' && val !== 'normal' && val !== 'auto' && val !== '0px' && val !== '0' && val !== 'rgba(0, 0, 0, 0)' && val !== 'transparent' && val !== 'start' && val !== 'stretch') {
            var camelProp = prop.replace(/-([a-z])/g, function(_, c) { return c.toUpperCase(); });
            computed[camelProp] = val;
          }
        }

        var node = {
          uid: 'n-' + (uidCounter++),
          tag: tag,
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            w: Math.round(rect.width),
            h: Math.round(rect.height)
          },
          computed: computed,
          children: []
        };

        // Texto direto
        var texts = [];
        for (var j = 0; j < el.childNodes.length; j++) {
          if (el.childNodes[j].nodeType === 3) {
            var t = el.childNodes[j].textContent;
            if (t && t.trim()) texts.push(t.trim());
          }
        }
        if (texts.length > 0) node.text = texts.join(' ');

        // Imagem
        if (tag === 'img') node.isImg = true;

        // SVG
        if (tag === 'svg') { node.isImg = true; return node; }

        // Video
        if (tag === 'video' || tag === 'iframe') {
          var src = el.getAttribute('src') || '';
          if (tag === 'video' || src.indexOf('youtube') >= 0 || src.indexOf('vimeo') >= 0) {
            node.isVideo = true;
            return node;
          }
        }

        // Background-image
        if (computed.backgroundImage && computed.backgroundImage.indexOf('url(') >= 0) {
          node.isImg = true;
        }

        // Recursar filhos
        var childCount = 0;
        for (var k = 0; k < el.children.length; k++) {
          if (childCount >= MAX_CHILDREN) break;
          var childNode = walkNode(el.children[k], depth + 1);
          if (childNode) {
            node.children.push(childNode);
            childCount++;
          }
        }

        return node;
      };

      return walkNode(document.body, 0);
    })()
  `
}

/**
 * Abre a URL no Playwright, congela animacoes e extrai a arvore de BoxNodes
 * com bounding boxes reais e estilos computados.
 */
export async function extractBoxTree(
  url: string,
  options: ExtractOptions = {},
): Promise<{ tree: BoxNode; title: string | null }> {
  const {
    viewportWidth = 1440,
    viewportHeight = 900,
    timeout = 30_000,
  } = options

  const browser = await getBrowser()
  const context = await browser.newContext({
    viewport: { width: viewportWidth, height: viewportHeight },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  const page = await context.newPage()

  try {
    // RF-01: Navegar com renderizacao real
    await page.goto(url, { waitUntil: 'networkidle', timeout })

    // RNF-01: Congelar animacoes/transicoes
    await page.evaluate(FREEZE_ANIMATIONS_SCRIPT)

    // Scroll para triggerar lazy-load
    await page.evaluate(SCROLL_PAGE_SCRIPT)

    // Esperar imagens carregarem
    await page.waitForTimeout(500)

    // Extrair titulo
    const title = await page.title()

    // RF-02: Walk DOM e coletar BoxNode tree
    const extractionScript = buildExtractionScript(
      COMPUTED_PROPS,
      SKIP_TAGS,
      15,  // maxDepth
      40,  // maxChildren
      2,   // minSize
    )
    const tree = await page.evaluate(extractionScript)

    if (!tree) {
      throw new Error('Nao foi possivel extrair a arvore do DOM. A pagina pode estar vazia.')
    }

    return { tree: tree as BoxNode, title: title || null }
  } finally {
    await context.close()
  }
}
