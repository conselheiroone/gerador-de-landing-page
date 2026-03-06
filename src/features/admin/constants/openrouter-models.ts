export const OPENROUTER_MODELS = [
  {
    id: 'google/gemini-flash-3.1-image-preview',
    alias: 'Gemini Flash (Nano Banana 2)',
    description: 'Geracao nativa de imagens do Google. Melhor custo-beneficio com instrucoes ricas.',
  },
  {
    id: 'black-forest-labs/flux-2-klein-4b',
    alias: 'FLUX.2 Klein',
    description: 'Ultra economico para alto volume.',
  },
  {
    id: 'openai/gpt-5-image-mini',
    alias: 'GPT-5 Image Mini',
    description: 'Melhor seguimento de instrucoes complexas.',
  },
] as const

export type OpenRouterModelId = (typeof OPENROUTER_MODELS)[number]['id']
