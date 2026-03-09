export const OPENROUTER_MODELS = [
  {
    id: 'google/gemini-3.1-flash-image-preview',
    alias: 'Gemini Flash (Nano Banana 2)',
    description: 'Geracao nativa de imagens do Google. Melhor custo-beneficio com instrucoes ricas.',
  },
  {
    id: 'google/gemini-2.5-flash-image',
    alias: 'Gemini 2.5 Flash Image',
    description: 'Modelo Gemini 2.5 otimizado para geracao de imagens.',
  },
  {
    id: 'openai/gpt-5-image-mini',
    alias: 'GPT-5 Image Mini',
    description: 'Melhor seguimento de instrucoes complexas.',
  },
] as const

export type OpenRouterModelId = (typeof OPENROUTER_MODELS)[number]['id']
