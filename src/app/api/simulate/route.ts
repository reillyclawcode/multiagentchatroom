import { NextRequest, NextResponse } from "next/server";
import { generateTurn } from "@/lib/generator";
import type { ConversationMessage } from "@/lib/generator";

export async function POST(request: NextRequest) {
  const data = await request.json().catch(() => ({}));
  const topic = typeof data.topic === "string" && data.topic.trim().length > 0 ? data.topic.trim() : "the future of AI and society";
  const turnsInput = Number(data.turns);
  const turns = Number.isFinite(turnsInput) ? Math.min(Math.max(4, turnsInput), 20) : 8;

  const messages: ConversationMessage[] = [];

  for (let i = 0; i < turns; i += 1) {
    const message = generateTurn(i, topic, messages);
    messages.push(message);
  }

  return NextResponse.json({ topic, turns, messages });
}
