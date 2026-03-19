'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AIAnalysisStatus, AIMessage } from '@/types/ai';
import AnalysisResult from './AnalysisResult';

interface AIChatWindowProps {
  messages: AIMessage[];
  status: AIAnalysisStatus;
  error: string | null;
  systemLabel: string;
  isConfigValid: boolean;
  onOpenSettings: () => void;
  onSendMessage: (message: string) => void;
  onClear: () => void;
}

const SERIF_STYLE = {
  fontFamily:
    '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Baskerville, "Songti SC", "STSong", serif',
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export default function AIChatWindow({
  messages,
  status,
  error,
  systemLabel,
  isConfigValid,
  onOpenSettings,
  onSendMessage,
  onClear,
}: AIChatWindowProps) {
  const [input, setInput] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousMessageCountRef = useRef(0);
  const stickToBottomRef = useRef(true);

  const updateStickToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    stickToBottomRef.current = distanceToBottom < 88;
  }, []);

  useEffect(() => {
    updateStickToBottom();
  }, [updateStickToBottom]);

  useEffect(() => {
    const endMarker = messagesEndRef.current;
    if (!endMarker) return;

    const hasNewMessage = messages.length > previousMessageCountRef.current;
    previousMessageCountRef.current = messages.length;

    if (hasNewMessage) {
      stickToBottomRef.current = true;
    }

    if (!stickToBottomRef.current && !hasNewMessage) {
      return;
    }

    const behavior: ScrollBehavior =
      hasNewMessage && status !== 'analyzing' ? 'smooth' : 'auto';

    window.requestAnimationFrame(() => {
      endMarker.scrollIntoView({ behavior, block: 'end' });
    });
  }, [messages, status, error]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);

  const handleSend = () => {
    if (!isConfigValid) {
      onOpenSettings();
      return;
    }

    if (input.trim() && status !== 'analyzing') {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    if (!isConfigValid) {
      onOpenSettings();
      return;
    }

    if (status === 'analyzing') {
      return;
    }

    onSendMessage(suggestion);
  };

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const latestAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant')?.id;

  const emptySuggestions = [
    `${systemLabel}里最需要优先看的主线是什么？`,
    '如果只看未来三年，重点该防什么、抓什么？',
    '把结论整理成三条短建议，适合直接阅读。',
    '哪些判断最确定，哪些部分需要保守看待？',
  ];

  const inputDisabled = status === 'analyzing' || !isConfigValid;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(255,223,173,0.12),transparent_24%),linear-gradient(180deg,rgba(255,251,246,0.65),rgba(244,237,227,0.48))] px-4 py-3 sm:px-5"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={status === 'analyzing'}
        onScroll={updateStickToBottom}
      >
        {messages.length === 0 ? (
          <div className="mx-auto max-w-[440px] rounded-[28px] border border-[rgba(114,76,37,0.12)] bg-[rgba(255,250,242,0.86)] p-5 shadow-[0_24px_48px_-30px_rgba(61,37,15,0.35)]">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#4a2d19] text-white shadow-[0_16px_30px_-20px_rgba(74,45,25,0.7)]">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>

              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.32em] text-[#8a6239]">起笔建议</div>
                <h3 className="mt-2 text-[1.3rem] font-semibold tracking-[0.08em] text-[#2f2118]" style={SERIF_STYLE}>
                  {systemLabel}批注室
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#6f5e51]">
                  可以先点上方专题，也可以直接补问更细的问题，让结果区多一层可追问的命理批注。
                </p>
              </div>
            </div>

            {!isConfigValid ? (
              <div className="mt-4 rounded-[20px] border border-amber-300 bg-amber-50/90 p-4">
                <div className="text-sm font-medium text-amber-900">当前未配置可用接口</div>
                <p className="mt-1 text-xs leading-6 text-amber-800">
                  先完成官方接口检测，或填写自定义模型配置，再开始对话。
                </p>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="mt-3 rounded-full border border-amber-300 bg-white/90 px-3 py-1.5 text-xs text-amber-900 transition hover:bg-white"
                >
                  前往设置
                </button>
              </div>
            ) : null}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {emptySuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  disabled={inputDisabled}
                  className="rounded-[18px] border border-[rgba(117,76,40,0.12)] bg-white/75 px-4 py-3 text-left transition hover:border-[#a27140] hover:bg-[#fff7ed] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[#8a6239]">可直接提问</div>
                  <div className="mt-2 text-sm leading-7 text-[#4a3423]">{suggestion}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isStreaming =
                status === 'analyzing' && message.id === latestAssistantMessageId;

              return (
                <div
                  key={message.id}
                  className={cx('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {message.role === 'user' ? (
                    <div className="max-w-[92%] rounded-[26px] border border-[#4a2d19]/10 bg-[linear-gradient(135deg,#3c2416,#5a351a_58%,#8a572a)] px-4 py-3 text-white shadow-[0_22px_44px_-30px_rgba(74,45,25,0.75)] sm:max-w-[88%]">
                      <div className="whitespace-pre-wrap break-words text-sm leading-7">
                        {message.content}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-white/70">
                        <span className="uppercase tracking-[0.24em]">用户提问</span>
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[95%] rounded-[28px] border border-[rgba(114,76,37,0.12)] bg-[rgba(255,250,242,0.9)] px-4 py-4 shadow-[0_24px_46px_-32px_rgba(61,37,15,0.35)] sm:max-w-[92%] sm:px-5">
                      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[rgba(117,76,40,0.12)] pb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[#4a2d19] text-sm font-semibold text-white shadow-[0_12px_20px_-16px_rgba(74,45,25,0.72)]">
                            AI
                          </span>
                          <div>
                            <div className="text-[10px] uppercase tracking-[0.24em] text-[#8a6239]">AI 解读</div>
                            <div className="mt-1 text-sm font-medium text-[#4a3423]">
                              {isStreaming ? '正在推演当前专题' : '已生成批注'}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-[#8b7661]">{formatTime(message.timestamp)}</div>
                      </div>

                      <AnalysisResult content={message.content} isStreaming={isStreaming} />
                    </div>
                  )}
                </div>
              );
            })}

            {error ? (
              <div className="flex justify-start">
                <div className="max-w-[95%] rounded-[24px] border border-red-200 bg-[#fff6f2] px-4 py-3 text-red-700 shadow-[0_18px_34px_-28px_rgba(140,58,35,0.28)]">
                  <div className="text-sm font-medium">本次批注未能完成</div>
                  <div className="mt-1 text-sm leading-7">{error}</div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[rgba(117,76,40,0.14)] bg-[linear-gradient(180deg,rgba(255,250,245,0.92),rgba(246,239,229,0.96))] px-4 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-3 sm:px-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-[#8b7661]">
          <span>{status === 'analyzing' ? '正在推演，请稍候…' : '回车发送，Shift + Enter 换行'}</span>
          {messages.length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="rounded-full border border-[rgba(117,76,40,0.14)] bg-white/80 px-3 py-1.5 text-[#5b4430] transition hover:border-[#a27140] hover:bg-[#fff7ed]"
            >
              清空对话
            </button>
          ) : null}
        </div>

        <div className="rounded-[22px] border border-[rgba(114,76,37,0.12)] bg-white/78 p-1.5 shadow-[0_20px_34px_-28px_rgba(61,37,15,0.28)]">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="输入发送给 AI 的问题"
              placeholder={
                !isConfigValid
                  ? '请先完成接口配置'
                  : '继续追问，例如：这个盘未来三年的重点在什么地方？'
              }
              className="min-h-[50px] max-h-36 w-full resize-none bg-transparent px-3 py-2 text-sm leading-7 text-[#2f2118] outline-none placeholder:text-[#9b8776]"
              disabled={inputDisabled}
              rows={1}
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || inputDisabled}
              aria-label={status === 'analyzing' ? 'AI 正在推演' : '发送消息'}
              className="mb-1 inline-flex h-10 shrink-0 items-center gap-2 rounded-[18px] bg-gradient-to-r from-stone-900 via-stone-800 to-amber-700 px-4 text-sm font-medium text-white shadow-[0_16px_28px_-20px_rgba(74,45,25,0.78)] transition hover:-translate-y-0.5 hover:from-stone-950 hover:to-amber-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {status === 'analyzing' ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  推演中
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  发送
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
