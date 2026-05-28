# BugHunter AI / EliteBugHunter

This repository contains a starter scaffold for BugHunter AI — an EliteBugHunter smart contract security auditing web application.

Overview:
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase placeholder for Auth/Storage
- Monaco editor placeholder
- EliteBugHunter system prompt in `lib/elitePrompt.ts`

Getting started (local):

1. Install dependencies

```bash
cd /workspaces/Bughunter
npm install
```

2. Add environment variables (example `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Provider keys for LLM/Copilot or LangGraph
OPENAI_API_KEY=...
COPILOT_SDK_KEY=...
```

If you have a Copilot SDK endpoint (self-hosted LangGraph or Copilot SDK gateway), add:

```
COPILOT_SDK_BASE_URL=https://your-copilot-gateway.example.com
COPILOT_SDK_KEY=your-copilot-key
```

3. Run development server

```bash
npm run dev
```

Notes:
- The API route at `app/api/agent/route.ts` is a stub; integrate an LLM provider or Copilot SDK.
- `components/MonacoEditor.tsx` is a textarea placeholder for easier local startup. Replace with Monaco dynamic import.
- See the `lib/elitePrompt.ts` file for the full EliteBugHunter agent system prompt — this will be used as the agent's main instruction.

Next steps:
- Integrate CopilotKit UI components and the Copilot SDK or LangGraph backend.
- Implement Supabase Auth flows and database models for reports/history.
- Add report generation and PDF export.
- Harden backend agent execution and sandbox PoCs safely.

CopilotKit integration
---------------------

This scaffold includes a basic CopilotKit UI fallback at `components/CopilotKitUI.tsx` and an agent page at `app/agent/page.tsx`.

To enable a full CopilotKit integration:

1. Install and configure the official CopilotKit package (if available) and add any required styles.
2. Provide `COPILOT_SDK_BASE_URL` and `COPILOT_SDK_KEY` (or configure LangGraph) so server-side calls via `lib/copilotClient.ts` reach your LLM gateway.
3. Replace the placeholder UI in `components/CopilotKitUI.tsx` with real CopilotKit components and wiring.

Note: For streaming responses, implement server-side streaming endpoints and client handling in the CopilotKit UI.
# Bughunter