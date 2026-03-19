import React from 'react';

interface ExportButtonProps {
  data: unknown;
  filename: string;
  type: 'json' | 'pdf' | 'image';
  targetId?: string;
  children?: React.ReactNode;
  className?: string;
}

interface CopyButtonProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
}

interface PrintButtonProps {
  targetId?: string;
  children?: React.ReactNode;
  className?: string;
}

type StatusTone = 'idle' | 'success' | 'error';

function StatusMessage({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <span className="sr-only" role="status" aria-live="polite">
      {message}
    </span>
  );
}

function getTargetElement(targetId?: string): HTMLElement {
  if (!targetId) {
    return document.body;
  }

  const target = document.getElementById(targetId);
  if (!target) {
    throw new Error('未找到可导出的结果区域。');
  }

  return target;
}

function getStyleMarkup() {
  return Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n');
}

function resolveColorValue(value: string, cache: Map<string, string>) {
  if (!value || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') {
    return value;
  }

  const cached = cache.get(value);
  if (cached) {
    return cached;
  }

  const probe = document.createElement('span');
  probe.style.color = value;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color || value;
  document.body.removeChild(probe);
  cache.set(value, resolved);
  return resolved;
}

function hasUnsupportedColorFunction(value: string) {
  return /(oklch|oklab|lch|lab)\(/i.test(value);
}

function sanitizeCloneStyles(source: HTMLElement, cloned: HTMLElement) {
  const cache = new Map<string, string>();
  const sourceNodes = [source, ...Array.from(source.querySelectorAll<HTMLElement>('*'))];
  const clonedNodes = [cloned, ...Array.from(cloned.querySelectorAll<HTMLElement>('*'))];

  sourceNodes.forEach((node, index) => {
    const clonedNode = clonedNodes[index];
    if (!clonedNode) {
      return;
    }

    const style = getComputedStyle(node);
    clonedNode.removeAttribute('class');
    clonedNode.removeAttribute('style');

    Array.from(style).forEach((property) => {
      const value = style.getPropertyValue(property);
      if (!value || hasUnsupportedColorFunction(value)) {
        return;
      }
      clonedNode.style.setProperty(property, value, style.getPropertyPriority(property));
    });

    clonedNode.style.removeProperty('background');
    clonedNode.style.color = hasUnsupportedColorFunction(style.color)
      ? '#1c1917'
      : resolveColorValue(style.color, cache);
    clonedNode.style.backgroundColor = hasUnsupportedColorFunction(style.backgroundColor)
      ? 'transparent'
      : resolveColorValue(style.backgroundColor, cache);
    clonedNode.style.backgroundImage =
      style.backgroundImage && style.backgroundImage !== 'none' && !hasUnsupportedColorFunction(style.backgroundImage)
        ? style.backgroundImage
        : 'none';
    clonedNode.style.borderTopColor = hasUnsupportedColorFunction(style.borderTopColor) ? '#d6d3d1' : resolveColorValue(style.borderTopColor, cache);
    clonedNode.style.borderRightColor = hasUnsupportedColorFunction(style.borderRightColor) ? '#d6d3d1' : resolveColorValue(style.borderRightColor, cache);
    clonedNode.style.borderBottomColor = hasUnsupportedColorFunction(style.borderBottomColor) ? '#d6d3d1' : resolveColorValue(style.borderBottomColor, cache);
    clonedNode.style.borderLeftColor = hasUnsupportedColorFunction(style.borderLeftColor) ? '#d6d3d1' : resolveColorValue(style.borderLeftColor, cache);
    clonedNode.style.outlineColor = hasUnsupportedColorFunction(style.outlineColor) ? '#d6d3d1' : resolveColorValue(style.outlineColor, cache);
    clonedNode.style.textDecorationColor = hasUnsupportedColorFunction(style.textDecorationColor)
      ? clonedNode.style.color
      : resolveColorValue(style.textDecorationColor, cache);
    clonedNode.style.boxShadow = 'none';
    clonedNode.style.textShadow = 'none';
  });
}

function getStatusPillClasses(tone: StatusTone) {
  if (tone === 'error') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  if (tone === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  return 'border-stone-200 bg-white text-stone-500';
}

function useTransientStatus() {
  const [statusMessage, setStatusMessage] = React.useState('');
  const [statusLabel, setStatusLabel] = React.useState('');
  const [statusTone, setStatusTone] = React.useState<StatusTone>('idle');

  const publishStatus = React.useCallback((message: string, label: string, tone: StatusTone = 'success') => {
    setStatusMessage(message);
    setStatusLabel(label);
    setStatusTone(tone);

    window.setTimeout(() => {
      setStatusLabel('');
      setStatusTone('idle');
    }, 2400);
  }, []);

  return {
    statusMessage,
    statusLabel,
    statusTone,
    publishStatus,
  };
}

function ActionButton({
  icon,
  children,
  className = '',
  statusLabel,
  statusTone,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: string;
  statusLabel?: string;
  statusTone?: StatusTone;
}) {
  return (
    <button
      className={`inline-flex items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition-all hover:border-stone-400 hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-sm text-stone-700" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
      {statusLabel ? (
        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getStatusPillClasses(statusTone ?? 'idle')}`}>
          {statusLabel}
        </span>
      ) : null}
    </button>
  );
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  type,
  targetId,
  children,
  className = '',
}) => {
  const { statusMessage, statusLabel, statusTone, publishStatus } = useTransientStatus();

  const handleExport = async () => {
    try {
      switch (type) {
        case 'json':
          exportJSON(data, filename);
          publishStatus('JSON 已开始下载。', '已开始');
          break;
        case 'pdf':
          await printElement(targetId);
          publishStatus('已打开结果打印对话框。', '已打开');
          break;
        case 'image':
          await exportImage(filename, targetId);
          publishStatus('图片导出已开始。', '已开始');
          break;
      }
    } catch (error) {
      console.error('导出失败:', error);
      publishStatus(error instanceof Error ? error.message : '导出失败，请重试。', '失败', 'error');
    }
  };

  return (
    <ActionButton
      type="button"
      onClick={handleExport}
      title={statusMessage || undefined}
      className={className}
      icon="导"
      statusLabel={statusLabel}
      statusTone={statusTone}
    >
      {children || `导出${type.toUpperCase()}`}
      <StatusMessage message={statusMessage} />
    </ActionButton>
  );
};

