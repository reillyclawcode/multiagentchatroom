import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { agents } from "@/lib/agents";
import type { ConversationMessage } from "@/lib/generator";

const MODEL = "claude-3-5-sonnet-20241022";
const MAX_TURNS = 20;
const MIN_TURNS = 4;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

function buildHistoryMarkdown(history: ConversationMessage[]) {
  if (history.length === 0) return "(no prior messages)";
  return history
    .map((message) => `**${message.author.name}:** ${message.content}`)
    .join("\n");
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Missing ANTHROPIC_API_KEY server env" },
      { status: 500 }
    );
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
        const prompt = `Topic: ${topic}\n\nConversation so far:\n${buildHistoryMarkdown(history)}\n\nYou are ${agent.name} (${agent.role}). ${agent.persona}\n\nGuidelines:\n- Reply in under 90 words.\n- Stay in first person.\n- Reference the topic explicitly.\n- End with a forward-looking suggestion or concern.\n- Adopt your verbal style and tics.\n- Do not invent the other agent’s lines.`;

        try {
          const completion = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 250,
            temperature: 0.7,
            messages: [
              {
                role: "user",
                content: prompt
              }
            ]
          });

          const text = completion.content
            .filter((item) => item.type === "text")
            .map((item) => (item as Anthropic.Messages.TextBlock).text)
            .join(" ")
            .trim();

          const message: ConversationMessage = {
            id: `${agent.id}-${history.length}`,
            author: agent,
            content: text,
            timestamp: new Date().toISOString()
          };

          history.push(message);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          );
        } catch (error) {
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
