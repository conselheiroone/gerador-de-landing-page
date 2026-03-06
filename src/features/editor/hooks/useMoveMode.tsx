import { createContext, useCallback, useContext, useState } from 'react'

interface MoveModeState {
  movingNodeId: string | null
  movingNodeName: string
  startMove: (nodeId: string, name: string) => void
  cancelMove: () => void
}

const MoveModeContext = createContext<MoveModeState>({
  movingNodeId: null,
  movingNodeName: '',
  startMove: () => {},
  cancelMove: () => {},
})

export function MoveModeProvider({ children }: { children: React.ReactNode }) {
  const [movingNodeId, setMovingNodeId] = useState<string | null>(null)
  const [movingNodeName, setMovingNodeName] = useState('')

  const startMove = useCallback((nodeId: string, name: string) => {
    setMovingNodeId(nodeId)
    setMovingNodeName(name)
  }, [])

  const cancelMove = useCallback(() => {
    setMovingNodeId(null)
    setMovingNodeName('')
  }, [])

  return (
    <MoveModeContext.Provider value={{ movingNodeId, movingNodeName, startMove, cancelMove }}>
      {children}
    </MoveModeContext.Provider>
  )
}

export const useMoveMode = () => useContext(MoveModeContext)
