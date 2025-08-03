import React, { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  minHeight = '300px'
}) => {
  const [selection, setSelection] = useState<[number, number] | null>(null);
  
  const insertFormat = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('rich-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setSelection([start, end]);
    
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    
    const newText = beforeText + prefix + selectedText + suffix + afterText;
    onChange(newText);
    
    // Set cursor position after format is applied
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = end + prefix.length;
    }, 0);
  };
  
  const formatters = [
    { 
      label: 'B', 
      action: () => insertFormat('**', '**'),
      title: 'Bold',
      className: 'font-bold'
    },
    { 
      label: 'I', 
      action: () => insertFormat('*', '*'),
      title: 'Italic',
      className: 'italic'
    },
    { 
      label: 'H2', 
      action: () => insertFormat('## '),
      title: 'Heading 2',
      className: 'font-bold'
    },
    { 
      label: 'H3', 
      action: () => insertFormat('### '),
      title: 'Heading 3', 
      className: 'font-bold text-sm'
    },
    { 
      label: '•', 
      action: () => insertFormat('- '),
      title: 'Bullet List',
      className: 'font-bold'
    },
    { 
      label: '1.', 
      action: () => insertFormat('1. '),
      title: 'Numbered List',
      className: 'font-bold'
    },
    { 
      label: 'Link', 
      action: () => insertFormat('[', '](url)'),
      title: 'Insert Link',
      className: 'underline'
    }
  ];
  
  return (
    <div className="border border-neon-purple/30 rounded-md overflow-hidden bg-dark-purple">
      <div className="bg-dark-purple-light px-3 py-2 border-b border-neon-purple/30 flex gap-2">
        {formatters.map((formatter, index) => (
          <button
            key={index}
            type="button"
            onClick={formatter.action}
            title={formatter.title}
            className={`px-2 py-1 text-sm rounded hover:bg-neon-purple/20 text-white ${formatter.className}`}
          >
            {formatter.label}
          </button>
        ))}
      </div>
      <textarea
        id="rich-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-dark-purple text-white focus:outline-none resize-none"
        style={{ minHeight }}
      />
      <div className="bg-dark-purple-light px-3 py-2 border-t border-neon-purple/30 text-xs text-gray-400">
        Supports Markdown formatting: **bold**, *italic*, ## heading, lists, and [links](url)
      </div>
    </div>
  );
};

export default RichTextEditor; 