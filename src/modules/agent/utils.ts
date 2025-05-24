import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { GptRoles } from 'modules/constants';

export const isToolCall = (message?: ChatCompletionMessageParam): boolean => {
  if (!message) {
    return false;
  }
  const result = message.role === GptRoles.ASSISTANT && message.tool_calls && message.tool_calls.length > 0;
  return result || false;
};

export const isTool = (message?: ChatCompletionMessageParam): boolean => {
  if (!message) {
    return false;
  }
  return message.role === GptRoles.TOOL;
};
