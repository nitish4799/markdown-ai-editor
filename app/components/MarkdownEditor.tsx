'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';

// Disable SSR for ReactMarkdown
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <div className="p-6 text-gray-500">Loading preview...</div>
});

interface MarkdownEditorProps {
  markdown: string;
  onMarkdownChange: (value: string) => void;
  onTextSelect: (text: string) => void;
}

export default function MarkdownEditor({ markdown, onMarkdownChange, onTextSelect }: MarkdownEditorProps) {
  const [selectedText, setSelectedText] = useState('');

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selected = selection?.toString() || '';
    
    if (selected !== selectedText) {
      setSelectedText(selected);
      onTextSelect(selected);
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleTextSelection);
    return () => {
      document.removeEventListener('selectionchange', handleTextSelection);
    };
  }, [selectedText]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-800">
      <div className="flex-shrink-0 editor-header bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Current MarkDown Preview</h3>
        {selectedText && (
          <span className="text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
            Selected: "{selectedText.substring(0, 30)}..."
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto preview-container prose dark:prose-invert max-w-none p-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
