import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WhatsAppSupportButtonProps {
  whatsappNumber?: string
  currentStep?: number
  className?: string
}

const DEFAULT_WHATSAPP = '5511999999999'

export function WhatsAppSupportButton({
  whatsappNumber,
  currentStep,
  className,
}: WhatsAppSupportButtonProps) {
  const number = whatsappNumber || DEFAULT_WHATSAPP
  const message = currentStep
    ? `Olá! Preciso de ajuda no onboarding do Gerador de Landing Page (Etapa ${currentStep})`
    : 'Olá! Preciso de ajuda com o Gerador de Landing Page'

  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 active:scale-95',
        className,
      )}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Precisa de ajuda?</span>
    </a>
  )
}
