/**
 * Injeta uma seção preset (subtree Craft.js JSON) no canvas atual do editor.
 *
 * Estratégia: parse o JSON da seção, re-key todos os nós com IDs únicos,
 * merge com a árvore existente, e usa actions.deserialize() para aplicar.
 */

interface CraftNode {
  type: { resolvedName: string }
  isCanvas: boolean
  props: Record<string, unknown>
  displayName: string
  custom: Record<string, unknown>
  hidden: boolean
  nodes: string[]
  linkedNodes: Record<string, string>
  parent?: string
}

type CraftTree = Record<string, CraftNode>

export function injectSectionPreset(
  actions: { deserialize: (json: string) => void },
  query: { serialize: () => string },
  sectionJson: string,
): void {
  const current: CraftTree = JSON.parse(query.serialize())
  const section: CraftTree = JSON.parse(sectionJson)

  // Encontrar o root da seção (nó sem parent ou com parent vazio)
  const sectionRootKey = Object.keys(section).find(
    (k) => !section[k].parent || section[k].parent === '',
  ) || Object.keys(section)[0]

  if (!sectionRootKey) return

  // Re-key todos os nós com IDs únicos para evitar colisões
  const keyMap: Record<string, string> = {}
  let counter = Date.now()
  for (const key of Object.keys(section)) {
    keyMap[key] = `preset-${counter++}`
  }

  // Reconstruir a seção com novas keys e referências corrigidas
  const remapped: CraftTree = {}
  for (const [oldKey, newKey] of Object.entries(keyMap)) {
    const node = JSON.parse(JSON.stringify(section[oldKey])) as CraftNode

    // Corrigir parent
    if (node.parent && keyMap[node.parent]) {
      node.parent = keyMap[node.parent]
    }

    // Corrigir children (nodes array)
    if (node.nodes) {
      node.nodes = node.nodes.map((n: string) => keyMap[n] || n)
    }

    // Corrigir linkedNodes
    if (node.linkedNodes) {
      const ln: Record<string, string> = {}
      for (const [lk, lv] of Object.entries(node.linkedNodes)) {
        ln[lk] = keyMap[lv] || lv
      }
      node.linkedNodes = ln
    }

    remapped[newKey] = node
  }

  // Apontar root da seção para ROOT do canvas
  const newRootKey = keyMap[sectionRootKey]
  remapped[newRootKey].parent = 'ROOT'

  // Merge: adicionar nós da seção à árvore atual
  const merged = { ...current, ...remapped }

  // Adicionar a seção como filho do ROOT
  if (merged['ROOT']) {
    merged['ROOT'].nodes = [...(merged['ROOT'].nodes || []), newRootKey]
  }

  // Aplicar a árvore completa
  actions.deserialize(JSON.stringify(merged))
}
