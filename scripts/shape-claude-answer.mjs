const TOKENS_PER_CHARACTER = 0.25;
const SENT_TOKENS = 1200;

export function describeMessage(recordedReply, model) {
  const content = recordedReply.content.map(writeOutputAsText);
  const writtenCharacters = content.reduce((sum, block) => sum + block.text.length, 0);
  return {
    id: 'msg_recorded',
    stop_sequence: null,
    ...recordedReply,
    model,
    content,
    usage: { input_tokens: SENT_TOKENS, output_tokens: Math.ceil(writtenCharacters * TOKENS_PER_CHARACTER) },
  };
}

export function listStreamEvents(message) {
  const { content, stop_reason, stop_sequence, stop_details, usage, ...opening } = message;
  const unfinished = { ...opening, content: [], stop_reason: null, stop_sequence: null };
  const ending = { stop_reason, stop_sequence, ...(stop_details ? { stop_details } : {}) };
  return [
    { type: 'message_start', message: { ...unfinished, usage: { ...usage, output_tokens: 0 } } },
    ...content.flatMap(listBlockEvents),
    { type: 'message_delta', delta: ending, usage: { output_tokens: usage.output_tokens } },
    { type: 'message_stop' },
  ];
}

function writeOutputAsText(block) {
  return typeof block.text === 'string' ? block : { ...block, text: JSON.stringify(block.text) };
}

function listBlockEvents(block, index) {
  return [
    { type: 'content_block_start', index, content_block: { ...block, text: '' } },
    { type: 'content_block_delta', index, delta: { type: 'text_delta', text: block.text } },
    { type: 'content_block_stop', index },
  ];
}
