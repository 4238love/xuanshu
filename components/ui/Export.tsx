import React from 'react';

interface ExportButtonProps {
  data: any;
  filename: string;
  type: 'json' | 'pdf' | 'image';
  children?: React.ReactNode;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  type,
  children,
  className = ''
}) => {
  const handleExport = async () => {
    try {
      switch (type) {
        case 'json':
          exportJSON(data, filename);
          break;
        case 'pdf':
          await exportPDF(filename);
          break;
        case 'image':
          await exportImage(filename);
          break;
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 ${className}`}
    >
      <span>📥</span>
      {children || `导出${type.toUpperCase()}`}
    </button>
  );
};

// 导出JSON
function exportJSON(data: any, filename: string) {
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

// 导出PDF (使用浏览器打印功能)
async function exportPDF(filename: string) {
  // 触发浏览器打印对话框
  window.print();

  // 提示用户
  alert('请在打印对话框中选择"另存为PDF"');
}

// 导出图片 (截图当前页面)
async function exportImage(filename: string) {
  try {
    // 使用html2canvas库截图
    // 注意: 需要安装 html2canvas
    // npm install html2canvas

    // 动态导入 html2canvas（可选依赖）
    let html2canvas: any = null;
    try {
      html2canvas = (await import('html2canvas' as any)).default;
    } catch (e) {
      alert('图片导出功能需要安装html2canvas库\n请运行: npm install html2canvas');
      return;
    }

    const element = document.body;

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false
    });

    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    });
  } catch (error) {
    console.error('截图失败:', error);
    alert('图片导出功能需要安装html2canvas库\n请运行: npm install html2canvas');
  }
}

// 复制到剪贴板
export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  } else {
    // 降级方案
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
}

interface CopyButtonProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  children,
  className = '',
  onSuccess
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(text);
      setCopied(true);
      onSuccess?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动复制');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center gap-2 ${className}`}
    >
      <span>{copied ? '✓' : '📋'}</span>
      {children || (copied ? '已复制' : '复制')}
    </button>
  );
};

// 打印功能
export function printPage() {
  window.print();
}

interface PrintButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  children,
  className = ''
}) => {
  return (
    <button
      onClick={printPage}
      className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 ${className}`}
    >
      <span>🖨️</span>
      {children || '打印'}
    </button>
  );
};
