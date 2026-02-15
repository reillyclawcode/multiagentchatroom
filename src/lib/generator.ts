import { AgentProfile, agents } from "@/lib/agents";

const connectivePhrases = [
  "Building on that",
  "Here’s the twist",
  "The overlooked part",
  "On the ground",
  "Zooming in"
];

const callToAction = [
  "let’s prototype this",
  "we need shared governance",
  "someone should publish the spec",
  "pair it with civic dividends",
  "document the failure modes"
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const topicHooks: Record<string, string[]> = {
  default: [
    "AI feels abstract until it touches paychecks and public services.",
    "Every breakthrough lowers the cost of prediction and coordination.",
    "We keep rediscovering that tooling is easy—governance is harder.",
    "The interesting fight is about who captures the upside.",
    "Multiplying copilots means multiplying accountability layers."
  ]
};

export type ConversationMessage = {
  id: string;
  author: AgentProfile;
  content: string;
  timestamp: string;
};

export function generateTurn(
  turnIndex: number,
  topic: string,
  history: ConversationMessage[]
): ConversationMessage {
  const agent = agents[turnIndex % agents.length];
  const lastMessage = history.at(-1);
  const hookSource = topicHooks.default;

  const intro = lastMessage
    ? `${randomItem(connectivePhrases)}, ${agent.verbalTics[0].toLowerCase()} ${topic.toLowerCase()}`
    : `${randomItem(agent.verbalTics)} ${topic.toLowerCase()}`;

  const body = randomItem(hookSource);
  const outro = `${randomItem(connectivePhrases)}—${randomItem(callToAction)}.`;

  const content = [intro, body, outro]
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .join(" ");

  return {
    id: `${agent.id}-${turnIndex}`,
    author: agent,
    content,
    timestamp: new Date().toISOString()
  };
}
