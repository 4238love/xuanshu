const RETRYABLE_STREAM_ERROR_PATTERNS = [
  /network error/i,
  /failed to fetch/i,
  /fetch failed/i,
  /load failed/i,
  /body stream/i,
  /terminated/i,
  /stream interrupted/i,
  /stream closed/i,
  /timeout/i,
];

function getLastNonEmptyLines(text: string, count: number): string[] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const result: string[] = [];

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const trimmed = lines[index]?.trim();
    if (!trimmed) {
      continue;
    }

    result.unshift(trimmed);
    if (result.length === count) {
      break;
    }
  }

  return result;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export function shouldRetryWithoutStreaming(error: unknown): boolean {
  if (!(error instanceof Error) || isAbortError(error)) {
    return false;
  }

  if (error.name === 'TypeError') {
    return true;
  }

  return RETRYABLE_STREAM_ERROR_PATTERNS.some((pattern) => pattern.test(error.message));
}

export function hasIncompleteStructuredTail(content: string): boolean {
  const normalized = content.replace(/\r\n?/g, '\n').trimEnd();
  if (!normalized) {
    return false;
  }

  const codeFenceCount = (normalized.match(/```/g) ?? []).length;
  if (codeFenceCount % 2 === 1) {
    return true;
  }

  const recentLines = getLastNonEmptyLines(normalized, 2);
  const lastLine = recentLines[recentLines.length - 1] ?? '';

  if (!lastLine) {
    return false;
  }

  if (
    /^[-*]\s*$/.test(lastLine) ||
    /^\d+\.\s*$/.test(lastLine) ||
    /^>\s*$/.test(lastLine) ||
    /^#{1,6}\s*$/.test(lastLine)
  ) {
    return true;
  }

  if (/[:\uFF1A]$/.test(lastLine) || /[(\uFF08]$/.test(lastLine) || /[*_~`]$/.test(lastLine)) {
    return true;
  }

  if (
    recentLines.length === 1 &&
    /^[^\d\-*#>`].{0,18}$/.test(lastLine) &&
    !/[.!?;\u3002\uFF01\uFF1F\uFF1B]$/.test(lastLine)
  ) {
    return true;
  }

  if (
    /^(利点|风险点|建议|总结|结论|补充|重点提示|注意事项|下一步|婚恋|事业|财运|健康)$/.test(
      lastLine
    )
  ) {
    return true;
  }

  return false;
}
