-- ============================================================
-- Migration: OpenRouter Admin
-- Tabelas para: overrides de modelo por usuario, prompts por modelo
-- Seeds: modelo default global, system prompt, prompts por modelo
-- ============================================================

-- ============================================================
-- 1. openrouter_user_overrides (override de modelo por usuario)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.openrouter_user_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  image_model TEXT NOT NULL,
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.openrouter_user_overrides ENABLE ROW LEVEL SECURITY;

-- RLS: SOMENTE admin — usuario NAO pode ler (invisivel)
CREATE POLICY "Admins podem tudo em openrouter_user_overrides"
  ON public.openrouter_user_overrides FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- 2. ai_model_prompts (prompt-template por modelo de IA)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_model_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id TEXT UNIQUE NOT NULL,
  prompt_template TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.ai_model_prompts ENABLE ROW LEVEL SECURITY;

-- RLS: SOMENTE admin — usuario NAO le (prompts sao server-side)
CREATE POLICY "Admins podem tudo em ai_model_prompts"
  ON public.ai_model_prompts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- 3. Triggers: updated_at automatico
-- ============================================================

CREATE TRIGGER openrouter_user_overrides_updated_at
  BEFORE UPDATE ON public.openrouter_user_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ai_model_prompts_updated_at
  BEFORE UPDATE ON public.ai_model_prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. Seeds: admin_settings (modelo default + system prompt)
-- ============================================================

INSERT INTO public.admin_settings (key, value) VALUES
  ('openrouter_default_image_model', 'google/gemini-flash-3.1-image-preview'),
  ('ai_image_system_prompt', 'Voce e um gerador de imagens para sites profissionais de empresas brasileiras. Gere imagens limpas, modernas e corporativas. Nunca inclua texto na imagem. Nunca gere conteudo inadequado. As imagens devem transmitir profissionalismo e confianca.')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 5. Seeds: ai_model_prompts (um prompt otimizado por modelo)
-- Variaveis interpolaveis: {{nome_empresa}}, {{slogan}},
-- {{segmento}}, {{servicos}}, {{diferenciais}},
-- {{cor_primaria}}, {{cor_secundaria}}, {{cidade}}, {{estado}}
-- ============================================================

INSERT INTO public.ai_model_prompts (model_id, prompt_template) VALUES

-- Gemini Flash: instrucoes ricas em Markdown, portugues
('google/gemini-flash-3.1-image-preview',
'## Instrucoes de Geracao

Crie uma imagem profissional para o site da empresa **{{nome_empresa}}**.

{{slogan}}

### Contexto da Empresa
- Segmento: {{segmento}}
- Servicos oferecidos: {{servicos}}
- Diferenciais: {{diferenciais}}
- Localizacao: {{cidade}}/{{estado}}

### Estilo Visual
- Cores predominantes: {{cor_primaria}} (primaria) e {{cor_secundaria}} (secundaria)
- Estilo: fotografia corporativa moderna, clean, alta resolucao
- Aspecto profissional, confiavel e sofisticado
- Composicao equilibrada com espacos limpos
- Iluminacao natural e suave

### Restricoes
- NAO inclua texto, letras ou numeros na imagem
- NAO gere rostos distorcidos ou irreais
- NAO inclua marcas dagua ou logos
- Formato paisagem (16:9), adequado para banner de site'),

-- FLUX.2 Klein: prompt mais direto e curto, em ingles
('black-forest-labs/flux-2-klein-4b',
'Professional corporate photography for {{nome_empresa}}, a {{segmento}} company based in {{cidade}}, {{estado}}, Brazil. Services: {{servicos}}. Clean modern aesthetic, primary color {{cor_primaria}}, secondary color {{cor_secundaria}}. High quality, sharp focus, natural lighting. No text overlay, no watermarks, no logos. Business-oriented hero banner, 16:9 landscape format. Professional, trustworthy, sophisticated atmosphere.'),

-- GPT-5 Image Mini: instrucoes detalhadas e complexas, em ingles
('openai/gpt-5-image-mini',
'Generate a high-quality professional image for the website of {{nome_empresa}}.

**Company Profile:**
- Industry: {{segmento}}
- Services: {{servicos}}
- Differentials: {{diferenciais}}
- Tagline: "{{slogan}}"
- Location: {{cidade}}, {{estado}}, Brazil

**Visual Requirements:**
- Primary color: {{cor_primaria}}
- Secondary color: {{cor_secundaria}}
- Style: Modern corporate photography with clean composition
- Lighting: Natural, soft, professional studio quality
- Format: Landscape 16:9, suitable for a hero banner
- Mood: Professional, trustworthy, innovative, welcoming

**Strict Rules:**
- Do NOT include any text, letters, numbers, or typography in the image
- Do NOT include watermarks, logos, or brand marks
- Do NOT generate distorted or unrealistic human faces
- Ensure the image feels authentic and corporate
- Use the specified colors subtly in the composition (backgrounds, accents, lighting tones)')

ON CONFLICT (model_id) DO NOTHING;
