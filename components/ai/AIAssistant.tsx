'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { QuickAnalysisOptions, PaiPanSystem, AnalysisType } from '@/types/ai';
import { isAIConfigValid, getAIConfig, getAIConfigMode } from '@/lib/ai/config';
import AIChatWindow from './AIChatWindow';
import QuickPrompts from './QuickPrompts';
import AISettingsPanel from './AISettingsPanel';

interface AIAssistantProps {
  system: PaiPanSystem;
  chartData: unknown;
}

export default function AIAssistant({ system, chartData }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isConfigValid, setIsConfigValid] = useState(false);
  const [currentConfigName, setCurrentConfigName] = useState('');
  const [currentMode, setCurrentMode] = useState<'official' | 'custom'>('official');
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    messages,
    status,
    error,
    sendMessage,
    sendQuickAnalysis,
    clearMessages,
  } = useAIAnalysis(system, chartData);

  const syncConfigState = useCallback(() => {
    const mode = getAIConfigMode();
    const config = getAIConfig();

    setCurrentMode(mode);
    if (mode === 'official') {
      setIsConfigValid(true);
      setCurrentConfigName('官方 API');
      return;
    }

    setIsConfigValid(isAIConfigValid(config, mode));
    setCurrentConfigName(config.name || '自定义 API');
  }, []);

  // 检查配置是否有效
  useEffect(() => {
    syncConfigState();
  }, [isOpen, syncConfigState]);

  // 切换面板
  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
    setShowSettings(false);
    if (!isOpen) {
      setIsExpanded(false);
    }
  }, [isOpen]);

  // 刷新配置（当设置保存后调用）
  const refreshConfig = useCallback(() => {
    syncConfigState();
  }, [syncConfigState]);

  // 切换设置面板
  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // 切换放大/缩小
  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // 处理快捷分析
  const handleQuickAnalysis = useCallback((type: AnalysisType) => {
    if (!isConfigValid) {
      setShowSettings(true);
      return;
    }
    sendQuickAnalysis(type, system, chartData);
  }, [isConfigValid, sendQuickAnalysis, system, chartData]);

  // 处理自定义问题
  const handleCustomQuestion = useCallback((question: string) => {
    if (!isConfigValid) {
      setShowSettings(true);
      return;
    }
    sendMessage(question);
  }, [isConfigValid, sendMessage]);

  // 获取当前系统的快捷选项
  const quickOptions = QuickAnalysisOptions[system];

  return (
    <>
      {/* 浮动按钮 - 只在关闭时显示 */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-110"
          title="打开AI助手"
        >
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </button>
      )}

      {/* 聊天窗口 */}
      {isOpen && (
        <div className={`fixed z-40 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 transition-all duration-300 ${
          isExpanded
            ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[80vh]'
            : 'top-20 right-6 w-[480px] h-[calc(100vh-120px)] max-h-[700px]'
        }`}>
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="font-semibold">AI命理助手</span>
              {isConfigValid && currentConfigName && (
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {currentMode === 'official' ? '官方 API' : currentConfigName}
                </span>
              )}
              {!isConfigValid && (
                <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">
                  未配置
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleOpen}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="关闭"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={toggleExpand}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title={isExpanded ? '缩小' : '放大'}
              >
                {isExpanded ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
              <button
                onClick={toggleSettings}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="设置"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          {showSettings ? (
            <AISettingsPanel onClose={toggleSettings} onSave={refreshConfig} />
          ) : (
            <>
              {/* 快捷分析按钮 */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <QuickPrompts
                  options={quickOptions}
                  onSelect={handleQuickAnalysis}
                  disabled={status === 'analyzing'}
                />
              </div>

              {/* 聊天窗口 */}
              <AIChatWindow
                messages={messages}
                status={status}
                error={error}
                onSendMessage={handleCustomQuestion}
                onClear={clearMessages}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}
