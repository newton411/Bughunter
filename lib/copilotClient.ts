import ELITE_PROMPT from './elitePrompt'

type AnalyzeResult = { text: string }

export async function analyzeCode(code: string, language = 'solidity'): Promise<AnalyzeResult> {
  const copilotBase = process.env.COPILOT_SDK_BASE_URL
  const copilotKey = process.env.COPILOT_SDK_KEY

  const prompt = `${ELITE_PROMPT}\n\nUser code (language=${language}):\n${code}`

  if (copilotBase && copilotKey) {
    const res = await fetch(`${copilotBase.replace(/\/$/, '')}/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${copilotKey}`
      },
      body: JSON.stringify({ model: 'elite-bughunter', input: prompt })
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Copilot SDK request failed: ${res.status} ${body}`)
    }

    const payload = await res.json()
    // Normalize common shapes from SDK responses
    const text = payload.output?.[0]?.content || payload.text || JSON.stringify(payload)
    return { text }
  }

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
        messages: [
          { role: 'system', content: ELITE_PROMPT },
          { role: 'user', content: code }
        ],
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

  throw new Error('No LLM provider configured. Set COPILOT_SDK_BASE_URL+COPILOT_SDK_KEY or OPENAI_API_KEY')
}

export default { analyzeCode }
