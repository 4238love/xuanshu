'use client';

interface AnalysisResultProps {
  content: string;
  isStreaming?: boolean;
}

export default function AnalysisResult({ content, isStreaming = false }: AnalysisResultProps) {
  // 论文风格的排版渲染
  const renderContent = (text: string) => {
    if (!text) return '';

    // 按双换行符分割成段落
    const blocks = text.split(/\n\n+/);

    return blocks.map((block, blockIndex) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return '';

      // 一级标题
      if (trimmedBlock.startsWith('# ')) {
        const title = trimmedBlock.substring(2);
        return `<h1 class="title-1">${title}</h1>`;
      }

      // 二级标题
      if (trimmedBlock.startsWith('## ')) {
        const title = trimmedBlock.substring(3);
        return `<h2 class="title-2">${title}</h2>`;
      }

      // 三级标题
      if (trimmedBlock.startsWith('### ')) {
        const title = trimmedBlock.substring(4);
        return `<h3 class="title-3">${title}</h3>`;
      }

      // 有序列表
      if (trimmedBlock.match(/^\d+\. /m)) {
        const lines = trimmedBlock.split('\n').filter(line => line.trim());
        const items = lines.map(line => {
          const match = line.match(/^(\d+)\. (.*)$/);
          if (match) {
            let itemContent = match[2];
            itemContent = itemContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return `<li><span class="num">${match[1]}.</span> ${itemContent}</li>`;
          }
          return '';
        }).join('');
        return `<ol class="ordered">${items}</ol>`;
      }

      // 无序列表
      if (trimmedBlock.match(/^[-*] /m)) {
        const lines = trimmedBlock.split('\n').filter(line => line.trim());
        const items = lines.map(line => {
          let itemContent = line.replace(/^[-*] /, '');
          itemContent = itemContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return `<li>${itemContent}</li>`;
        }).join('');
        return `<ul class="unordered">${items}</ul>`;
      }

      // 普通段落
      let para = trimmedBlock;
      para = para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      para = para.replace(/\n/g, '<br/>');

      return `<p class="text">${para}</p>`;
    }).join('');
  };

  return (
    <div className="paper-style">
      <div
        dangerouslySetInnerHTML={{
          __html: renderContent(content) || (isStreaming ? '正在分析中...' : '暂无分析结果'),
        }}
      />

      {isStreaming && (
        <span className="cursor" />
      )}

      <style jsx>{`
        .paper-style {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
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
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
