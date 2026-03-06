import { useEditor } from '@craftjs/core'
import { useEffect } from 'react'

export const KeyboardShortcuts = () => {
  const { actions, query } = useEditor()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (query.history.canUndo()) {
          actions.history.undo()
        }
      }
      // Redo: Ctrl+Y ou Ctrl+Shift+Z
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault()
        if (query.history.canRedo()) {
          actions.history.redo()
        }
      }
      // Delete: Delete ou Backspace (quando nao editando texto)
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target as HTMLElement)?.getAttribute?.('contenteditable')
      ) {
        const selectedNodeId = query.getEvent('selected').first()
        if (selectedNodeId && query.node(selectedNodeId).isDeletable()) {
          e.preventDefault()
          actions.delete(selectedNodeId)
        }
      }

      // Duplicar: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        const selectedNodeId = query.getEvent('selected').first()
        if (selectedNodeId && selectedNodeId !== 'ROOT') {
          const node = query.node(selectedNodeId)
          const parentId = node.get().data.parent
          if (parentId) {
            const nodeTree = query.node(selectedNodeId).toNodeTree()
            actions.addNodeTree(nodeTree, parentId)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [actions, query])

  return null
}
