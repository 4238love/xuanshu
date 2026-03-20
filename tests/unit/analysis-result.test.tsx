import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AnalysisResult from '@/components/ai/AnalysisResult';

describe('AnalysisResult', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('skips trailing empty markdown list items', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const markup = renderToStaticMarkup(
      <AnalysisResult content={'## 风险点\n-\n- 注意情绪反复。'} />
    );

    const listItems = markup.match(/<li>/g) ?? [];

    expect(listItems).toHaveLength(1);
    expect(markup).toContain('注意情绪反复。');
  });
});
