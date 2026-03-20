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
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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

      if (trimmed === '---') {
        blocks.push('<hr class="divider" />');
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

      if (trimmed.startsWith('> ')) {
        const quotes: string[] = [];
        while (i < lines.length) {
          const current = lines[i].trim();
          if (!current.startsWith('> ')) {
            break;
          }
          quotes.push(renderInline(current.slice(2)));
          i += 1;
        }
        blocks.push(`<blockquote class="quote">${quotes.map((item) => `<p>${item}</p>`).join('')}</blockquote>`);
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
          const itemText = match[2].trim();
          if (itemText) {
            items.push(`<li><span class="num">${match[1]}.</span><span class="item">${renderInline(itemText)}</span></li>`);
          }
          i += 1;
        }
        if (items.length > 0) {
          blocks.push(`<ol class="ordered">${items.join('')}</ol>`);
        }
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
          const itemText = match[1].trim();
          if (itemText) {
            items.push(`<li><span class="bullet"></span><span class="item">${renderInline(itemText)}</span></li>`);
          }
          i += 1;
        }
        if (items.length > 0) {
          blocks.push(`<ul class="unordered">${items.join('')}</ul>`);
        }
        continue;
      }

      const paragraph: string[] = [];
      while (i < lines.length) {
        const current = lines[i].trim();
        if (!current) {
          break;
        }
        if (
          current === '---' ||
          current.startsWith('# ') ||
          current.startsWith('## ') ||
          current.startsWith('### ') ||
          current.startsWith('> ') ||
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
          __html: renderContent(content) || (isStreaming ? '正在推演…' : '暂无批注内容'),
        }}
      />

      {isStreaming ? <span className="cursor" /> : null}

      <style jsx>{`
        .paper-style {
          font-family: "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
          font-size: 14px;
          line-height: 1.9;
          color: #3b2d1d;
        }

        .paper-style :global(h1.title-1),
        .paper-style :global(h2.title-2),
        .paper-style :global(h3.title-3) {
          font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Baskerville, "Songti SC", "STSong", serif;
          letter-spacing: 0.04em;
          color: #2f2118;
        }

        .paper-style :global(h1.title-1) {
          margin: 0 0 18px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(117, 76, 40, 0.2);
          font-size: 24px;
          font-weight: 700;
        }

        .paper-style :global(h2.title-2) {
          margin: 28px 0 14px 0;
          padding-left: 14px;
          border-left: 3px solid rgba(143, 91, 45, 0.85);
          font-size: 18px;
          font-weight: 700;
        }

        .paper-style :global(h3.title-3) {
          margin: 22px 0 10px 0;
          padding-left: 12px;
          border-left: 2px solid rgba(143, 91, 45, 0.55);
          font-size: 15px;
          font-weight: 700;
        }

        .paper-style :global(p.text) {
          margin: 0 0 14px 0;
          text-align: justify;
          color: #3f2f20;
        }

        .paper-style :global(ol.ordered),
        .paper-style :global(ul.unordered) {
          margin: 10px 0 16px 0;
          padding: 0;
          list-style: none;
        }

        .paper-style :global(ol.ordered li),
        .paper-style :global(ul.unordered li) {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 10px;
          align-items: start;
          margin-bottom: 8px;
          color: #3f2f20;
        }

        .paper-style :global(ol.ordered .num) {
          min-width: 26px;
          font-weight: 700;
          color: #8f5b2d;
        }

        .paper-style :global(ul.unordered .bullet) {
          display: inline-block;
          width: 7px;
          height: 7px;
          margin-top: 10px;
          border-radius: 999px;
          background: #8f5b2d;
        }

        .paper-style :global(.item) {
          min-width: 0;
        }

        .paper-style :global(blockquote.quote) {
          margin: 14px 0 18px;
          padding: 14px 16px;
          border-left: 3px solid rgba(143, 91, 45, 0.7);
          border-radius: 0 14px 14px 0;
          background: rgba(255, 247, 237, 0.82);
          color: #5b4430;
        }

        .paper-style :global(blockquote.quote p) {
          margin: 0 0 8px 0;
        }

        .paper-style :global(blockquote.quote p:last-child) {
          margin-bottom: 0;
        }

        .paper-style :global(hr.divider) {
          margin: 20px 0;
          border: none;
          border-top: 1px solid rgba(117, 76, 40, 0.16);
        }

        .paper-style :global(strong) {
          font-weight: 700;
          color: #2f2118;
        }

        .paper-style :global(code) {
          display: inline-block;
          padding: 0 6px;
          border-radius: 999px;
          background: rgba(74, 45, 25, 0.08);
          color: #6b4c34;
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 0.92em;
        }

        .cursor {
          display: inline-block;
          width: 2px;
          height: 16px;
          margin-left: 2px;
          background: #8f5b2d;
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
