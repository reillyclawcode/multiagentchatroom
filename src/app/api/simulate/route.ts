import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { agents } from "@/lib/agents";
import type { ConversationMessage } from "@/lib/generator";

const ANTHROPIC_MODEL = "claude-3-5-sonnet-20241022";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const MAX_TURNS = 20;
const MIN_TURNS = 4;

const anthropicClient = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function ensureProvider() {
  if (!anthropicClient && !openaiClient) {
    throw new Error("No LLM provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.");
  }
}

function buildHistoryMarkdown(history: ConversationMessage[]) {
  if (history.length === 0) return "(no prior messages)";
  return history
    .map((message) => `**${message.author.name}:** ${message.content}`)
    .join("\n");
}

async function runAnthropic(prompt: string) {
  if (!anthropicClient) {
    throw new Error("Anthropic client not configured");
  }
  const result = await anthropicClient.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 250,
    temperature: 0.7,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return result.content
    .filter((item) => item.type === "text")
    .map((item) => (item as Anthropic.Messages.TextBlock).text)
    .join(" ")
    .trim();
}

async function runOpenAI(prompt: string, agentSystemPrompt: string) {
  if (!openaiClient) {
    throw new Error("OpenAI client not configured");
  }

  const completion = await openaiClient.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.7,
    messages: [
      { role: "system", content: agentSystemPrompt },
      { role: "user", content: prompt }
    ]
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error("OpenAI response missing content");
  }
  return text.trim();
}

export async function POST(request: NextRequest) {
  try {
    ensureProvider();
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }

  const payload = await request.json().catch(() => ({}));
  const topic = typeof payload.topic === "string" && payload.topic.trim().length > 0
    ? payload.topic.trim()
    : "How should society steer frontier AI?";
  const turnsInput = Number(payload.turns);
  const turns = Number.isFinite(turnsInput)
    ? Math.min(Math.max(MIN_TURNS, turnsInput), MAX_TURNS)
    : 8;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const history: ConversationMessage[] = [];

      for (let i = 0; i < turns; i += 1) {
        const agent = agents[i % agents.length];
        const prompt = `Topic: ${topic}\n\nConversation so far:\n${buildHistoryMarkdown(history)}\n\nGuidelines for ${agent.name}:\n- Reply in under 90 words.\n- Stay in first person.\n- Reference the topic explicitly.\n- End with a forward-looking suggestion or concern.\n- Adopt your verbal style and tics.\n- Do not invent the other agent’s lines.`;

        const systemPrompt = `You are ${agent.name} (${agent.role}). ${agent.persona}`;

        try {
          let content: string;
          if (openaiClient) {
            content = await runOpenAI(prompt, systemPrompt);
          } else {
            content = await runAnthropic(`${systemPrompt}\n\n${prompt}`);
          }

          const message: ConversationMessage = {
            id: `${agent.id}-${history.length}`,
            author: agent,
            content,
            timestamp: new Date().toISOString()
          };

          history.push(message);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          );
        } catch (error) {
          console.error("LLM error", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "LLM call failed", details: String(error) })}\n\n`
            )
          );
          break;
        }
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