function exportJSON(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function printElement(targetId?: string) {
  const target = getTargetElement(targetId);
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1200,height=900');

  if (!printWindow) {
    throw new Error('浏览器阻止了打印窗口，请允许弹窗后重试。');
  }

  const styles = getStyleMarkup();
  printWindow.document.open();
  printWindow.document.write(`
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${document.title}</title>
        ${styles}
        <style>
          body {
            margin: 0;
            background: #f6f1e8;
            color: #1c1917;
          }

          .print-shell {
            margin: 0 auto;
            max-width: 1120px;
            padding: 24px;
          }

          [data-print-hide="true"] {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <main class="print-shell">${target.outerHTML}</main>
      </body>
    </html>
  `);
  printWindow.document.close();

  printWindow.addEventListener(
    'load',
    () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    },
    { once: true }
  );
}

async function exportImage(filename: string, targetId?: string) {
  try {
    const target = getTargetElement(targetId);
    const html2canvas = (await import('html2canvas')).default;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-20000px';
    iframe.style.top = '0';
    iframe.style.width = `${Math.max(target.scrollWidth, target.clientWidth, 960)}px`;
    iframe.style.height = `${Math.max(target.scrollHeight, target.clientHeight, 1200)}px`;
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) {
      throw new Error('无法创建导出画布。');
    }

    iframeDoc.open();
    iframeDoc.write(`
      <!doctype html>
      <html lang="zh-CN">
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              margin: 0;
              padding: 24px;
              background: #f6f1e8;
            }
          </style>
        </head>
        <body></body>
      </html>
    `);
    iframeDoc.close();

    const exportTarget = target.cloneNode(true) as HTMLElement;
    sanitizeCloneStyles(target, exportTarget);
    iframeDoc.body.appendChild(exportTarget);

    await new Promise((resolve) => {
      iframe.contentWindow?.requestAnimationFrame(() => resolve(null));
    });

    const canvas = await html2canvas(exportTarget, {
      backgroundColor: '#f6f1e8',
      scale: 2,
      logging: false,
      windowWidth: Math.max(exportTarget.scrollWidth, exportTarget.clientWidth, 960),
      windowHeight: Math.max(exportTarget.scrollHeight, exportTarget.clientHeight, 1200),
    });

    canvas.toBlob((blob: Blob | null) => {
      if (!blob) {
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
    document.body.removeChild(iframe);
  } catch (error) {
    console.error('截图失败:', error);
    throw new Error('图片导出需要 html2canvas 支持。');
  }
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  return Promise.resolve();
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  children,
  className = '',
  onSuccess,
}) => {
  const [copied, setCopied] = React.useState(false);
  const { statusMessage, statusLabel, statusTone, publishStatus } = useTransientStatus();

  const handleCopy = async () => {
    try {
      await copyToClipboard(text);
      setCopied(true);
      publishStatus('复制成功。', '已复制');
      onSuccess?.();
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      publishStatus('复制失败，请手动复制。', '失败', 'error');
    }
  };

  return (
    <ActionButton
      type="button"
      onClick={handleCopy}
      title={statusMessage || undefined}
      className={className}
      icon={copied ? '成' : '复'}
      statusLabel={statusLabel}
      statusTone={statusTone}
    >
      {children || (copied ? '已复制' : '复制')}
      <StatusMessage message={statusMessage} />
    </ActionButton>
  );
};

export function printPage(targetId?: string) {
  return printElement(targetId);
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  targetId,
  children,
  className = '',
}) => {
  const { statusMessage, statusLabel, statusTone, publishStatus } = useTransientStatus();

  return (
    <ActionButton
      type="button"
      onClick={async () => {
        try {
          await printPage(targetId);
          publishStatus('已打开结果打印对话框。', '已打开');
        } catch (error) {
          console.error('打印失败:', error);
          publishStatus(error instanceof Error ? error.message : '打印失败，请重试。', '失败', 'error');
        }
      }}
      title={statusMessage || undefined}
      className={className}
      icon="印"
      statusLabel={statusLabel}
      statusTone={statusTone}
    >
      {children || '打印'}
      <StatusMessage message={statusMessage} />
    </ActionButton>
  );
};
