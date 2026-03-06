/**
 * Templates pré-definidos para o editor Craft.js.
 * Array vazio — templates padrão foram removidos.
 */

export interface TemplateNode {
  type: string
  isCanvas?: boolean
  props: Record<string, unknown>
  displayName?: string
  custom?: Record<string, unknown>
  children?: TemplateNode[]
}

export function buildCraftJson(root: TemplateNode): string {
  const nodes: Record<string, Record<string, unknown>> = {}
  let counter = 0

  function processNode(node: TemplateNode, parentId: string | null): string {
    const nodeId = parentId === null ? 'ROOT' : `node-${++counter}`
    const childIds: string[] = []
    if (node.children) {
      for (const child of node.children) {
        childIds.push(processNode(child, nodeId))
      }
    }
    nodes[nodeId] = {
      type: { resolvedName: node.type },
      isCanvas: node.isCanvas ?? false,
      props: node.props,
      displayName: node.displayName ?? node.type.replace('Component', ''),
      custom: node.custom ?? {},
      hidden: false,
      nodes: childIds,
      linkedNodes: {},
      ...(parentId ? { parent: parentId } : {}),
    }
    return nodeId
  }

  processNode(root, null)
  return JSON.stringify(nodes)
}

export interface BuiltinTemplate {
  id: string
  nome: string
  descricao: string
  categoria: string
  json: string
}

export const builtinTemplates: BuiltinTemplate[] = []

export function getBuiltinTemplates(): BuiltinTemplate[] {
  return builtinTemplates
}

export function getBuiltinTemplate(id: string): BuiltinTemplate | undefined {
  return builtinTemplates.find((t) => t.id === id)
}
