import { useRef, useState, useCallback, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface InputOTPProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function InputOTP({ length = 6, value, onChange, disabled }: InputOTPProps) {
  const [focusIndex, setFocusIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length)

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const focusInput = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, length - 1))
    inputRefs.current[clamped]?.focus()
    setFocusIndex(clamped)
  }, [length])

  const handleKeyDown = useCallback((index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newDigits = digits.slice()
      if (newDigits[index]) {
        newDigits[index] = ''
        onChange(newDigits.join(''))
      } else if (index > 0) {
        newDigits[index - 1] = ''
        onChange(newDigits.join(''))
        focusInput(index - 1)
      }
    } else if (e.key === 'ArrowLeft') {
      focusInput(index - 1)
    } else if (e.key === 'ArrowRight') {
      focusInput(index + 1)
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault()
      const newDigits = digits.slice()
      newDigits[index] = e.key
      onChange(newDigits.join('').slice(0, length))
      if (index < length - 1) {
        focusInput(index + 1)
      }
    }
  }, [digits, focusInput, length, onChange])

  const handlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) {
      onChange(pasted)
      focusInput(Math.min(pasted.length, length - 1))
    }
  }, [focusInput, length, onChange])

  return (
    <div className="flex items-center justify-center gap-2">
      {digits.map((digit, index) => (
        <div key={index} className="flex items-center">
          {index === Math.floor(length / 2) && (
            <span className="mx-2 text-xl text-gray-400">—</span>
          )}
          <input
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onFocus={() => setFocusIndex(index)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            readOnly
            className={cn(
              'h-12 w-10 rounded-lg border bg-white text-center text-lg font-semibold text-gray-900 outline-none transition-all',
              focusIndex === index
                ? 'border-brand-500 ring-2 ring-brand-500/20'
                : 'border-gray-200',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          />
        </div>
      ))}
    </div>
  )
}
