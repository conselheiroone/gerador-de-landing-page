import { useState, useEffect, useRef } from 'react'
import { HexColorPicker } from 'react-colorful'

interface ColorInputProps {
  value: string
  onChange: (color: string) => void
  className?: string
}

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function ColorInput({ value, onChange, className = '' }: ColorInputProps) {
  const [text, setText] = useState(value)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setText(value)
  }, [value])

  // Fecha o picker ao clicar fora
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleTextChange = (raw: string) => {
    let v = raw.trim()
    if (v && !v.startsWith('#')) v = `#${v}`
    setText(v)
    if (HEX_RE.test(v)) {
      onChange(v)
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200 flex-shrink-0"
          style={{ backgroundColor: value }}
          aria-label="Selecionar cor"
        />
        <input
          type="text"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={() => setText(value)}
          placeholder="#000000"
          className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 font-mono"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 left-0">
          <HexColorPicker color={value} onChange={onChange} />
        </div>
      )}
    </div>
  )
}
