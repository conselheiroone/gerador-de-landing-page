/**
 * Injeta animacoes de scroll (fade-in, staggered children, countUp)
 * quando o editor esta em modo preview (enabled = false).
 *
 * REGRA PRINCIPAL: A <section> NUNCA perde opacity.
 * Backgrounds, overlays e imagens de fundo ficam sempre visiveis.
 * Apenas os filhos de conteudo (nao overlays) sao animados.
 */

import { useEffect } from 'react'
import { useEditor } from '@craftjs/core'
import { ANIMATION_CSS } from '../../utils/animation-styles'

/** Parseia "500+" -> { num: 500, suffix: "+" } */
function parseCounterValue(val: string): { num: number; suffix: string } | null {
  const m = val.match(/^([\d.]+)(.*)$/)
  if (!m) return null
  return { num: parseFloat(m[1]), suffix: m[2] }
}

function animateCounter(el: HTMLElement, target: number, suffix: string) {
  const isFloat = String(target).includes('.')
  const duration = 2000
  const start = performance.now()

  function step(now: number) {
    const t = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    const current = eased * target
    el.textContent = (isFloat ? current.toFixed(1) : Math.round(current).toString()) + suffix
    if (t < 1) requestAnimationFrame(step)
    else el.classList.add('lp-counter-done')
  }

  el.textContent = '0' + suffix
  requestAnimationFrame(step)
}

/** Verifica se um elemento e um overlay (nao deve ser animado) */
function isOverlay(el: Element): boolean {
  const style = (el as HTMLElement).style
  if (!style) return false
  // Overlays tem pointer-events: none e position: absolute
  return style.pointerEvents === 'none' || (style.position === 'absolute' && style.inset === '0')
}

