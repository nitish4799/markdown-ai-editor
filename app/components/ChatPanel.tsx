'use client';
import { useState } from 'react';
import { EditProposal } from '@/types';

interface ChatPanelProps {
  onEditProposal: (proposal: EditProposal) => void;
  selectedText: string;
  fullMarkdown: string;
}

export default function ChatPanel({ onEditProposal, selectedText, fullMarkdown }: ChatPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'assistant'; content: string }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!prompt.trim() || isStreaming) return;

  setIsStreaming(true);
  setStreamedContent('');
  setChatHistory((prev) => [...prev, { type: 'user', content: prompt }]);

  try {
    const response = await fetch('https://hat8nsq5a9.execute-api.us-east-1.amazonaws.com/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        markdown: fullMarkdown,
        selectedText,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';
    let buffer = ''; 

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split('\n');
      
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          
          if (data === '[DONE]') {
            if (buffer.trim()) {
              try {
                const parsed = JSON.parse(buffer.slice(6).trim());
                if (parsed.content) {
                  accumulated += parsed.content;
                  setStreamedContent(accumulated);
                }
              } catch (e) {
                console.warn('Failed to parse final buffer:', e);
              }
            }
            break;
          }

          if (data) {
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulated += parsed.content;
                setStreamedContent(accumulated);
              }
            } catch (e) {
              console.warn('Skipping incomplete chunk:', data.substring(0, 50));
              continue;
            }
          }
        }
      }
    }

    if (buffer.trim() && buffer.startsWith('data: ')) {
      const data = buffer.slice(6).trim();
      if (data && data !== '[DONE]') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            accumulated += parsed.content;
            setStreamedContent(accumulated);
          }
        } catch (e) {
          console.warn('Failed to parse remaining buffer:', e);
        }
      }
    }

    const proposal: EditProposal = {
      id: Date.now().toString(),
      originalText: selectedText || fullMarkdown,
      proposedText: accumulated,
      description: prompt,
      requestId: Date.now().toString(),
    };

    setChatHistory((prev) => [...prev, { type: 'assistant', content: accumulated }]);
    onEditProposal(proposal);
    setPrompt('');
  } catch (error) {
    console.error('Streaming error:', error);
    let errorMessage = 'Sorry, I encountered an error processing your request.';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    setChatHistory((prev) => [
      ...prev,
      {
        type: 'assistant',
        content: errorMessage,
      },
    ]);

    onEditProposal({
      id: '',
      originalText: '',
      proposedText: '',
      description: '',
      requestId: '',
    });
  } finally {
    setIsStreaming(false);
    setStreamedContent('');
  }
};


  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          AI Editor Chat
        </h3>
        {selectedText && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-md inline-block">
            ✏️ Editing: "{selectedText.substring(0, 40)}..."
          </p>
        )}
      </div>

      {/* Chat History - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {chatHistory.length === 0 && !isStreaming && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start editing your document</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ask me to make changes, fix typos, or improve your content</p>
          </div>
        )}

        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[90%] min-w-[320px] rounded-lg p-4 shadow-sm ${
                message.type === 'user'
                  ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
              }`}
            >
              <div className="font-semibold text-xs mb-2 flex items-center gap-2 opacity-90">
                {message.type === 'user' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400">You</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>AI Assistant</span>
                  </>
                )}
              </div>
              <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                message.type === 'user' ? 'text-gray-800 dark:text-gray-200' : 'text-white'
              }`}>
                {message.content}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming Content - Enhanced UI with increased width */}
        {isStreaming && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[90%] min-w-[320px] rounded-lg p-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg relative overflow-hidden">
              {/* Animated shimmer background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" 
                   style={{ backgroundSize: '200% 100%' }} 
              />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="font-semibold text-xs mb-3 flex items-center gap-2">
                  <div className="relative">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                  </div>
                  <span>AI Assistant</span>
                </div>
                
                {/* Streamed content with typing cursor */}
                <div className="text-sm leading-relaxed min-h-[60px] mb-3">
                  {streamedContent || (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 bg-white/20 rounded w-3/4"></div>
                      <div className="h-3 bg-white/20 rounded w-full"></div>
                      <div className="h-3 bg-white/20 rounded w-5/6"></div>
                    </div>
                  )}
                  {streamedContent && (
                    <span className="inline-block w-[2px] h-4 bg-white ml-1 animate-blink"></span>
                  )}
                </div>
                
                {/* Loading indicator */}
                <div className="flex items-center justify-between pt-3 border-t border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-xs opacity-90">
                      {streamedContent ? 'Streaming...' : 'Thinking...'}
                    </span>
                  </div>
                  {streamedContent && (
                    <span className="text-xs opacity-75 tabular-nums">
                      {streamedContent.split(' ').length} words
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form - Fixed at bottom */}
      <form onSubmit={handleSubmit} className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-lg">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={selectedText ? 'Edit selected text...' : 'Ask me to edit your document...'}
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
                     transition-all duration-150"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isStreaming}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 cursor-pointer
              ${
                !prompt.trim() || isStreaming
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
              }`}
          >
            {isStreaming ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send
              </span>
            )}
          </button>
        </div>
        
        <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-md">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="font-medium">Try:</span> "fix typos", "make it more concise", "add bullet points"
          </div>
        </div>
      </form>
    </div>
  );
}
