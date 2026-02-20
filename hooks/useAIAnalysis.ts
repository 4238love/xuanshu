// AI分析Hook
import { useState, useCallback, useRef } from 'react';
import {
  AIMessage,
  AIAnalysisStatus,
  UseAIAnalysisReturn,
  AnalysisType,
  PaiPanSystem,
} from '@/types/ai';
import {
  getAIConfig,
  isAIConfigValid,
} from '@/lib/ai/config';
import { buildSystemPrompt } from '@/lib/ai/analysisPrompts';
import { QuickAnalysisOptions } from '@/types/ai';

const ROLE_CONSTRAINT_PROMPT = [
  '你现在就是一个专业的中国命理师，你只能以命理师的身份回答问题，不能提及任何关于AI、Kiro、编程、技术等与命理无关的内容。',
  '回答时必须优先依据提供的排盘数据，不得忽略排盘信息按通用逻辑泛答。',
  '回答结束后不要添加任何固定结束语。',
].join('');

function composeSystemPrompt(system?: PaiPanSystem, data?: unknown): string {
  if (!system || data === undefined || data === null) {
    return ROLE_CONSTRAINT_PROMPT;
  }

  try {
    const chartPrompt = buildSystemPrompt(system, data);
    return `${chartPrompt}\n\n${ROLE_CONSTRAINT_PROMPT}`;
  } catch (error) {
    console.warn('[AI分析] 构建排盘提示词失败，已降级为通用提示词', error);
    return ROLE_CONSTRAINT_PROMPT;
  }
}

export function useAIAnalysis(currentSystem?: PaiPanSystem, currentChartData?: unknown): UseAIAnalysisReturn {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [status, setStatus] = useState<AIAnalysisStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 生成消息ID
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 清除消息
  const clearMessages = useCallback(() => {
    setMessages([]);
    setStatus('idle');
    setError(null);
  }, []);

  // 发送消息（流式）
  const sendMessage = useCallback(async (content: string) => {
    const config = getAIConfig();

    if (!isAIConfigValid(config)) {
      setError('请先配置API Key和模型');
      setStatus('error');
      return;
    }

    // 创建用户消息
    const userMessage: AIMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // 添加用户消息
    setMessages(prev => [...prev, userMessage]);
    setStatus('analyzing');
    setError(null);

    // 创建助手消息（用于流式输出）
    const assistantMessage: AIMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    const systemPrompt = composeSystemPrompt(currentSystem, currentChartData);
    const historyMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content },
    ];

    try {
      // 创建AbortController用于取消请求
      abortControllerRef.current = new AbortController();

      // 使用代理API来避免CORS问题
      const response = await fetch(
        '/api/ai',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            baseURL: config.baseURL,
            apiKey: config.apiKey,
            model: config.model,
            messages: historyMessages,
            temperature: config.temperature ?? 0.7,
            maxTokens: config.maxTokens ?? 2000,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                fullContent += delta;
                // 更新最后一条助手消息
                setMessages(prev =>
                  prev.map((msg, idx) =>
                    idx === prev.length - 1
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      setStatus('completed');
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setStatus('idle');
          // 删除正在生成的消息
          setMessages(prev => prev.slice(0, -1));
        } else {
          setError(err.message);
          setStatus('error');
        }
      } else {
        setError('发生未知错误');
        setStatus('error');
      }
    }
  }, [currentChartData, currentSystem, messages]);

  // 发送快捷分析请求
  const sendQuickAnalysis = useCallback(async (
    type: AnalysisType,
    system: PaiPanSystem,
    data: unknown
  ) => {
    const config = getAIConfig();

    if (!isAIConfigValid(config)) {
      setError('请先配置API Key和模型');
      setStatus('error');
      return;
    }

    // 获取快捷分析选项
    const options = QuickAnalysisOptions[system];
    const option = options.find(o => o.id === type);

    if (!option) {
      setError('未找到该分析类型');
      setStatus('error');
      return;
    }

    // 构建系统提示词和用户消息
    const systemPrompt = composeSystemPrompt(system, data);
    const userContent = option.prompt || '请结合当前排盘进行分析。';

    setStatus('analyzing');
    setError(null);

    // 创建助手消息（用于流式输出）
    const assistantMessage: AIMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userContent },
    ];

    try {
      // 创建AbortController用于取消请求
      abortControllerRef.current = new AbortController();

      // 使用代理API来避免CORS问题
      const response = await fetch(
        '/api/ai',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            baseURL: config.baseURL,
            apiKey: config.apiKey,
            model: config.model,
            messages: allMessages,
            temperature: config.temperature ?? 0.7,
            maxTokens: config.maxTokens ?? 2000,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                fullContent += delta;
                // 更新最后一条助手消息
                setMessages(prev =>
                  prev.map((msg, idx) =>
                    idx === prev.length - 1
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      setStatus('completed');
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setStatus('idle');
          // 删除正在生成的消息
          setMessages(prev => prev.slice(0, -1));
        } else {
          setError(err.message);
          setStatus('error');
        }
      } else {
        setError('发生未知错误');
        setStatus('error');
      }
    }
  }, [messages]);

  return {
    messages,
    status,
    error,
    sendMessage,
    sendQuickAnalysis,
    clearMessages,
  };
}
