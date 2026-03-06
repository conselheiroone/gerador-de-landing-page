import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ONBOARDING_STEPS } from '../types/onboarding.types'

interface StepIndicatorProps {
  currentStep: number
  onStepClick?: (step: number) => void
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav className="w-full">
      {/* Mobile: compacto */}
      <div className="flex items-center justify-between gap-1 md:hidden">
        {ONBOARDING_STEPS.map((step) => {
          const isCompleted = currentStep > step.numero
          const isCurrent = currentStep === step.numero

          return (
            <button
              key={step.numero}
              type="button"
              onClick={() => onStepClick?.(step.numero)}
              disabled={step.numero > currentStep}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
                  isCompleted && 'bg-brand-500 text-white',
                  isCurrent && 'bg-brand-500 text-white ring-2 ring-brand-200',
                  !isCompleted && !isCurrent && 'bg-gray-100 text-gray-400',
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.numero}
              </div>
              {isCurrent && (
                <span className="text-[10px] font-medium text-brand-600 text-center leading-tight">
                  {step.titulo}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Desktop: lista lateral */}
      <div className="hidden md:flex md:flex-col md:gap-1">
        {ONBOARDING_STEPS.map((step) => {
          const isCompleted = currentStep > step.numero
          const isCurrent = currentStep === step.numero

          return (
            <button
              key={step.numero}
              type="button"
              onClick={() => onStepClick?.(step.numero)}
              disabled={step.numero > currentStep}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                isCurrent && 'bg-brand-50',
                !isCurrent && step.numero <= currentStep && 'hover:bg-gray-50',
                step.numero > currentStep && 'cursor-not-allowed opacity-50',
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors',
                  isCompleted && 'bg-brand-500 text-white',
                  isCurrent && 'bg-brand-500 text-white ring-2 ring-brand-200',
                  !isCompleted && !isCurrent && 'bg-gray-100 text-gray-400',
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.numero}
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isCurrent ? 'text-brand-700' : isCompleted ? 'text-gray-900' : 'text-gray-400',
                  )}
                >
                  {step.titulo}
                </p>
                {isCurrent && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs text-gray-500"
                  >
                    {step.descricao}
                  </motion.p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
