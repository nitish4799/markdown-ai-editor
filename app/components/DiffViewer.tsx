'use client';
import { useMemo } from 'react';
import { EditProposal } from '@/types';

interface DiffViewerProps {
  proposal: EditProposal;
  onAccept: () => void;
  onReject: () => void;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function highlightDifferences(oldText: string, newText: string): { oldHtml: string; newHtml: string } {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const oldHtml = oldLines
    .map((line, i) => {
      const escapedLine = escapeHtml(line);
      if (i >= newLines.length || line !== newLines[i]) {
        return `<span class="bg-red-100 dark:bg-red-900/30 px-1 -mx-1 block">${escapedLine || ' '}</span>`;
      }
      return escapedLine;
    })
    .join('\n');

  const newHtml = newLines
    .map((line, i) => {
      const escapedLine = escapeHtml(line);
      if (i >= oldLines.length || line !== oldLines[i]) {
        return `<span class="bg-green-100 dark:bg-green-900/30 px-1 -mx-1 block">${escapedLine || ' '}</span>`;
      }
      return escapedLine;
    })
    .join('\n');

  return { oldHtml, newHtml };
}

export default function DiffViewer({ proposal, onAccept, onReject }: DiffViewerProps) {
  const { oldHtml, newHtml } = useMemo(
    () => highlightDifferences(proposal.originalText, proposal.proposedText),
    [proposal.originalText, proposal.proposedText],
  );

  return (
    <div className="h-full flex flex-col bg-[#1a1d2e]">
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-gray-200">Proposed Changes</h3>
        <p className="text-sm text-gray-400 mt-1">{proposal.description}</p>
      </div>
      <div className="px-4 py-4 overflow-y-auto max-h-[70vh]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="sticky top-0 bg-[#1a1d2e] py-2 z-10 rounded-t-lg border-b border-gray-700">
              <h4 className="px-2 py-1 text-sm font-bold text-red-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                </svg>
                Original
              </h4>
            </div>
            <pre
              className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-sm font-mono whitespace-pre-wrap break-words leading-relaxed text-gray-300"
              dangerouslySetInnerHTML={{ __html: oldHtml }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="sticky top-0 bg-[#1a1d2e] py-2 z-10 rounded-t-lg border-b border-gray-700">
              <h4 className="px-2 py-1 text-sm font-bold text-green-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Modified
              </h4>
            </div>
            <pre
              className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-sm font-mono whitespace-pre-wrap break-words leading-relaxed text-gray-300"
              dangerouslySetInnerHTML={{ __html: newHtml }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0"></div>

      <div className="flex-shrink-0 flex justify-end gap-3 p-4 border-t border-gray-700 bg-[#1a1d2e]">
        <button
          onClick={onReject}
          className="px-5 py-2.5 cursor-pointer text-sm font-medium text-gray-300 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-600/50 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#1a1d2e] transition-colors duration-150"
        >
          Reject
        </button>
        <button
          onClick={onAccept}
          className="px-5 py-2.5 cursor-pointer text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1a1d2e] transition-colors duration-150 shadow-sm"
        >
          Accept Changes
        </button>
      </div>
    </div>
  );
}
