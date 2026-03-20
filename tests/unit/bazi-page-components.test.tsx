import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BaZiForm } from '@/app/bazi/BaZiForm';
import { BaZiResults } from '@/app/bazi/BaZiResults';
import AIChatWindow from '@/components/ai/AIChatWindow';
import { createBaZiPaiPan } from '@/lib/bazi';
import { getSupportedCities } from '@/lib/utils/trueSolarTime';
import { BaZiSettings } from '@/types';

jest.mock('@/components/ai/AnalysisResult', () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => <div>{content}</div>,
}));

const BASE_SETTINGS: BaZiSettings = {
  name: '测试',
  occupy: '',
  sex: 1,
  date: '1990-05-15 10:30:00',
  dateType: 0,
  xuShiSuiType: 1,
  qiYunLiuPaiType: 1,
  daYunLunShu: 10,
  yearGanZhiType: 2,
  monthGanZhiType: 1,
  dayGanZhiType: 0,
  useTrueSolarTime: false,
  showXiaoYun: true,
  showLiuYue: true,
  showLiuRi: false,
  showLiuShi: true,
  showJiuXing: true,
  showGanZhiLiuYi: true,
  showShenSha: true,
  showGeJu: true,
  showDaYunShenSha: true,
  showLiuNianShenSha: true,
};

describe('八字页面组件', () => {
  test('BaZiForm 为真太阳时城市输入提供候选列表', () => {
    const markup = renderToStaticMarkup(
      <BaZiForm
        settings={{ ...BASE_SETTINGS, useTrueSolarTime: true, city: '广州' }}
        errors={{}}
        loading={false}
        onSubmit={() => {}}
        onTextChange={() => {}}
        onNumberChange={() => {}}
        onRadioChange={() => {}}
        onToggle={() => {}}
        onDateChange={() => {}}
        onDateTypeChange={() => {}}
      />
    );

    expect(markup).toContain('list="true-solar-city-list"');
    expect(markup).toContain('<datalist id="true-solar-city-list">');
    expect(markup).toContain(`value="${getSupportedCities()[0]}"`);
  });

  test('BaZiResults 默认渲染五个主分区与导航锚点', () => {
    const result = createBaZiPaiPan(BASE_SETTINGS);
    const markup = renderToStaticMarkup(<BaZiResults result={result} />);
    const allSections = markup.match(/<section id="/g) ?? [];
    const overviewLinks = markup.match(/href="#(overview|strength|fortune|relations|insights)"/g) ?? [];

    expect(allSections).toHaveLength(5);
    expect(overviewLinks).toHaveLength(5);
    expect(markup).toContain('结果控制');
  });

  test('AIChatWindow 输出聊天日志与图标按钮无障碍标签', () => {
    const markup = renderToStaticMarkup(
      <AIChatWindow
        messages={[
          {
            id: 'assistant-1',
            role: 'assistant',
            content: '已准备好。',
            timestamp: Date.now(),
          },
        ]}
        status="idle"
        error={null}
        systemLabel="八字"
        isConfigValid={false}
        onOpenSettings={() => {}}
        onSendMessage={() => {}}
        onClear={() => {}}
      />
    );

    expect(markup).toContain('role="log"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('aria-label="输入发送给 AI 的问题"');
    expect(markup).toContain('清空对话');
    expect(markup).toContain('aria-label="发送消息"');
  });
});
