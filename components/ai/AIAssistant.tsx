'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useFocusTrap } from '@/components/ui/Accessibility';
import { getAIConfig, getAIConfigMode, isAIConfigValid } from '@/lib/ai/config';
import { AnalysisType, PaiPanSystem, QuickAnalysisOptions } from '@/types/ai';
import AIChatWindow from './AIChatWindow';
import AISettingsPanel from './AISettingsPanel';
import QuickPrompts from './QuickPrompts';

interface AIAssistantProps {
  system: PaiPanSystem;
  chartData: unknown;
}

const SYSTEM_LABELS: Record<PaiPanSystem, string> = {
  bazi: '八字',
  liuyao: '六爻',
  meihua: '梅花',
  daliuren: '大六壬',
  qimen: '奇门',
  ziwei: '紫微',
};

const STATUS_META = {
  idle: {
    label: '待命',
    chip: 'border-stone-200 bg-white/75 text-[#6f5e51]',
  },
  analyzing: {
    label: '推演中',
    chip: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  completed: {
    label: '已生成',
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  error: {
    label: '异常',
    chip: 'border-red-200 bg-red-50 text-red-700',
  },
} as const;

const SERIF_STYLE = {
  fontFamily:
    '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Baskerville, "Songti SC", "STSong", serif',
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export default function AIAssistant({ system, chartData }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isConfigValid, setIsConfigValid] = useState(false);
  const [currentConfigName, setCurrentConfigName] = useState('');
  const [currentMode, setCurrentMode] = useState<'official' | 'custom'>('official');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const dialogId = `ai-assistant-dialog-${useId()}`;
  const titleId = `${dialogId}-title`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    status,
    error,
    sendMessage,
    sendQuickAnalysis,
    clearMessages,
  } = useAIAnalysis(system, chartData);

  useFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    if (messages.length > 0) {
      setShowQuickPrompts(false);
    }
  }, [messages.length]);

  const syncConfigState = useCallback(async () => {
    const mode = getAIConfigMode();
    const config = getAIConfig();

    setCurrentMode(mode);

    if (mode === 'official') {
      setCurrentConfigName('官方托管');

      try {
        const response = await fetch('/api/ai', { method: 'GET' });
        if (!response.ok) {
          throw new Error('无法读取官方接口状态');
        }

        const data = (await response.json()) as { officialConfigured?: boolean };
        setIsConfigValid(Boolean(data.officialConfigured));
      } catch {
        setIsConfigValid(false);
      }

      return;
    }

    setIsConfigValid(isAIConfigValid(config, mode));
    setCurrentConfigName(config.name?.trim() || '自定义配置');
  }, []);

  useEffect(() => {
    void syncConfigState();
  }, [isOpen, syncConfigState]);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
    setShowSettings(false);
    setIsExpanded(false);

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  }, []);

  const openAssistant = useCallback(() => {
    setIsOpen(true);
    setShowSettings(false);
    setIsExpanded(false);
    setShowQuickPrompts(messages.length === 0);
  }, [messages.length]);

  const refreshConfig = useCallback(() => {
    void syncConfigState();
  }, [syncConfigState]);

  const openSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleQuickAnalysis = useCallback(
    (type: AnalysisType) => {
      if (!isConfigValid) {
        setShowSettings(true);
        return;
      }

      setShowQuickPrompts(false);
      sendQuickAnalysis(type, system, chartData);
    },
    [chartData, isConfigValid, sendQuickAnalysis, system]
  );

  const handleCustomQuestion = useCallback(
    (question: string) => {
      if (!isConfigValid) {
        setShowSettings(true);
        return;
      }

      setShowQuickPrompts(false);
      sendMessage(question);
    },
    [isConfigValid, sendMessage]
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAssistant();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeAssistant, isOpen]);

  const systemLabel = SYSTEM_LABELS[system];
  const quickOptions = QuickAnalysisOptions[system];
  const statusMeta = STATUS_META[status];
  const hasMessages = messages.length > 0;
  const canToggleQuickPrompts = hasMessages || !showQuickPrompts;

  return (
    <>
      {!isOpen && (
        <button
          ref={triggerRef}
          type="button"
          onClick={openAssistant}
          aria-label="打开 AI 批注"
          aria-controls={dialogId}
          aria-expanded={isOpen}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 flex items-center gap-3 rounded-[24px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(255,209,138,0.18),transparent_34%),linear-gradient(135deg,#2c1b12_0%,#4a2d19_55%,#94602d_100%)] px-3 py-3 text-left text-white shadow-[0_26px_60px_-28px_rgba(72,38,10,0.85)] ring-1 ring-amber-100/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-30px_rgba(72,38,10,0.92)] sm:bottom-6 sm:right-6 sm:px-4"
          title="打开 AI 批注"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-white/12 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </span>

          <span className="hidden min-w-0 sm:block">
            <span className="block text-[10px] uppercase tracking-[0.32em] text-stone-300">AI 解读</span>
            <span className="mt-1 block text-sm font-semibold tracking-[0.08em] text-white">
              {systemLabel}批注
            </span>
            <span className="mt-1 block text-xs text-stone-200">
              {isConfigValid ? (currentMode === 'official' ? '官方托管' : currentConfigName) : '待配置接口'}
            </span>
          </span>

          <span
            className={cx(
              'hidden h-2.5 w-2.5 rounded-full sm:block',
              isConfigValid
                ? 'bg-emerald-300 shadow-[0_0_0_6px_rgba(110,231,183,0.14)]'
                : 'bg-amber-300 shadow-[0_0_0_6px_rgba(252,211,77,0.14)]'
            )}
            aria-hidden="true"
          />
        </button>
      )}

      {isOpen && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-30 bg-stone-950/30 backdrop-blur-[2px]"
            onClick={closeAssistant}
          />

          <div
            ref={dialogRef}
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cx(
              'fixed z-40 flex flex-col overflow-hidden border border-[rgba(117,76,40,0.18)] bg-[linear-gradient(180deg,rgba(255,252,247,0.97),rgba(244,236,225,0.94))] text-[#2f2118] shadow-[0_36px_90px_-42px_rgba(48,29,14,0.78)] backdrop-blur-xl transition-all duration-300',
              isExpanded
                ? 'inset-0 rounded-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[88vh] sm:max-h-[900px] sm:w-[960px] sm:max-w-[calc(100vw-3rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[34px]'
                : 'inset-0 rounded-none sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[88vh] sm:max-h-[820px] sm:w-[600px] sm:max-w-[calc(100vw-3rem)] sm:rounded-[30px]'
            )}
          >
            <div className="pointer-events-none absolute inset-0 opacity-[0.1] [background-image:linear-gradient(rgba(62,40,20,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(62,40,20,0.06)_1px,transparent_1px)] [background-size:26px_26px]" />

            <div
              className={cx(
                'relative border-b border-[rgba(117,76,40,0.14)] bg-[radial-gradient(circle_at_top_left,rgba(255,213,147,0.26),transparent_28%),linear-gradient(180deg,rgba(255,252,247,0.98),rgba(249,241,231,0.92))] px-4 sm:px-5',
                hasMessages
                  ? 'pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:pb-3 sm:pt-3'
                  : 'pb-4 pt-[calc(0.9rem+env(safe-area-inset-top))] sm:pb-4 sm:pt-4'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-[rgba(117,76,40,0.14)] bg-white/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.28em] text-[#8a6239]">
                      AI 解读
                    </span>
                    <span className="rounded-full border border-[rgba(117,76,40,0.14)] bg-white/80 px-2.5 py-1 text-xs text-[#5b4430]">
                      {systemLabel}命盘
                    </span>
                    <span className={cx('rounded-full border px-2.5 py-1 text-xs', statusMeta.chip)}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className={cx('flex items-start gap-3', hasMessages ? 'mt-2.5' : 'mt-3')}>
                    <span
                      className={cx(
                        'flex shrink-0 items-center justify-center border border-[rgba(117,76,40,0.12)] bg-[#4a2d19] text-white shadow-[0_16px_30px_-20px_rgba(74,45,25,0.75)]',
                        hasMessages ? 'h-10 w-10 rounded-[15px]' : 'h-11 w-11 rounded-[17px]'
                      )}
                    >
                      <svg className={cx(hasMessages ? 'h-5 w-5' : 'h-6 w-6')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </span>

                    <div className="min-w-0">
                      <h2
                        id={titleId}
                        className={cx(
                          'font-semibold tracking-[0.08em] text-[#2f2118]',
                          hasMessages ? 'text-[1.16rem] sm:text-[1.28rem]' : 'text-[1.28rem] sm:text-[1.46rem]'
                        )}
                        style={SERIF_STYLE}
                      >
                        {systemLabel} AI 批注
                      </h2>

                      {!hasMessages ? (
                        <p className="mt-1.5 text-sm leading-6 text-[#6f5e51]">
                          结合当前命盘做专题解读、补问追问与结果整理。
                        </p>
                      ) : null}

                      <div className={cx('flex flex-wrap gap-2', hasMessages ? 'mt-2' : 'mt-3')}>
                        <span className="rounded-full border border-[rgba(117,76,40,0.14)] bg-white/85 px-3 py-1 text-xs text-[#5b4430]">
                          {currentMode === 'official' ? '官方托管' : currentConfigName}
                        </span>
                        {!isConfigValid ? (
                          <button
                            type="button"
                            onClick={openSettings}
                            className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-800 transition hover:border-amber-400 hover:bg-amber-100"
                          >
                            未配置可用接口，前往设置
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSettings}
                    aria-label={showSettings ? '关闭 AI 设置' : '打开 AI 设置'}
                    aria-pressed={showSettings}
                    className="rounded-full border border-[rgba(117,76,40,0.14)] bg-white/85 p-2 text-[#5b4430] transition hover:border-[#a27140] hover:bg-[#fff7ed]"
                    title="设置"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={toggleExpand}
                    aria-label={isExpanded ? '缩小 AI 面板' : '放大 AI 面板'}
                    className="hidden rounded-full border border-[rgba(117,76,40,0.14)] bg-white/85 p-2 text-[#5b4430] transition hover:border-[#a27140] hover:bg-[#fff7ed] sm:block"
                    title={isExpanded ? '缩小' : '放大'}
                  >
                    {isExpanded ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={closeAssistant}
                    aria-label="关闭 AI 面板"
                    className="rounded-full border border-[rgba(117,76,40,0.14)] bg-white/85 p-2 text-[#5b4430] transition hover:border-[#a27140] hover:bg-[#fff7ed]"
                    title="关闭"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {showSettings ? (
              <AISettingsPanel onClose={toggleSettings} onSave={refreshConfig} />
            ) : (
              <>
                <div
                  className={cx(
                    'relative border-b border-[rgba(117,76,40,0.14)] bg-[rgba(255,250,245,0.76)] px-4 sm:px-5',
                    showQuickPrompts ? 'py-3' : 'py-2.5'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-[0.28em] text-[#8a6239]">快捷专题</div>
                      <div className="mt-1 text-sm font-semibold text-[#2f2118]">
                        {showQuickPrompts ? '一键发起专题批注' : '专题入口已收起'}
                      </div>
                    </div>

                    {canToggleQuickPrompts ? (
                      <button
                        type="button"
                        onClick={() => setShowQuickPrompts((prev) => !prev)}
                        className="rounded-full border border-[rgba(117,76,40,0.14)] bg-white/80 px-3 py-1.5 text-xs text-[#5b4430] transition hover:border-[#a27140] hover:bg-[#fff7ed]"
                      >
                        {showQuickPrompts ? '收起专题' : '展开专题'}
                      </button>
                    ) : (
                      <div className="text-xs text-[#7b6b5f]">先选专题，再继续追问细节</div>
                    )}
                  </div>

                  {showQuickPrompts ? (
                    <div className="mt-3">
                      <QuickPrompts
                        options={quickOptions}
                        onSelect={handleQuickAnalysis}
                        disabled={status === 'analyzing'}
                      />
                    </div>
                  ) : null}

                  {!isConfigValid ? (
                    <div className="mt-3 flex items-start justify-between gap-3 rounded-[18px] border border-amber-300/80 bg-amber-50/90 px-3.5 py-3 text-sm text-amber-900">
                      <div>
                        <div className="font-medium">当前没有可用接口</div>
                        <div className="mt-1 text-xs leading-6 text-amber-800">
                          先完成官方接口检测，或填写自定义模型配置，再开始批注。
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={openSettings}
                        className="shrink-0 rounded-full border border-amber-300 bg-white/85 px-3 py-1.5 text-xs text-amber-900 transition hover:bg-white"
                      >
                        去设置
                      </button>
                    </div>
                  ) : null}
                </div>

                <AIChatWindow
                  messages={messages}
                  status={status}
                  error={error}
                  systemLabel={systemLabel}
                  isConfigValid={isConfigValid}
                  onOpenSettings={openSettings}
                  onSendMessage={handleCustomQuestion}
                  onClear={clearMessages}
                />
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
