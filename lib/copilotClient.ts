import ELITE_PROMPT from './elitePrompt'

type AnalyzeResult = { text: string }

async function copilotSdkGenerate(prompt: string) {
  // Use official Copilot SDK when available
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Copilot = require('@github/copilot-sdk')
    const key = process.env.COPILOT_SDK_KEY
    const base = process.env.COPILOT_SDK_BASE_URL
    if (!key) throw new Error('COPILOT_SDK_KEY not set')
    const client = new Copilot.Client({ apiKey: key, baseUrl: base })
    // The SDK may expose different method names; attempt a common one
    if (typeof client.generate === 'function') {
      const resp = await client.generate({ prompt })
      return resp.output || resp
    }
    if (typeof client.createCompletion === 'function') {
      const resp = await client.createCompletion({ prompt })
      return resp.output || resp
    }
    // fallback to HTTP gateway if provided
    if (base) {
      const res = await fetch(`${base.replace(/\/$/, '')}/v1/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.COPILOT_SDK_KEY}` },
        body: JSON.stringify({ model: 'elite-bughunter', input: prompt })
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    }
    throw new Error('Unsupported Copilot SDK shape')
  } catch (err) {
    throw err
  }
}

export async function analyzeCode(code: string, language = 'solidity'): Promise<AnalyzeResult> {
  const prompt = `${ELITE_PROMPT}\n\nUser code (language=${language}):\n${code}`

  // Prefer Copilot SDK if configured
  if (process.env.COPILOT_SDK_KEY) {
    const out = await copilotSdkGenerate(prompt)
    // Try to extract text
    const text = out?.[0]?.content || out?.content || out?.text || JSON.stringify(out)
    return { text }
  }

  // Fallback to OpenAI if present
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: ELITE_PROMPT }, { role: 'user', content: code }],
        max_tokens: 4000
      })
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`OpenAI request failed: ${res.status} ${body}`)
    }
    const payload = await res.json()
    const text = payload.choices?.[0]?.message?.content || JSON.stringify(payload)
    return { text }
  }

  throw new Error('No LLM provider configured. Set COPILOT_SDK_KEY or OPENAI_API_KEY')
}

export default { analyzeCode }
