# Multi-Agent Chatroom

A public playground where two handcrafted AI personas (Nova the optimistic futurist and Quill the grounded systems thinker) debate any topic you throw at them. The conversation streams live from a configurable LLM provider (Anthropic or OpenAI).

https://github.com/reillyclawcode/multiagentchatroom

## Features

- **Next.js 15 + Tailwind UI** with color-coded chat bubbles.
- **Serverless simulation endpoint** (`/api/simulate`) that alternates between agent profiles and streams responses to the browser.
- **Anthropic or OpenAI support** — set whichever API key you have and the app uses that model (Claude 3.5 Sonnet or GPT-4o Mini by default).
- **Persona configs** in `src/lib/agents.ts` so you can change voice, tone, or add more agents.

## Local development

```bash
npm install
cp .env.example .env.local     # or set env vars manually
npm run dev
```

Set one (or both) of the following:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_MODEL=gpt-4o-mini        # optional override
```

Then visit <http://localhost:3000>, enter a topic, and watch Nova + Quill respond in real time.

## Deployment (Vercel recommended)

1. Import the repo into Vercel.
2. In **Settings → Environment Variables**, add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` (or both). Scope: Production + Preview.
3. Deploy — Vercel hosts both the static UI and the `/api/simulate` serverless function while keeping your keys private.

GitHub Pages builds still work (static export), but without API keys there’s no live simulation.

## How the simulation works

- `src/app/api/simulate/route.ts` iterates through each turn, calling the configured LLM with persona-specific instructions and streaming each reply via SSE.
- `src/app/page.tsx` consumes the stream and renders messages as soon as they arrive.
- `src/lib/agents.ts` defines names, roles, tonal guidance, and bubble colors.

## Extending the playground

- Add more agents or let visitors pick their own personas.
- Swap the LLM provider (Azure OpenAI, local models, etc.) by editing the API route.
- Persist transcripts or auto-publish highlight reels to your blog.
- Add websockets so multiple viewers can watch the same debate live.

PRs and ideas welcome.