export function PreviewAnimations() {
  const { enabled } = useEditor((s) => ({ enabled: s.options.enabled }))

  useEffect(() => {
    if (enabled) return

    // Injeta CSS de animacoes
    const styleId = 'lp-preview-animations-css'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = ANIMATION_CSS
      document.head.appendChild(style)
    }

    let rafId1: number
    let rafId2: number

    rafId1 = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        const scrollRoot = document.querySelector('.craftjs-renderer') as HTMLElement | null
        if (!scrollRoot) return

        const scrollRect = scrollRoot.getBoundingClientRect()
        function isSectionVisible(el: Element): boolean {
          const r = el.getBoundingClientRect()
          return r.bottom > scrollRect.top && r.top < scrollRect.bottom
        }

        // ── Coleta filhos de conteudo de cada section ──────
        // REGRA: A primeira section (hero) NUNCA recebe animacao de scroll.
        // Apenas secoes abaixo do hero recebem fade-in ao scroll.
        // Isso replica o padrao do super-contabil-landing.html.
        const contentChildren: Element[] = []
        const sections = scrollRoot.querySelectorAll('section')

        sections.forEach((sec, index) => {
          if (index === 0) {
            // ── Hero: animacao de entrada CSS ──
            // Referencia: textos = fadeInUp staggered, imagem = fadeInRight, cards = float infinite
            const contentWrapper = Array.from(sec.children).find((child) => {
              const s = (child as HTMLElement).style
              return s && s.zIndex === '1' && !isOverlay(child)
            }) as HTMLElement | undefined

            if (contentWrapper) {
              // Detecta hero grid (container flex-direction: row) — estrutura split hero
              const heroGrid = Array.from(contentWrapper.children).find((child) => {
                const s = (child as HTMLElement).style
                return s && s.flexDirection === 'row'
              }) as HTMLElement | undefined

              if (heroGrid && heroGrid.children.length >= 2) {
                // Hero split: coluna texto (fadeInUp) + coluna imagem (fadeInRight)
                const columns = Array.from(heroGrid.children)
                columns.forEach((col, colIndex) => {
                  const el = col as HTMLElement
                  if (colIndex === columns.length - 1) {
                    // Ultima coluna = imagem: fadeInRight
                    el.classList.add('lp-hero-child-right')
                  } else {
                    // Colunas de texto: fadeInUp
                    el.classList.add('lp-hero-child')
                    el.style.animationDelay = `${colIndex * 0.1}s`
                  }
                })
              } else {
                // Hero simples (sem split): fadeInUp staggered em todos os filhos
                let delay = 0
                Array.from(contentWrapper.children).forEach((child) => {
                  const el = child as HTMLElement
                  el.classList.add('lp-hero-child')
                  el.style.animationDelay = `${delay}s`
                  delay += 0.1
                })
              }
            }
            return
          }

          const visible = isSectionVisible(sec)
          // Percorre filhos diretos da section
          Array.from(sec.children).forEach((child) => {
            if (isOverlay(child)) return // Pula overlays

            if (visible) {
              // Secao ja visivel: mostra conteudo imediatamente
              child.classList.add('lp-child-ready', 'lp-child-visible')
            } else {
              // Secao fora do viewport: esconde conteudo para animar depois
              child.classList.add('lp-child-ready')
            }
            contentChildren.push(child)
          })
        })

        // ── IntersectionObserver: revela conteudo ao scroll ──
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return

              // Quando a section entra no viewport, revela todos os filhos de conteudo
              const sec = entry.target
              observer.unobserve(sec)

              let delay = 0
              Array.from(sec.children).forEach((child) => {
                if (!child.classList.contains('lp-child-ready')) return
                if (child.classList.contains('lp-child-visible')) return

                // Stagger: cada filho aparece com um pequeno atraso
                setTimeout(() => {
                  child.classList.add('lp-child-visible')
                }, delay)
                delay += 100
              })
            })
          },
          { root: scrollRoot, threshold: 0.08 },
        )

        // Observa sections que tem filhos nao-visiveis
        sections.forEach((sec) => {
          const hasHidden = Array.from(sec.children).some(
            (c) => c.classList.contains('lp-child-ready') && !c.classList.contains('lp-child-visible'),
          )
          if (hasHidden) observer.observe(sec)
        })

        // ── Fallback ──
        const fallbackTimer = setTimeout(() => {
          contentChildren.forEach((el) => {
            if (!el.classList.contains('lp-child-visible')) {
              el.classList.add('lp-child-visible')
            }
          })
        }, 500)

        // ── Counter animation para StatsBand ──────────────
        const counterObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return
              counterObserver.unobserve(entry.target)

              const el = entry.target as HTMLElement
              const raw = el.textContent?.trim() || ''
              const parsed = parseCounterValue(raw)
              if (parsed) {
                animateCounter(el, parsed.num, parsed.suffix)
              }
            })
          },
          { root: scrollRoot, threshold: 0.3 },
        )

        scrollRoot.querySelectorAll('span').forEach((span) => {
          const fontSize = window.getComputedStyle(span).fontSize
          const size = parseFloat(fontSize)
          if (size >= 36 && parseCounterValue(span.textContent?.trim() || '')) {
            span.setAttribute('data-lp-counter', span.textContent?.trim() || '')
            counterObserver.observe(span)
          }
        })

        // Cleanup refs
        ;(scrollRoot as any).__lp_cleanup = () => {
          observer.disconnect()
          counterObserver.disconnect()
          clearTimeout(fallbackTimer)
        }
      })
    })

    return () => {
      cancelAnimationFrame(rafId1)
      cancelAnimationFrame(rafId2)

      const scrollRoot = document.querySelector('.craftjs-renderer') as any
      if (scrollRoot?.__lp_cleanup) {
        scrollRoot.__lp_cleanup()
        delete scrollRoot.__lp_cleanup
      }

      // Remove classes de animacao
      document.querySelectorAll('.lp-child-ready, .lp-child-visible').forEach((el) => {
        el.classList.remove('lp-child-ready', 'lp-child-visible')
      })
      document.querySelectorAll('.lp-hero-child, .lp-hero-child-right, .lp-hero-float').forEach((el) => {
        el.classList.remove('lp-hero-child', 'lp-hero-child-right', 'lp-hero-float')
        ;(el as HTMLElement).style.animationDelay = ''
      })
      document.querySelectorAll('.lp-counter-done').forEach((el) => {
        el.classList.remove('lp-counter-done')
      })
      document.querySelectorAll('[data-lp-counter]').forEach((el) => {
        el.removeAttribute('data-lp-counter')
      })
    }
  }, [enabled])

  return null
}
