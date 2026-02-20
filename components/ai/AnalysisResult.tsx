'use client';

interface AnalysisResultProps {
  content: string;
  isStreaming?: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(value: string): string {
  return escapeHtml(value).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function isOrderedListLine(line: string): boolean {
  return /^\d+\.\s*/.test(line);
}

function isUnorderedListLine(line: string): boolean {
  return /^[-*]\s*/.test(line);
}

export default function AnalysisResult({ content, isStreaming = false }: AnalysisResultProps) {
  const renderContent = (text: string): string => {
    if (!text) {
      return '';
    }

    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    const blocks: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const trimmed = lines[i].trim();

      if (!trimmed) {
        i += 1;
        continue;
      }

      if (trimmed.startsWith('### ')) {
        blocks.push(`<h3 class="title-3">${renderInline(trimmed.slice(4))}</h3>`);
        i += 1;
        continue;
      }

      if (trimmed.startsWith('## ')) {
        blocks.push(`<h2 class="title-2">${renderInline(trimmed.slice(3))}</h2>`);
        i += 1;
        continue;
      }

      if (trimmed.startsWith('# ')) {
        blocks.push(`<h1 class="title-1">${renderInline(trimmed.slice(2))}</h1>`);
        i += 1;
        continue;
      }

      if (isOrderedListLine(trimmed)) {
        const items: string[] = [];
        while (i < lines.length) {
          const current = lines[i].trim();
          const match = current.match(/^(\d+)\.\s*(.*)$/);
          if (!match) {
            break;
          }
          items.push(`<li><span class="num">${match[1]}.</span> ${renderInline(match[2])}</li>`);
          i += 1;
        }
        blocks.push(`<ol class="ordered">${items.join('')}</ol>`);
        continue;
      }

      if (isUnorderedListLine(trimmed)) {
        const items: string[] = [];
        while (i < lines.length) {
          const current = lines[i].trim();
          const match = current.match(/^[-*]\s*(.*)$/);
          if (!match) {
            break;
          }
          items.push(`<li>${renderInline(match[1])}</li>`);
          i += 1;
        }
        blocks.push(`<ul class="unordered">${items.join('')}</ul>`);
        continue;
      }

      const paragraph: string[] = [];
      while (i < lines.length) {
        const current = lines[i].trim();
        if (!current) {
          break;
        }
        if (
          current.startsWith('# ') ||
          current.startsWith('## ') ||
          current.startsWith('### ') ||
          isOrderedListLine(current) ||
          isUnorderedListLine(current)
        ) {
          break;
        }
        paragraph.push(renderInline(current));
        i += 1;
      }
      blocks.push(`<p class="text">${paragraph.join('<br/>')}</p>`);
    }

    return blocks.join('');
  };

  return (
    <div className="paper-style">
      <div
        dangerouslySetInnerHTML={{
          __html: renderContent(content) || (isStreaming ? '正在分析中...' : '暂无分析结果'),
        }}
      />

      {isStreaming && <span className="cursor" />}

      <style jsx>{`
        .paper-style {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
            'Microsoft YaHei', sans-serif;
          font-size: 14px;
          line-height: 1.9;
          color: #222;
        }

        .paper-style :global(h1.title-1) {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 16px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #333;
        }

        .paper-style :global(h2.title-2) {
          font-size: 17px;
          font-weight: 600;
          color: #2d2d2d;
          margin: 24px 0 12px 0;
          padding-left: 12px;
          border-left: 3px solid #333;
        }

        .paper-style :global(h3.title-3) {
          font-size: 15px;
          font-weight: 600;
          color: #3d3d3d;
          margin: 20px 0 10px 0;
          padding-left: 10px;
          border-left: 2px solid #666;
        }

        .paper-style :global(p.text) {
          margin: 0 0 12px 0;
          text-align: justify;
          color: #333;
        }

        .paper-style :global(ol.ordered) {
          margin: 8px 0 16px 0;
          padding-left: 24px;
        }

        .paper-style :global(ul.unordered) {
          margin: 8px 0 16px 0;
          padding-left: 24px;
        }

        .paper-style :global(li) {
          margin-bottom: 6px;
          color: #333;
        }

        .paper-style :global(strong) {
          font-weight: 600;
          color: #000;
        }

        .cursor {
          display: inline-block;
          width: 2px;
          height: 16px;
          background: #333;
          animation: blink 1s infinite;
          vertical-align: text-bottom;
        }

        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
