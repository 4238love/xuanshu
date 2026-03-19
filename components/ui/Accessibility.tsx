/**
 * 键盘快捷键Hook
 * 支持常用快捷键操作
 */

import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// 常用快捷键配置
export const commonShortcuts = {
  save: { key: 's', ctrl: true, description: '保存' },
  print: { key: 'p', ctrl: true, description: '打印' },
  copy: { key: 'c', ctrl: true, description: '复制' },
  refresh: { key: 'r', ctrl: true, description: '刷新' },
  help: { key: '?', shift: true, description: '帮助' },
  search: { key: 'f', ctrl: true, description: '搜索' },
  undo: { key: 'z', ctrl: true, description: '撤销' },
  redo: { key: 'z', ctrl: true, shift: true, description: '重做' }
};

// 快捷键帮助面板
interface ShortcutHelpProps {
  shortcuts: ShortcutConfig[];
  onClose: () => void;
}

export const ShortcutHelp: React.FC<ShortcutHelpProps> = ({ shortcuts, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">键盘快捷键</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700">{shortcut.description}</span>
                <div className="flex items-center gap-2">
                  {shortcut.ctrl && (
                    <kbd className="px-3 py-1.5 bg-white border border-gray-300 rounded shadow-sm text-sm font-mono">
                      Ctrl
                    </kbd>
                  )}
                  {shortcut.shift && (
                    <kbd className="px-3 py-1.5 bg-white border border-gray-300 rounded shadow-sm text-sm font-mono">
                      Shift
                    </kbd>
                  )}
                  {shortcut.alt && (
                    <kbd className="px-3 py-1.5 bg-white border border-gray-300 rounded shadow-sm text-sm font-mono">
                      Alt
                    </kbd>
                  )}
                  <kbd className="px-3 py-1.5 bg-white border border-gray-300 rounded shadow-sm text-sm font-mono">
                    {shortcut.key.toUpperCase()}
                  </kbd>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 提示：按 <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-xs">Shift</kbd> + <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-xs">?</kbd> 可随时打开此帮助面板
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 无障碍支持Hook
export function useAccessibility() {
  useEffect(() => {
    // 添加跳过导航链接
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = '跳到主内容';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded';
    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
    };
  }, []);
}

// 焦点管理Hook
export function useFocusTrap(ref: React.RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTab);
    };
  }, [ref, active]);
}
