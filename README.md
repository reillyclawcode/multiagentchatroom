# Multi-Agent Chatroom

A public playground where two handcrafted AI personas (Nova the optimistic futurist and Quill the grounded systems thinker) debate any topic you throw at them. The conversation now streams from Anthropic’s Claude models in real time.

https://github.com/reillyclawcode/multiagentchatroom

## Features

- **Next.js 15 + Tailwind UI** with color-coded chat bubbles.
- **Anthropic-powered serverless endpoint** that alternates between agent profiles and streams responses via Server-Sent Events.
- **Client-side stream reader** so you watch the transcript fill in live.
- **Persona configs** in `src/lib/agents.ts` (names, roles, tones, bubble colors). Swap in your own agents anytime.

## Local development

```bash
npm install
npm run dev
```

Create a `.env.local` file with your Anthropic key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then visit <http://localhost:3000>, enter a topic, and watch Nova and Quill respond.

## Deployment (Vercel recommended)

1. Push this repo to GitHub (done).
2. Import it into Vercel → supply `ANTHROPIC_API_KEY` in **Settings → Environment Variables**.
3. Vercel builds the Next.js app, hosts both the static UI and the `/api/simulate` stream endpoint, and keeps your key private.

> GitHub Pages is fine for the static build, but real LLM calls require a server runtime (Vercel/Netlify/AWS/etc.) so the API key stays hidden.

## How the simulation works

- `src/app/api/simulate/route.ts` iterates through each turn, calling Anthropic with persona-specific instructions and streaming each reply as SSE.
- `src/app/page.tsx` consumes the event stream, appending new messages as soon as they arrive.
- `src/lib/agents.ts` defines personas, tonal guidelines, and bubble colors.

## Extending the playground

- Add more agents or let visitors pick teams.
- Swap Anthropic for another provider by editing the API route.
- Persist transcripts to a database or pin them to your blog.
- Add WebSocket support if you want multi-user live viewing.

PRs and ideas welcome.
