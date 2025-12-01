// Text Editor Functionality
(function() {
  'use strict';

  function initTextEditor() {
    const textarea = document.querySelector('.editor-textarea');
    const charCount = document.querySelector('.char-count');
    const toolbarBtns = document.querySelectorAll('.toolbar-btn');

    if (!textarea) return;

    // Update character count
    function updateCharCount() {
      const text = textarea.value;
      const bytes = new Blob([text]).size;
      
      if (bytes < 1024) {
        charCount.textContent = `${bytes} B`;
      } else {
        charCount.textContent = `${(bytes / 1024).toFixed(1)} KB`;
      }
    }

    // Text formatting functions
    function wrapSelection(before, after = before) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      const beforeText = textarea.value.substring(0, start);
      const afterText = textarea.value.substring(end);

      if (selectedText) {
        textarea.value = beforeText + before + selectedText + after + afterText;
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = end + before.length;
      } else {
        const placeholder = '文字';
        textarea.value = beforeText + before + placeholder + after + afterText;
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + placeholder.length;
      }
      
      textarea.focus();
      updateCharCount();
    }

    function insertAtCursor(text) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const beforeText = textarea.value.substring(0, start);
      const afterText = textarea.value.substring(end);

      textarea.value = beforeText + text + afterText;
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
      updateCharCount();
    }

    function toggleList(ordered = false) {
      const start = textarea.selectionStart;
      const text = textarea.value;
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = text.indexOf('\n', start);
      const line = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd);

      const prefix = ordered ? '1. ' : '• ';
      
      if (line.trim().startsWith(prefix.trim()) || line.trim().match(/^\d+\.\s/)) {
        // Remove list formatting
        const newLine = line.replace(/^(\s*)(\d+\.\s|•\s)/, '$1');
        textarea.value = text.substring(0, lineStart) + newLine + text.substring(lineEnd === -1 ? text.length : lineEnd);
      } else {
        // Add list formatting
        const newLine = line.replace(/^(\s*)/, `$1${prefix}`);
        textarea.value = text.substring(0, lineStart) + newLine + text.substring(lineEnd === -1 ? text.length : lineEnd);
      }
      
      textarea.focus();
      updateCharCount();
    }

    // Toolbar button handlers
    toolbarBtns.forEach((btn) => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const title = this.getAttribute('title');

        switch(title) {
          case '粗體':
            wrapSelection('**');
            break;
          case '斜體':
            wrapSelection('*');
            break;
          case '刪除線':
            wrapSelection('~~');
            break;
          case '清單':
            toggleList(false);
            break;
          case '有序清單':
            toggleList(true);
            break;
          case '連結':
            const url = prompt('請輸入網址:');
            if (url) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const selectedText = textarea.value.substring(start, end) || '連結文字';
              const beforeText = textarea.value.substring(0, start);
              const afterText = textarea.value.substring(end);
              textarea.value = beforeText + `[${selectedText}](${url})` + afterText;
              updateCharCount();
            }
            break;
          case '表情符號':
            const emojis = ['😊', '👍', '❤️', '🎉', '✨', '🔥', '💡', '📝', '✅', '⚠️'];
            const emoji = prompt('選擇表情符號:\n' + emojis.join(' ') + '\n\n或輸入其他表情符號:');
            if (emoji) {
              insertAtCursor(emoji);
            }
            break;
          case '格式':
            // Heading toggle
            const start = textarea.selectionStart;
            const text = textarea.value;
            const lineStart = text.lastIndexOf('\n', start - 1) + 1;
            const lineEnd = text.indexOf('\n', start);
            const line = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd);
            
            if (line.startsWith('# ')) {
              const newLine = line.replace(/^#\s/, '');
              textarea.value = text.substring(0, lineStart) + newLine + text.substring(lineEnd === -1 ? text.length : lineEnd);
            } else {
              const newLine = '# ' + line;
              textarea.value = text.substring(0, lineStart) + newLine + text.substring(lineEnd === -1 ? text.length : lineEnd);
            }
            updateCharCount();
            break;
        }
      });
    });

    // Update count on input
    textarea.addEventListener('input', updateCharCount);

    // Keyboard shortcuts
    textarea.addEventListener('keydown', function(e) {
      // Ctrl/Cmd + B = Bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        wrapSelection('**');
      }
      // Ctrl/Cmd + I = Italic
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        wrapSelection('*');
      }
      // Tab = Insert spaces
      if (e.key === 'Tab') {
        e.preventDefault();
        insertAtCursor('  ');
      }
    });

    // Initialize
    updateCharCount();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTextEditor);
  } else {
    initTextEditor();
  }

  // Re-initialize on dynamic content load
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && 
            (node.classList?.contains('editor-textarea') || 
             node.querySelector?.('.editor-textarea'))) {
          initTextEditor();
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();

