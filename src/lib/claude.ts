import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from '@/config/constants';

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY');
  _client = new Anthropic({ apiKey });
  return _client;
}

export interface ClaudeCallOptions {
  system: string;
  user: string;
  maxTokens?: number;
}

/**
 * Calls Claude and returns the raw text of the first content block.
 * Throws if the response is empty or not a text block.
 */
export async function callClaude(opts: ClaudeCallOptions): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: opts.maxTokens ?? 4096,
    system: opts.system,
    messages: [{ role: 'user', content: opts.user }],
  });

  const block = response.content[0];
  if (!block || block.type !== 'text') {
    throw new Error('Claude returned no text content');
  }
  return block.text;
}
