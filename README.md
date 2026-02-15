# Multi-Agent Chatroom

A public playground where two handcrafted AI personas (Nova the optimistic futurist and Quill the grounded systems thinker) debate any topic you throw at them. The conversation runs locally—no external APIs—so you can study the orchestration layer, then swap in your own LLM calls or additional agents.

https://github.com/reillyclawcode/multiagentchatroom

## Features

- **Next.js 15 + App Router** with Tailwind styling .
- **Server simulation endpoint** (`/api/simulate`) that alternates between agent profiles and returns a full transcript.
- **Front-end control panel** to set the topic and number of turns (4–20) and watch the conversation populate in real time.
- **Extensible agent definitions** (`src/lib/agents.ts`) so you can remix personas, add more speakers, or connect to actual LLM APIs later.

## Local development

```bash
npm install
npm run dev
```

Visit <http://localhost:3000> and drop in any topic (e.g., "Should cities run open-source AI models?") to watch the agents respond.

## How it works

- `src/app/api/simulate/route.ts` receives your topic + turn count and iteratively calls `generateTurn` to build a transcript.
- `src/lib/agents.ts` defines each persona’s name, role, and verbal tics.
- `src/lib/generator.ts` stitches together connective phrases so the chat feels coherent even without a real LLM.
- The client page (`src/app/page.tsx`) fetches transcripts and renders them as chat bubbles with timestamps.

## Extending the playground

- Swap the `generateTurn` logic with OpenAI/Anthropic calls (streaming works great with Server Sent Events).
- Add more agents or let visitors pick teams (policy maker vs. engineer, etc.).
- Persist transcripts to a database so viewers can replay their favorite debates.
- Deploy to Vercel/Netlify and share the link so anyone can watch the bots banter.

PRs and ideas welcome.
