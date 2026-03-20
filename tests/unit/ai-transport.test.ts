import {
  hasIncompleteStructuredTail,
  isAbortError,
  shouldRetryWithoutStreaming,
} from '@/lib/ai/transport';

describe('AI transport helpers', () => {
  test('treats AbortError as a user cancellation instead of a retryable transport failure', () => {
    const abortError = new Error('The operation was aborted.');
    abortError.name = 'AbortError';

    expect(isAbortError(abortError)).toBe(true);
    expect(shouldRetryWithoutStreaming(abortError)).toBe(false);
  });

  test('retries when the browser reports a network-level streaming failure', () => {
    expect(shouldRetryWithoutStreaming(new TypeError('network error'))).toBe(true);
    expect(shouldRetryWithoutStreaming(new Error('Failed to fetch'))).toBe(true);
    expect(shouldRetryWithoutStreaming(new Error('Body stream already disturbed'))).toBe(true);
  });

  test('does not retry when the upstream returned a normal application error', () => {
    expect(shouldRetryWithoutStreaming(new Error('invalid api key'))).toBe(false);
    expect(shouldRetryWithoutStreaming(new Error('请求失败: 401'))).toBe(false);
  });

  test('detects obviously incomplete markdown tails that should trigger continuation', () => {
    expect(hasIncompleteStructuredTail('## 风险点\n-')).toBe(true);
    expect(hasIncompleteStructuredTail('1.')).toBe(true);
    expect(hasIncompleteStructuredTail('建议如下：')).toBe(true);
    expect(hasIncompleteStructuredTail('```ts\nconst a = 1;')).toBe(true);
  });

  test('does not flag complete structured content as incomplete', () => {
    expect(hasIncompleteStructuredTail('## 风险点\n- 注意沟通方式。')).toBe(false);
    expect(hasIncompleteStructuredTail('建议如下：\n1. 保持节奏。')).toBe(false);
    expect(hasIncompleteStructuredTail('结论完整。')).toBe(false);
  });
});
