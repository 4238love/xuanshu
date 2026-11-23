import { useCallback, useRef, useState } from 'react';
import {
  AIConfig,
  AIConfigMode,
  AIMessage,
  AIAnalysisStatus,
  AnalysisType,
  PaiPanSystem,
  QuickAnalysisOptions,
  UseAIAnalysisReturn,
} from '@/types/ai';
import { assertAIProxyAvailable } from '@/lib/ai/staticDemo';
import {
  buildAIProxyRequestBody,
  extractContentFromResponse,
  getAIConfig,
  getAIConfigMode,
  getAIResponseValidationError,
  isAIConfigValid,
  shouldUseStreamingAIProxy,
} from '@/lib/ai/config';
import { buildSystemPrompt } from '@/lib/ai/analysisPrompts';
import {
  hasIncompleteStructuredTail,
  isAbortError,
  shouldRetryWithoutStreaming,
} from '@/lib/ai/transport';

type ChatMessagePayload = {
  role: AIMessage['role'];
  content: string;
};

type StreamReadResult = {
  fullContent: string;
  finishReason: string | null;
  sawDone: boolean;
};

type StreamRequestInput = {
  config: AIConfig;
  mode: AIConfigMode;
  messages: ChatMessagePayload[];
  signal: AbortSignal;
  onContent: (content: string) => void;
};

type CompletionRequestInput = Omit<StreamRequestInput, 'onContent'>;

const ROLE_CONSTRAINT_PROMPT = [
  '你现在就是一位专业的中国命理师，只能以命理师身份回答问题，不要提及任何 AI、编程、模型或技术实现。',
  '回答时必须优先依据提供的排盘数据，不得脱离盘面泛泛而谈。',
  '回答结束后不要附加固定的免责声明或模板化收尾。',
].join('');

const AUTO_CONTINUE_PROMPT =
  '继续上一段未完成的内容，从中断处接着写，把当前结构和剩余要点全部写完后再结束，不要重复已经输出的内容。';
const TRUNCATION_NOTICE = '\n\n[当前回复已触发模型长度限制，可继续追问“继续”获取剩余内容。]';
const TRUNCATION_FINISH_REASONS = new Set(['length', 'max_tokens']);
const MAX_AUTO_CONTINUE_ATTEMPTS = 6;

function composeSystemPrompt(system?: PaiPanSystem, data?: unknown): string {
  if (!system || data === undefined || data === null) {
    return ROLE_CONSTRAINT_PROMPT;
  }

  try {
    const chartPrompt = buildSystemPrompt(system, data);
    return `${chartPrompt}\n\n${ROLE_CONSTRAINT_PROMPT}`;
  } catch (error) {
    console.warn('[AI分析] 构建排盘提示词失败，已降级为通用提示词。', error);
    return ROLE_CONSTRAINT_PROMPT;
  }
}

function extractDeltaAndFinishReason(parsed: unknown): {
  delta: string;
  finishReason: string | null;
} {
  if (!parsed || typeof parsed !== 'object') {
    return { delta: '', finishReason: null };
  }

  const choices = (parsed as Record<string, unknown>).choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    return { delta: '', finishReason: null };
  }

  const choice = choices[0];
  if (!choice || typeof choice !== 'object') {
    return { delta: '', finishReason: null };
  }

  const choiceRecord = choice as Record<string, unknown>;
  const finishReason =
    typeof choiceRecord.finish_reason === 'string' ? choiceRecord.finish_reason : null;

  const deltaRecord =
    choiceRecord.delta && typeof choiceRecord.delta === 'object'
      ? (choiceRecord.delta as Record<string, unknown>)
      : null;

  if (!deltaRecord) {
    return { delta: '', finishReason };
  }

  const content = deltaRecord.content;

  if (typeof content === 'string') {
    return { delta: content, finishReason };
  }

  if (Array.isArray(content)) {
    const delta = content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (part && typeof part === 'object') {
          const text = (part as Record<string, unknown>).text;
          return typeof text === 'string' ? text : '';
        }

        return '';
      })
      .join('');

    return { delta, finishReason };
  }

  return { delta: '', finishReason };
}

function extractEventData(rawEvent: string): string | null {
  const dataLines = rawEvent
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart());

  if (dataLines.length === 0) {
    return null;
  }

  return dataLines.join('\n');
}

function isTruncatedFinishReason(finishReason: string | null): boolean {
  return finishReason ? TRUNCATION_FINISH_REASONS.has(finishReason) : false;
}

function shouldContinueStream(result: StreamReadResult): boolean {
  if (isTruncatedFinishReason(result.finishReason)) {
    return true;
  }

  if (hasIncompleteStructuredTail(result.fullContent)) {
    return true;
  }

  return !result.sawDone && !result.finishReason && result.fullContent.trim().length > 0;
}

