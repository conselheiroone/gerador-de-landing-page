import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn, slideUp } from '@/lib/motion-variants'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputOTP } from '@/components/ui/input-otp'
import { ArrowLeft, Mail } from 'lucide-react'

type Step = 'form' | 'otp'

export function RegistroPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('form')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const verifyingRef = useRef(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/', { replace: true })
    })
  }, [navigate])

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        data: { nome },
      },
    })

    setIsLoading(false)

    if (otpError) {
      setError(otpError.message)
      return
    }

    setStep('otp')
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault()
    if (verifyingRef.current) return
    verifyingRef.current = true

    setError('')
    setIsLoading(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(),
      token: otpCode,
      type: 'email',
    })

    if (verifyError) {
      setIsLoading(false)
      verifyingRef.current = false
      setError('Código inválido ou expirado. Tente novamente.')
      setOtpCode('')
      return
    }

    navigate('/', { replace: true })
  }

  async function handleResendOtp() {
    setError('')
    setIsLoading(true)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        data: { nome },
      },
    })

    setIsLoading(false)

    if (otpError) {
      setError(otpError.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-500">LandingGen</h1>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key="form-step"
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <p className="mb-6 text-center text-sm text-gray-500">
                Crie sua conta gratuita
              </p>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Nome
                  </label>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  <Mail className="h-4 w-4" />
                  Enviar código de verificação
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Já tem uma conta?{' '}
                <a
                  href="/login"
                  className="font-medium text-brand-500 hover:text-brand-600"
                >
                  Faça login
                </a>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <p className="mb-2 text-center text-sm text-gray-500">
                Enviamos um código de 6 dígitos para
              </p>
              <p className="mb-6 text-center text-sm font-medium text-gray-900">
                {email}
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <InputOTP
                  value={otpCode}
                  onChange={setOtpCode}
                  disabled={isLoading}
                />

                {error && (
                  <p className="text-center text-sm text-red-500">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={otpCode.length < 6}
                >
                  Verificar e criar conta
                </Button>
              </form>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form')
                    setOtpCode('')
                    setError('')
                  }}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-sm font-medium text-brand-500 hover:text-brand-600 disabled:opacity-50"
                >
                  Reenviar código
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
