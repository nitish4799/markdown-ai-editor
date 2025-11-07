'use client';
import { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import MarkdownEditor from './MarkdownEditor';
import ChatPanel from './ChatPanel';
import DiffViewer from './DiffViewer';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { usePersistence } from '@/hooks/usePersistence';
import { EditProposal, EditError } from '@/types';
import { validateEdit } from '@/utils/editValidation';

export default function SplitPane({ initialMarkdown }: { initialMarkdown: string }) {
  const [persistedMarkdown, setPersistedMarkdown] = usePersistence('markdown-content', initialMarkdown);
  const { state: markdown, setState: setMarkdown, undo, redo, canUndo, canRedo } = useUndoRedo(persistedMarkdown);
  const [currentProposal, setCurrentProposal] = useState<EditProposal | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'preview' | 'chat'>('preview');
  const [editError, setEditError] = useState<EditError | null>(null);

  const handleAcceptEdit = () => {
    if (!currentProposal) return;

    // Validate the edit before applying
    const validation = validateEdit(markdown, currentProposal);

    if (!validation.valid) {
      // Show error to user
      setEditError(validation.error!);
      return;
    }

    // Apply the valid edit
    setMarkdown(validation.newMarkdown!);
    setPersistedMarkdown(validation.newMarkdown!);
    setCurrentProposal(null);
    setEditError(null);
  };

  const handleRejectEdit = () => {
    setCurrentProposal(null);
    setEditError(null);
  };

  const handleUndoRedo = (action: 'undo' | 'redo') => {
    if (action === 'undo' && canUndo) {
      undo();
    } else if (action === 'redo' && canRedo) {
      redo();
    }
  };

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndoRedo('undo');
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleUndoRedo('redo');
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [canUndo, canRedo]);

  return (
    <div className="h-screen flex flex-col bg-[#1a1d2e]">
      {/* Toolbar */}
      <div className="flex-shrink-0 p-2 flex gap-2 md:gap-5 items-center justify-center bg-[#1a1d2e]">
        <button
          onClick={() => handleUndoRedo('undo')}
          disabled={!canUndo}
          className="inline-flex cursor-pointer items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium text-gray-300 bg-gray-700/50 border border-gray-600 rounded-md hover:bg-gray-600/50 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-[#1a1d2e] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-700/50 disabled:hover:border-gray-600 transition-all duration-150"
          aria-label="Undo"
          title="Undo (Ctrl+Z)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
          <span className="hidden sm:inline">Undo</span>
          <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-xs font-semibold text-gray-400 bg-gray-800 border border-gray-700 rounded">
            ⌘Z
          </kbd>
        </button>
        <button
          onClick={() => handleUndoRedo('redo')}
          disabled={!canRedo}
          className="inline-flex cursor-pointer items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium text-gray-300 bg-gray-700/50 border border-gray-600 rounded-md hover:bg-gray-600/50 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-[#1a1d2e] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-700/50 disabled:hover:border-gray-600 transition-all duration-150"
          aria-label="Redo"
          title="Redo (Ctrl+Y)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
          </svg>
          <span className="hidden sm:inline">Redo</span>
          <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-xs font-semibold text-gray-400 bg-gray-800 border border-gray-700 rounded">
            ⌘Y
          </kbd>
        </button>
      </div>

      {/* Error Banner - NEW! */}
      {editError && (
        <div className="flex-shrink-0 bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 flex items-start justify-between animate-in slide-in-from-top">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong className="font-semibold">Edit Error ({editError.type})</strong>
              <p className="mt-1 text-sm">{editError.message}</p>
            </div>
          </div>
          <button
            onClick={() => setEditError(null)}
            className="text-red-400 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1 transition-colors"
            aria-label="Close error message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Mobile Tab Navigation*/}
      <div className="flex-shrink-0 md:hidden border-b border-gray-700 bg-[#1a1d2e]">
        <div className="flex">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'text-blue-400 border-b-2 border-blue-500 bg-gray-800/50'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-blue-400 border-b-2 border-blue-500 bg-gray-800/50'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              AI Chat
            </div>
          </button>
        </div>
      </div>

      {/* Main Content - Takes remaining height */}
      <div className="flex-1 min-h-0">
        {currentProposal ? (
          <DiffViewer proposal={currentProposal} onAccept={handleAcceptEdit} onReject={handleRejectEdit} />
        ) : (
          <>
            {/* Mobile View - Tabs */}
            <div className="md:hidden h-full">
              {activeTab === 'preview' ? (
                <MarkdownEditor markdown={markdown} onMarkdownChange={setMarkdown} onTextSelect={setSelectedText} />
              ) : (
                <ChatPanel onEditProposal={setCurrentProposal} selectedText={selectedText} fullMarkdown={markdown} />
              )}
            </div>

            <div className="hidden md:block h-full">
              <PanelGroup direction="horizontal">
                <Panel defaultSize={50} minSize={30}>
                  <MarkdownEditor markdown={markdown} onMarkdownChange={setMarkdown} onTextSelect={setSelectedText} />
                </Panel>
                <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 active:bg-blue-600 transition-colors" />
                <Panel defaultSize={50} minSize={30}>
                  <ChatPanel onEditProposal={setCurrentProposal} selectedText={selectedText} fullMarkdown={markdown} />
                </Panel>
              </PanelGroup>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