async function completeNonStreamingReply({
  config,
  mode,
  messages,
  signal,
}: CompletionRequestInput): Promise<string> {
  let accumulatedContent = '';
  let requestMessages = [...messages];

  for (let attempt = 0; attempt <= MAX_AUTO_CONTINUE_ATTEMPTS; attempt += 1) {
    const segment = await requestNonStreamingChatCompletion({
      config,
      mode,
      messages: requestMessages,
      signal,
    });

    accumulatedContent += segment;

    if (!hasIncompleteStructuredTail(accumulatedContent) || attempt === MAX_AUTO_CONTINUE_ATTEMPTS) {
      break;
    }

    requestMessages = [
      ...requestMessages,
      { role: 'assistant', content: accumulatedContent },
      { role: 'user', content: AUTO_CONTINUE_PROMPT },
    ];
  }

  if (accumulatedContent.trim() && hasIncompleteStructuredTail(accumulatedContent)) {
    return `${accumulatedContent}${TRUNCATION_NOTICE}`;
  }

  return accumulatedContent;
}

async function readStreamingChatResponse(
  response: Response,
  onContent: (content: string) => void
): Promise<StreamReadResult> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('无法读取响应流');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';
  let finishReason: string | null = null;
  let sawDone = false;

  const consumeEvent = (rawEvent: string) => {
    const data = extractEventData(rawEvent);
    if (!data) {
      return;
    }

    if (data === '[DONE]') {
      sawDone = true;
      return;
    }

    try {
      const parsed = JSON.parse(data);
      const eventResult = extractDeltaAndFinishReason(parsed);

      if (eventResult.delta) {
        fullContent += eventResult.delta;
        onContent(fullContent);
      }

      if (eventResult.finishReason) {
        finishReason = eventResult.finishReason;
      }
    } catch (error) {
      console.warn('[AI分析] 解析流式事件失败，已忽略该事件。', {
        error,
        dataPreview: data.slice(0, 200),
      });
    }
  };

  while (true) {
    const { done, value } = await reader.read();

    if (value) {
      buffer += decoder.decode(value, { stream: !done });
    }

    const events = buffer.split(/\n\n|\r\n\r\n/);
    buffer = events.pop() ?? '';

    for (const event of events) {
      consumeEvent(event);
    }

    if (done) {
      buffer += decoder.decode();
      break;
    }
  }

  const trailingEvent = buffer.trim();
  if (trailingEvent) {
    consumeEvent(trailingEvent);
  }

  return { fullContent, finishReason, sawDone };
}

async function requestStreamingChatCompletion({
  config,
  mode,
  messages,
  signal,
  onContent,
}: StreamRequestInput): Promise<StreamReadResult> {
  assertAIProxyAvailable();

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      buildAIProxyRequestBody({
        mode,
        config,
        messages,
        temperature: mode === 'official' ? undefined : config.temperature ?? 0.7,
        maxTokens: mode === 'official' ? undefined : config.maxTokens,
        stream: true,
      })
    ),
    signal,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const errorMessage =
      (typeof errorData.error === 'string' ? errorData.error : null) ??
      (typeof errorData.message === 'string' ? errorData.message : null) ??
      `请求失败: ${response.status}`;
    throw new Error(errorMessage);
  }

  return readStreamingChatResponse(response, onContent);
}

async function requestNonStreamingChatCompletion({
  config,
  mode,
  messages,
  signal,
}: CompletionRequestInput): Promise<string> {
  assertAIProxyAvailable();

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      buildAIProxyRequestBody({
        mode,
        config,
        messages,
        temperature: mode === 'official' ? undefined : config.temperature ?? 0.7,
        maxTokens: mode === 'official' ? undefined : config.maxTokens,
        stream: false,
      })
    ),
    signal,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const errorMessage =
      (typeof errorData.error === 'string' ? errorData.error : null) ??
      (typeof errorData.message === 'string' ? errorData.message : null) ??
      `\u8bf7\u6c42\u5931\u8d25: ${response.status}`;
    throw new Error(errorMessage);
  }

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return extractContentFromResponse(config, data);
}

async function streamAssistantReply({
  config,
  mode,
  messages,
  signal,
  onContent,
}: StreamRequestInput): Promise<StreamReadResult> {
  let accumulatedContent = '';
  let finishReason: string | null = null;
  let sawDone = false;
  let requestMessages = [...messages];

  for (let attempt = 0; attempt <= MAX_AUTO_CONTINUE_ATTEMPTS; attempt += 1) {
    const segment = await requestStreamingChatCompletion({
      config,
      mode,
      messages: requestMessages,
      signal,
      onContent: (segmentContent) => {
        onContent(accumulatedContent + segmentContent);
      },
    });

    accumulatedContent += segment.fullContent;
    finishReason = segment.finishReason;
    sawDone = segment.sawDone;

    if (!shouldContinueStream(segment) || attempt === MAX_AUTO_CONTINUE_ATTEMPTS) {
      break;
    }

    requestMessages = [
      ...requestMessages,
      { role: 'assistant', content: accumulatedContent },
      { role: 'user', content: AUTO_CONTINUE_PROMPT },
    ];
  }

  if (
    accumulatedContent.trim() &&
    (isTruncatedFinishReason(finishReason) ||
      (!sawDone && !finishReason) ||
      hasIncompleteStructuredTail(accumulatedContent))
  ) {
    accumulatedContent = `${accumulatedContent}${TRUNCATION_NOTICE}`;
    onContent(accumulatedContent);
  }

  return {
    fullContent: accumulatedContent,
    finishReason,
    sawDone,
  };
}

export function useAIAnalysis(
  currentSystem?: PaiPanSystem,
  currentChartData?: unknown
): UseAIAnalysisReturn {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [status, setStatus] = useState<AIAnalysisStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStatus('idle');
    setError(null);
  }, []);

  const updateAssistantMessage = useCallback((messageId: string, content: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId ? { ...message, content } : message
      )
    );
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== messageId));
  }, []);

  const runAnalysisRequest = useCallback(
    async (
      config: AIConfig,
      mode: AIConfigMode,
      requestMessages: ChatMessagePayload[],
      assistantMessageId: string
    ) => {
      try {
        abortControllerRef.current = new AbortController();
        let fullContent = '';

        if (shouldUseStreamingAIProxy(config, mode)) {
          try {
            const result = await streamAssistantReply({
              config,
              mode,
              messages: requestMessages,
              signal: abortControllerRef.current.signal,
              onContent: (content) => {
                updateAssistantMessage(assistantMessageId, content);
              },
            });

            if (result.fullContent.trim()) {
              fullContent = result.fullContent;
            } else {
              console.warn(
                '[AI analysis] Empty streaming response received; retrying without streaming.'
              );
              fullContent = await completeNonStreamingReply({
                config,
                mode,
                messages: requestMessages,
                signal: abortControllerRef.current.signal,
              });
              updateAssistantMessage(assistantMessageId, fullContent);
            }
          } catch (streamError) {
            if (!shouldRetryWithoutStreaming(streamError)) {
              throw streamError;
            }

            console.warn(
              '[AI analysis] Streaming transport failed; retrying without streaming.',
              streamError
            );
            fullContent = await completeNonStreamingReply({
              config,
              mode,
              messages: requestMessages,
              signal: abortControllerRef.current.signal,
            });
            updateAssistantMessage(assistantMessageId, fullContent);
          }
        } else {
          fullContent = await completeNonStreamingReply({
            config,
            mode,
            messages: requestMessages,
            signal: abortControllerRef.current.signal,
          });
          updateAssistantMessage(assistantMessageId, fullContent);
        }

        const validationError = getAIResponseValidationError(fullContent);
        if (validationError) {
          removeMessage(assistantMessageId);
          setError(validationError);
          setStatus('error');
          return;
        }

        setStatus('completed');
      } catch (err) {
        if (err instanceof Error) {
          if (isAbortError(err)) {
            setStatus('idle');
            removeMessage(assistantMessageId);
          } else {
            setError(err.message);
            setStatus('error');
          }
        } else {
          setError('发生未知错误');
          setStatus('error');
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [removeMessage, updateAssistantMessage]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const config = getAIConfig();
      const mode = getAIConfigMode();

      if (!isAIConfigValid(config, mode)) {
        setError('请先配置自定义 API 的 Key、地址和模型');
        setStatus('error');
        return;
      }

      const userMessage: AIMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      const assistantMessage: AIMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setStatus('analyzing');
      setError(null);

      const requestMessages: ChatMessagePayload[] = [
        {
          role: 'system',
          content: composeSystemPrompt(currentSystem, currentChartData),
        },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        { role: 'user', content },
      ];

      await runAnalysisRequest(config, mode, requestMessages, assistantMessage.id);
    },
    [currentChartData, currentSystem, messages, runAnalysisRequest]
  );

  const sendQuickAnalysis = useCallback(
    async (type: AnalysisType, system: PaiPanSystem, data: unknown) => {
      const config = getAIConfig();
      const mode = getAIConfigMode();

      if (!isAIConfigValid(config, mode)) {
        setError('请先配置自定义 API 的 Key、地址和模型');
        setStatus('error');
        return;
      }

      const options = QuickAnalysisOptions[system];
      const option = options.find((item) => item.id === type);

      if (!option) {
        setError('未找到该分析类型');
        setStatus('error');
        return;
      }

      const assistantMessage: AIMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      setStatus('analyzing');
      setError(null);
      setMessages((prev) => [...prev, assistantMessage]);

      const requestMessages: ChatMessagePayload[] = [
        {
          role: 'system',
          content: composeSystemPrompt(system, data),
        },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        {
          role: 'user',
          content: option.prompt || '请结合当前排盘进行分析。',
        },
      ];

      await runAnalysisRequest(config, mode, requestMessages, assistantMessage.id);
    },
    [messages, runAnalysisRequest]
  );

  return {
    messages,
    status,
    error,
    sendMessage,
    sendQuickAnalysis,
    clearMessages,
  };
}
